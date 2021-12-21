import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Iterators } from 'fabric-shim';
import { ContextualPolicy, PolicyQuery } from "./contextualPolicy";
import { Attribute, InfoType, TxPrinciple } from './types';

@Info({
    title: 'PolicyAdminPoint',
    description: 'Smart contract for defining access policies.'
})
export class PolicyAdminPoint extends Contract {
    public static readonly POLICY_ID_KEY = "POL_ID"

    // Initialize a set of policies used for testing.
    @Transaction()
    public async InitPolicies(ctx: Context): Promise<void> {
        var policy1 = new ContextualPolicy();
        policy1.subject = "Alice";
        policy1.sender = "Hospital";
        policy1.recipients.attrs.push(Attribute.CAREGIVER);
        policy1.infoType.push(InfoType.LOW_SENSITIVITY);
        policy1.principle = TxPrinciple.NORMAL_CARE;
        policy1.allowed = true;

        const policies = [policy1];

        for (const policy of policies) {
            await this.CreatePolicy(ctx, policy);
            console.info(`Policy ${policy.id} initialized`);
        }
    }

    // CreatePolicy adds a policy to the world state with given details.
    @Transaction()
    public async CreatePolicy(ctx: Context, policy: ContextualPolicy): Promise<void> {
        policy.id = await this._GetNextPolicyID(ctx);
        const exists = await this.PolicyExists(ctx, policy.id);
        if (exists) {
            throw new Error(`A policy with ID ${policy.id} already exists. Please retry.`);
        }

        await this._SetLastPolicyID(ctx, policy.id);
        await ctx.stub.putState(policy.id, Buffer.from(JSON.stringify(policy)));

        console.info(`Policy ${policy.id} created`);
    }

    // DeletePolicy deletes an policy from the world state.
    @Transaction()
    public async DeletePolicy(ctx: Context, id: string): Promise<void> {
        const exists = await this.PolicyExists(ctx, id);
        if (!exists) {
            throw new Error(`The policy ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // PolicyExists returns true when a policy with the given id exists in world
    // state.
    @Transaction(false)
    @Returns('boolean')
    public async PolicyExists(ctx: Context, id: string): Promise<boolean> {
        let iterator = await ctx.stub.getQueryResult(`{"selector":{"docType":"${ContextualPolicy.DOC_TYPE}", "id":"${id}"}}`);
        let results = await this._GetAllResults(iterator);
        for (let res of results) {
            console.log(`Result: ${res}`)
            if (res.id == id) {
                return true;
            }
        }
        return false;
    }

    // GetAllPolicies returns all policies found in the world state.
    @Transaction(false)
    @Returns('ContextualPolicy[]')
    public async GetAllPolicies(ctx: Context): Promise<ContextualPolicy[]> {
        let iterator = await ctx.stub.getQueryResult(`{"selector":{"docType":"${ContextualPolicy.DOC_TYPE}"}}`);
        let allResults = await this._GetAllResults(iterator);
        return allResults;
    }

    // GetRelevantPolicies returns all policies relevant to a specific request.
    @Transaction(false)
    @Returns('ContextualPolicy[]')
    public async GetRelevantPolicies(ctx: Context, q: PolicyQuery): Promise<ContextualPolicy[]> {
        console.log(`Policy query JSON: ${JSON.stringify(q)}`);
        var and_selectors: any[] = [
            { "docType": ContextualPolicy.DOC_TYPE },
            { "subject": q.subject },
            { "sender": q.sender },
        ];
        if (q.infoType) {
            and_selectors.push({ "infoType": { "$elemMatch": { "$eq": q.infoType } } });
        }
        if (q.principle) {
            and_selectors.push({ "principle": q.principle });
        }

        var or_selectors = [];
        if (q.recipient_entity) {
            console.log("Adding entities selector.");
            or_selectors.push({
                "recipients.enties": {
                    "$elemMatch": {
                        "$eq": q.recipient_entity
                    }
                }
            });
        }
        if (q.recipient_attrs) {
            console.log("Adding attributes selector.");
            or_selectors.push({
                "recipients.attrs": {
                    "$elemMatch": {
                        "$in": q.recipient_attrs
                    }
                }
            })
        }
        if (or_selectors.length > 0) {
            console.log("Adding or selector(s).");
            and_selectors.push({ "$or": or_selectors });
        }

        var query = { "selector": { "$and": and_selectors } };

        console.log(`DB query JSON: ${JSON.stringify(query)}`);
        let iterator = await ctx.stub.getQueryResult(JSON.stringify(query))
        let allResults = await this._GetAllResults(iterator)
        return allResults;
    }

    async _SetLastPolicyID(ctx: Context, id: string): Promise<void> {
        await ctx.stub.putState(PolicyAdminPoint.POLICY_ID_KEY, Buffer.from(id));
        console.log(`Set last policy ID: ${id}`);
    }

    async _GetNextPolicyID(ctx: Context): Promise<string> {
        var raw_id = await ctx.stub.getState(PolicyAdminPoint.POLICY_ID_KEY);
        var last_id = raw_id.toString();
        if (!raw_id || !last_id) {
            console.log("No current max policy ID specified. Returning default.")
            return "1";
        }
        let next_id = (Number.parseInt(last_id) + 1).toString();
        console.log(`Returning next policy id: ${next_id}`);
        return next_id;
    }

    async _GetAllResults(iterator: Iterators.StateQueryIterator): Promise<ContextualPolicy[]> {
        let allResults: ContextualPolicy[] = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());
                try {
                    allResults.push(JSON.parse(res.value.value.toString()));
                } catch (err) {
                    console.log(err);
                }
            }
            res = await iterator.next();
        }

        iterator.close();
        console.log(`Query results: ${allResults}`);
        return allResults;
    }
}

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Iterators } from 'fabric-shim';
import { v4 as uuidv4 } from 'uuid';
import { ContextualPolicy } from "./contextualPolicy";
import { Attribute, InfoType, TxPrinciple } from './types';

@Info({
    title: 'PolicyAdminPoint',
    description: 'Smart contract for defining access policies.'
})
export class PolicyAdminPoint extends Contract {
    public static readonly POLICY_ID_KEY = "POL_ID"

    @Transaction()
    public async InitPolicies(ctx: Context): Promise<void> {
        var policy1 = new ContextualPolicy();
        policy1.id = uuidv4();
        policy1.subject = "Alice";
        policy1.sender = "Hospital";
        policy1.recipients.attrs.push(Attribute.CAREGIVER);
        policy1.infoType.push(InfoType.LOW_SENSITIVITY);
        policy1.principle = TxPrinciple.NORMAL_CARE;

        const policies = [policy1];

        for (const policy of policies) {
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await this.CreatePolicy(ctx, policy);
            console.info(`Attribute ${policy.id} initialized`);
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

        await ctx.stub.putState(policy.id, Buffer.from(JSON.stringify(policy)));
        await ctx.stub.putState(PolicyAdminPoint.POLICY_ID_KEY,
            Buffer.from((Number.parseInt(policy.id) + 1).toString()));
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
    @Returns('string')
    public async GetAllPolicies(ctx: Context): Promise<ContextualPolicy[]> {
        let iterator = await ctx.stub.getQueryResult(`{"selector":{"docType":"${ContextualPolicy.DOC_TYPE}"}}`);
        let allResults = await this._GetAllResults(iterator);
        return allResults;
    }

    async _GetNextPolicyID(ctx: Context): Promise<string> {
        var raw_id = await ctx.stub.getState(PolicyAdminPoint.POLICY_ID_KEY);
        if (!raw_id || raw_id.length < 4) {
            console.log("No current max policy ID specified. Returning default.")
            return "1";
        }
        let buffer = Buffer.from(raw_id);
        var max_id = buffer.readUInt8(0);
        return (max_id + 1).toString();
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
        return allResults;
    }
}

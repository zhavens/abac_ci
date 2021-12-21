import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { PolicyAdminPoint, PolicyInformationPoint } from '.';
import { AccessRequest } from './accessRequest';
import { PolicyQuery } from './contextualPolicy';

@Info({
    title: 'PolicyDecisionPoint',
    description: 'Smart contract for defining attributes of entities.'
})
export class PolicyDecisionPoint extends Contract {
    // ValidateRequest evaluates a given access request specified by a set of
    // contextual integrity parameters.
    @Transaction(false)
    @Returns('boolean0')
    public async ValidateRequest(ctx: Context, req: AccessRequest): Promise<boolean> {
        let pap = new PolicyAdminPoint();
        let pip = new PolicyInformationPoint();

        let recipient_attrs = await pip.GetEntityAttributions(ctx, req.recipient);

        var pq = new PolicyQuery();
        pq.subject = req.subject;
        pq.sender = req.sender;
        pq.recipient_entity = req.recipient;
        pq.recipient_attrs = recipient_attrs;
        pq.infoType = req.infoType;
        pq.principle = req.principle;

        let policies = await pap.GetRelevantPolicies(ctx, pq);

        if (!policies || policies.length == 0) {
            console.log("No policies found. Defaulting to rejecting access.")
            return false;
        }

        for (let policy of policies) {
            if (!policy.allowed) {
                console.log(`Access rejected by policy: ${JSON.stringify(policy)}`);
                return false;
            }
        }

        return true;
    }
}

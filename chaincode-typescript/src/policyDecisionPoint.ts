import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { PolicyAdminPoint, PolicyInformationPoint } from '.';
import { AccessRequest } from './types';

@Info({
    title: 'PolicyDecisionPoint',
    description: 'Smart contract for defining attributes of entities.'
})
export class PolicyDecisionPoint extends Contract {
    // AddAttribution issues a new attribute to the entity to the world state.
    @Transaction(false)
    public async ValidateRequest(ctx: Context, req: AccessRequest): Promise<boolean> {
        // 
        let pap = new PolicyAdminPoint();
        let pip = new PolicyInformationPoint();

        let sender_attrs = await pip.GetEntityAttributions(ctx, req.sender);
        let recipient_attrs = await pip.GetEntityAttributions(ctx, req.recipient);

        let policies = await pap.GetAllPolicies(ctx);

        return false
    }


}

import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { Iterators } from 'fabric-shim';
import { Attribution } from "./attribution";
import { Attribute, Entity } from './types';

@Info({
    title: 'PolicyInformationPoint',
    description: 'Smart contract for defining attributes of entities.'
})
export class PolicyInformationPoint extends Contract {

    // Initialize a set of Attributions used for testing.
    @Transaction()
    public async InitAttributions(ctx: Context): Promise<void> {
        const attributions: Attribution[] = [
            new Attribution('Alice', Attribute.PATIENT),
            new Attribution('Bob', Attribute.CAREGIVER),
            new Attribution('Carol', Attribute.PRIMARY_CARE),
            new Attribution('Doug', Attribute.SECONDARY_CARE),
            new Attribution('Doug', Attribute.RESEARCHER),
            new Attribution('Eth', Attribute.POWER_OF_ATTORNEY),
            new Attribution('Hospital', Attribute.INSTITUTION),
        ];

        for (const attribution of attributions) {
            await ctx.stub.putState(attribution.id,
                Buffer.from(JSON.stringify(attribution)));
            console.info(`Attribution ${attribution.id} initialized`);
        }
    }

    // AddAttribution issues a new attribute to the entity to the world state.
    @Transaction()
    public async AddAttribution(ctx: Context, entity: string, attr: Attribute): Promise<void> {
        const attribution = new Attribution(entity, attr);
        const exists = await this.AttributionExists(ctx, entity, attr);
        if (exists) {
            throw new Error(`The attribution ${attribution.id} already exists`);
        }


        await ctx.stub.putState(attribution.id, Buffer.from(JSON.stringify(attribution)));
        console.info(`Attribution ${attribution.id} added.`);
    }

    // RemoveAttribution deletes an given attribute from the world state.
    @Transaction()
    public async RemoveAttribution(ctx: Context, entity: string, attr: Attribute): Promise<void> {
        const attribution = new Attribution(entity, attr);
        const exists = await this.AttributionExists(ctx, entity, attr);
        if (!exists) {
            throw new Error(`The attribution ${attribution.id} does not exist`);
        }

        return ctx.stub.deleteState(attribution.id);
    }

    // AttributionExists returns true when attribute with given entity and attr
    // exists in world state.
    @Transaction(false)
    public async AttributionExists(ctx: Context,
        entity: string,
        attr: Attribute): Promise<boolean> {

        let iterator = await ctx.stub.getQueryResult(`{"selector":{"docType":"${Attribution.DOC_TYPE}", "entity":"${entity}", "attr":${attr}}}`);
        let results = await this._GetAllResults(iterator);
        for (let res of results) {
            if (res.entity == entity && res.attr == attr) {
                return true;
            }
        }
        return false;
    }

    // GetAllAttributes returns all attributes found in the world state.
    @Transaction(false)
    public async GetAllAttributions(ctx: Context): Promise<Attribution[]> {
        let iterator = await ctx.stub.getQueryResult(`{"selector":{"docType":"${Attribution.DOC_TYPE}"}}`);
        let allResults = await this._GetAllResults(iterator);
        return allResults;
    }

    // GetSubjectAttributes returns all attributes for a given subject.
    @Transaction(false)
    public async GetEntityAttributions(ctx: Context, entity: Entity): Promise<Attribute[]> {
        let iterator = await ctx.stub.getQueryResult(`{"selector":{"docType":"${Attribution.DOC_TYPE}", "entity":"${entity}"}}`);
        let allResults = await this._GetAllResults(iterator);
        return allResults.map(function (x) { return x.attr; });
    }

    // GetEntitiesWithAttribute returns all entities for a given attribute type.
    @Transaction(false)
    public async GetEntitiesWithAttribute(ctx: Context, attr: Attribute): Promise<Entity[]> {
        let iterator = await ctx.stub.getQueryResult(`{"selector":{"docType":"${Attribution.DOC_TYPE}", "attr":${attr}}}`);
        let allResults = await this._GetAllResults(iterator);
        return allResults.map(function (x) { return x.entity; });
    }

    // Parse attribution results from a db iterator.
    async _GetAllResults(iterator: Iterators.StateQueryIterator): Promise<Attribution[]> {
        let allResults: Attribution[] = [];
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

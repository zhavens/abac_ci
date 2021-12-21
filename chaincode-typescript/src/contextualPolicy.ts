import { Object, Property } from "fabric-contract-api";
import { Attribute, Entity, Identifiers, InfoType, TxPrinciple } from "./types";

@Object()
export class ContextualPolicy {
    public static readonly DOC_TYPE = "policy";

    @Property()
    public docType: string = ContextualPolicy.DOC_TYPE;

    @Property()
    public id: string = "";

    @Property()
    public subject: Entity = "";

    @Property()
    public sender: Entity = "";

    // @Property()
    public recipients: Identifiers = { entities: [], attrs: [] };

    // @Property()
    public infoType: InfoType[] = [];

    @Property()
    public principle: TxPrinciple = TxPrinciple.UNKNOWN;

    @Property()
    public allowed: boolean = false;

    constructor() { }
}

export class PolicyQuery {
    public subject: Entity;
    public sender: Entity;
    public recipient_entity: Entity = "";
    public recipient_attrs: Attribute[] = [];
    public infoType: InfoType = InfoType.UNKNOWN;
    public principle: TxPrinciple = TxPrinciple.UNKNOWN;
}

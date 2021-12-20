import { Object, Property } from "fabric-contract-api";

export enum Attribute {
    UNKNOWN,
    PATIENT,
    PRIMARY_CARE,
    SECONDARY_CARE,
    RESEARCHER,
    CAREGIVER,
    POWER_OF_ATTORNEY,
    INSURER,
    INSTITUTION,
}

export type Entity = string;

export type Identifiers = {
    entities: Entity[],
    attrs: Attribute[],
}

export enum InfoType {
    UNKNOWN,
    LOW_SENSITIVITY,
    HIGH_SENSITIVITY,
    HEALTH_PHYSICAL,
    HEALTH_MENTAL,
    PHARMACEUTICAL,
    FINANCIAL,
    PII,
    PATIENT_INTENT,
    PRIVACY,
}

export enum TxPrinciple {
    UNKNOWN,
    NORMAL_CARE,
    EMERGENCY,
    NON_DISCLOSING,
    BILLING,
    DELEGATION,
    ANONYMIZED,
}

@Object()
export class Attribution {
    public static readonly DOC_TYPE = "attribution"

    @Property()
    public docType: string = Attribution.DOC_TYPE;

    @Property()
    public id: string;

    @Property()
    public entity: Entity;

    @Property()
    public attr: Attribute;

    constructor(entity: Entity, type: Attribute) {
        this.entity = entity;
        this.attr = type;
        this.id = `${entity}|${type}`
    }
}

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

    @Property()
    public recipients: Identifiers = { entities: [], attrs: [] };

    @Property()
    public infoType: InfoType[] = [];

    @Property()
    public principle: TxPrinciple = TxPrinciple.UNKNOWN;

    @Property()
    public allowed: boolean = false;
}

@Object()
export class AccessRequest {
    public static readonly DOC_TYPE = "request";

    @Property()
    public docType: string = AccessRequest.DOC_TYPE;

    @Property()
    public subject: Entity = "";

    @Property()
    public sender: Entity = "";

    @Property()
    public recipient: Entity = "";

    @Property()
    public infoType: InfoType = InfoType.UNKNOWN;

    @Property()
    public principle: TxPrinciple = TxPrinciple.UNKNOWN;

    @Property()
    public approved: boolean = false;
}
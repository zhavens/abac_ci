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


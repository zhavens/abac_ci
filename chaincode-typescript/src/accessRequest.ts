import { Object, Property } from "fabric-contract-api";
import { Entity, InfoType, TxPrinciple } from "./types";


@Object()
export class AccessRequest {
    public static readonly DOC_TYPE = "request";

    @Property()
    public docType: string = AccessRequest.DOC_TYPE;

    @Property()
    public id: string = "";

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

    constructor() { }
}

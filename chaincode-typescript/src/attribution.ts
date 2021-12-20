import { Object, Property } from "fabric-contract-api";
import { Attribute, Entity } from "./types";


@Object()
export class Attribution {
    public static readonly DOC_TYPE = "attribution";

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
        this.id = `${entity}|${type}`;
    }
}

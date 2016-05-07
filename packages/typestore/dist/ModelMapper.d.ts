import { IModelMapper } from "./Types";
export declare class ModelMapper<M> implements IModelMapper<M> {
    private modelClazz;
    private modelAttrs;
    constructor(modelClazz: {
        new (): M;
    });
    private attr(key);
    toJson(o: M): string;
    toObject(o: M): Object;
    fromJson(json: string): M;
    fromObject(obj: Object): M;
}

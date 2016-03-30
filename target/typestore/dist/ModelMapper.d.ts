import { IModelMapper, IModel } from "./Types";
export declare class ModelMapper<M extends IModel> implements IModelMapper<M> {
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

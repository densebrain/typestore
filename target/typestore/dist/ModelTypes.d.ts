import { IModelOptions } from "./decorations/ModelDecorations";
export interface IModel {
    clazzType: string;
}
/**
 * Model definition
 */
export interface IModelType {
    options: IModelOptions;
    name: string;
    clazz: any;
}

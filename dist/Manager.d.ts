/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
import 'reflect-metadata';
import { IModelOptions, IAttributeOptions, IManagerOptions } from './Types';
export declare namespace Manager {
    /**
     * Set the manager options
     */
    function init(newOptions: IManagerOptions): void;
    /**
     * Register a model with the system
     *
     * @param clazzName
     * @param constructor
     * @param opts
     */
    function registerModel(clazzName: string, constructor: Function, opts: IModelOptions): void;
    function registerAttribute(target: any, propertyKey: string, opts: IAttributeOptions): void;
}

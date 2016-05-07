import 'reflect-metadata';
import Promise = require('./Promise');
import { IModelOptions, IModelAttributeOptions, IStore, IManagerOptions, IModelMapper } from './Types';
import { Repo } from "./Repo";
export declare namespace Manager {
    /**
     * Model registration map type
     */
    type TModelRegistrations = {
        [clazzName: string]: IModelOptions;
    };
    /**
     * Retrieve model registrations
     *
     * @returns {TModelRegistrations}
     */
    function getModelRegistrations(): TModelRegistrations;
    function findModelOptionsByClazz(clazz: any): IModelOptions;
    /**
     * Ref to aws client
     */
    let store: IStore;
    /**
     * Set the manager options
     */
    function init(newOptions: IManagerOptions): Promise<boolean>;
    /**
     * Start the manager and embedded store from options
     *
     * @returns {Bluebird<boolean>}
     */
    function start(): Promise<boolean>;
    /**
     * Reset the manager status
     *
     * @returns {Manager.reset}
     */
    function reset(): Promise<boolean>;
    /**
     * Register a model with the system
     *
     * @param clazzName
     * @param constructor
     * @param opts
     */
    function registerModel(clazzName: string, constructor: Function, opts: IModelOptions): void;
    /**
     * Register an attribute
     *
     * @param target
     * @param propertyKey
     * @param opts
     */
    function registerAttribute(target: any, propertyKey: string, opts: IModelAttributeOptions): void;
    /**
     * Get a repository for the specified model/class
     *
     * @param clazz
     * @returns {T}
     */
    function getRepo<T extends Repo<M>, M>(clazz: {
        new (): T;
    }): T;
    function getMapper<M>(clazz: {
        new (): M;
    }): IModelMapper<M>;
}

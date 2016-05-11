import 'reflect-metadata';
import './Globals';
import Promise = require('./Promise');
import { IStore, IManagerOptions, IModelMapper, IModel, IModelType, IManager, IPlugin } from './Types';
import { Repo } from "./Repo";
export declare namespace Manager {
    /**
     * Model registration map type
     */
    type TModelTypeMap = {
        [clazzName: string]: IModelType;
    };
    /**
     * Retrieve model registrations
     *
     * @returns {TModelTypeMap}
     */
    function getModels(): IModelType[];
    function getModel(clazz: any): IModelType;
    function getModelByName(name: string): IModelType;
    function getOptions(): IManagerOptions;
    function stores(): IStore[];
    /**
     * Set the manager options
     */
    function init(newOptions: IManagerOptions, ...newPlugins: IPlugin[]): Promise<IManager>;
    /**
     * Start the manager and embedded store from options
     *
     * @returns {Bluebird<boolean>}
     */
    function start(...models: any[]): Promise<IManager>;
    /**
     * Reset the manager status
     *
     * @returns {Manager.reset}
     */
    function reset(): Promise<IManager>;
    /**
     * Register a model with the system
     *
     * @param clazzName
     * @param constructor
     * @param opts
     */
    function registerModel(constructor: Function): void;
    /**
     * Get a repository for the specified model/class
     *
     * @param clazz
     * @returns {T}
     */
    function getRepo<T extends Repo<M>, M extends IModel>(clazz: {
        new (): T;
    }): T;
    function getMapper<M extends IModel>(clazz: {
        new (): M;
    }): IModelMapper<M>;
}

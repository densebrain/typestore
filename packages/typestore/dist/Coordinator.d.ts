import 'reflect-metadata';
import './Globals';
import Promise = require('./Promise');
import { IStorePlugin, ICoordinatorOptions, IModel, IModelType, ICoordinator, IPlugin } from './Types';
import { Repo } from "./Repo";
export declare namespace Coordinator {
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
    function getOptions(): ICoordinatorOptions;
    function stores(): IStorePlugin[];
    /**
     * Set the coordinator options
     */
    function init(newOptions: ICoordinatorOptions, ...newPlugins: IPlugin[]): Promise<ICoordinator>;
    /**
     * Start the coordinator and embedded store from options
     *
     * @returns {Bluebird<boolean>}
     */
    function start(...models: any[]): Promise<ICoordinator>;
    /**
     * Reset the coordinator status
     *
     * @returns {Coordinator.reset}
     */
    function reset(): Promise<ICoordinator>;
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
}

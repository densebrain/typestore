import 'reflect-metadata';
import './Globals';
import { IStorePlugin, ICoordinatorOptions, IModel, IModelType, ICoordinator, IPlugin } from './Types';
import { Repo } from "./Repo";
import { PluginEventType } from "./PluginTypes";
export declare type TModelTypeMap = {
    [clazzName: string]: IModelType;
};
export declare class Coordinator implements ICoordinator {
    private plugins;
    notify(eventType: PluginEventType, ...args: any[]): void;
    /**
     * Model registration map type
     */
    /**
     * Stores all registrations, enabling
     * them to be configured against a
     * changed client, multiple datasources,
     * utility scripts, etc
     *
     * @type {{}}
     */
    private modelMap;
    private models;
    /**
     * Retrieve model registrations
     *
     * @returns {TModelTypeMap}
     */
    getModels(): IModelType[];
    private findModel(predicate);
    getModel(clazz: any): IModelType;
    getModelByName(name: string): IModelType;
    /**
     * Default options
     */
    private options;
    getOptions(): ICoordinatorOptions;
    private initialized;
    private startPromise;
    private internal;
    started: boolean;
    private checkInitialized(not?);
    private checkStarted(not?);
    stores(): IStorePlugin[];
    /**
     * Set the coordinator options
     */
    init(newOptions: ICoordinatorOptions, ...newPlugins: IPlugin[]): Promise<ICoordinator>;
    /**
     * Start the coordinator and embedded store from options
     *
     * @returns {Bluebird<boolean>}
     */
    start(...models: any[]): Promise<ICoordinator>;
    stop(): Promise<ICoordinator>;
    /**
     * Execute function either immediately if
     * ready or when the starting Promise
     * completes
     *
     * @param fn
     */
    execute<T>(fn: Function): Promise<T>;
    stopPlugins(): Promise<void>;
    /**
     * Reset the coordinator status
     *
     * @returns {Coordinator.reset}
     */
    reset(): Promise<ICoordinator>;
    /**
     * Register a model with the system
     *
     * @param clazzName
     * @param constructor
     * @param opts
     */
    registerModel(constructor: Function): this;
    /**
     * Get a repository for the specified model/class
     *
     * @param clazz
     * @returns {T}
     */
    getRepo<T extends Repo<M>, M extends IModel>(clazz: {
        new (): T;
    }): T;
}

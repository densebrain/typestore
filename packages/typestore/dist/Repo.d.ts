import Promise = require('./Promise');
import { IModelOptions, IKeyValue, IModel } from "./Types";
export declare abstract class Repo<M extends IModel> {
    protected modelClazz: any;
    protected modelOpts: IModelOptions;
    constructor(modelClazz: {
        new (): M;
    });
    protected makeFinder(finderKey: string): void;
    protected setFinder(finderKey: string, finderFn: (...args) => any): void;
    /**
     * Not implemented
     *
     * @param args
     * @returns {null}
     */
    key(...args: any[]): IKeyValue;
    /**
     * Get one or more models with keys
     *
     * @param key
     * @returns {null}
     */
    get(key: IKeyValue): Promise<M>;
    /**
     * Save model
     *
     * @param o
     * @returns {null}
     */
    save(o: M): Promise<M>;
    /**
     * Remove a model
     *
     * @param key
     * @returns {null}
     */
    remove(key: IKeyValue): Promise<any>;
    /**
     * Count models
     *
     * @returns {null}
     */
    count(): Promise<number>;
}

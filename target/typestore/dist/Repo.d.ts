import Promise = require('./Promise');
import { IModelOptions, IKeyValue, IModel, IndexType, IRepoOptions } from "./Types";
export declare abstract class Repo<M extends IModel> {
    protected modelClazz: any;
    protected modelOpts: IModelOptions;
    protected repoOpts: IRepoOptions;
    constructor(repoClazz: any, modelClazz: {
        new (): M;
    });
    protected makeFinder(finderKey: string): void;
    /**
     * Set a finder function on the repo
     *
     * @param finderKey
     * @param finderFn
     */
    protected setFinder(finderKey: string, finderFn: (...args) => any): void;
    /**
     * Call out to the indexers
     *
     * @param type
     * @param models
     * @returns {Bluebird<boolean>}
     */
    index(type: IndexType, ...models: IModel[]): Promise<boolean>;
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

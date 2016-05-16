import 'reflect-metadata';
import { Repo, DefaultModel } from "typestore";
/**
 * Plain Jane super simple model
 */
export declare class IDBModel1 extends DefaultModel {
    id: string;
    createdAt: number;
    randomText: string;
    constructor();
}
export declare class IDBRepo1 extends Repo<IDBModel1> {
    constructor();
    findByRandomTest(text: string): Promise<IDBModel1[]>;
}

import 'reflect-metadata';
import { Repo, DefaultModel } from "typestore";
/**
 * Plain Jane super simple model
 */
export declare class SimpleModel1 extends DefaultModel {
    id: string;
    createdAt: number;
    randomText: string;
    constructor();
}
export declare class SimpleModel1Repo extends Repo<SimpleModel1> {
    constructor();
}

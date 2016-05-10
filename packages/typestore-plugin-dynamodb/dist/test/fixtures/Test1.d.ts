import 'reflect-metadata';
import { Promise, Repo, Types } from 'typestore';
export declare class Test1 extends Types.DefaultModel {
    constructor();
    id: string;
    createdAt: number;
    randomText: string;
}
export declare class Test1Repo extends Repo<Test1> {
    constructor();
    findByRandomText(text: string): Promise<Test1[]>;
}

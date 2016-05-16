import 'reflect-metadata';
import { Repo, DefaultModel } from 'typestore';
export declare class Test1 extends DefaultModel {
    constructor();
    id: string;
    createdAt: number;
    randomText: string;
}
export declare class Test1Repo extends Repo<Test1> {
    constructor();
    findByRandomText(text: string): Promise<Test1[]>;
}

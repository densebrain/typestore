import 'reflect-metadata';
import { Repo } from 'typestore';
export declare class Test1 {
    id: string;
    createdAt: number;
    randomText: string;
    constructor();
}
export declare class Test1Repo extends Repo<Test1> {
    constructor();
    findByRandomText(text: string): Promise<Test1[]>;
}

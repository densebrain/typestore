import 'reflect-metadata';
import { Repo, DefaultModel } from 'typestore';
export declare class CloudSearchTestModel extends DefaultModel {
    id: string;
    date: number;
    text: string;
    constructor();
}
export declare class CloudSearchTest1Repo extends Repo<CloudSearchTestModel> {
    constructor();
    /**
     * Create a simple external finder
     *
     * @param text
     * @returns {null}
     */
    findByText(text: string): Promise<CloudSearchTestModel[]>;
}

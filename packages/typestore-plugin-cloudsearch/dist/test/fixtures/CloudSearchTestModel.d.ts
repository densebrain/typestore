import 'reflect-metadata';
import { Promise, Repo, Types } from 'typestore';
import { CloudSearchProvider } from "../../CloudSearchProvider";
export declare const cloudSearchProvider: CloudSearchProvider;
export declare class CloudSearchTestModel extends Types.DefaultModel {
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

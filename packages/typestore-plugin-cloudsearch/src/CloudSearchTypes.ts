

export interface ICloudSearchOptions {

	/**
	 * This is the field in the in index where the model type is stored
	 */
	typeField?:string

	/**
	 * Endpoint for the cloudsearch domain
	 */
	endpoint:string

	/**
	 * Additional AWS options
	 */
	awsOptions?:any
}
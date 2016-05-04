import * as AWS from 'aws-sdk'
import * as Promise from 'bluebird'

export interface IAttributeOptions {
	name?:string
	type?:any
	partitionKey?:boolean
	sortKey?:boolean
	

}



export interface ITableOptions {
	tableName:string
}


export interface IModelOptions extends ITableOptions {
	clazzName?:string
	clazz?:any
	attrs?:IAttributeOptions[]
	tableDef?: AWS.DynamoDB.CreateTableInput
}

export interface IStore {
	init(manager:IManager,opts:IManagerOptions):Promise<boolean>
	start():Promise<boolean>
	stop():Promise<boolean>
	syncModels()
}

export interface IManagerOptions {
	store:IStore
	syncModels?: boolean
}

export interface IManager {
	getModelRegistrations():IModelOptions[]
	findModelOptionsByClazz(clazz:any):IModelOptions
	start():Promise<boolean>
	init(opts:IManagerOptions):Promise<boolean>
	reset():Promise<void>
	
}

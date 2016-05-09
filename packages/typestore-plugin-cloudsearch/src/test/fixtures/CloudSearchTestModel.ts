import 'reflect-metadata'
import {Promise,Log,Repo,Decorations,Types,DefaultKeyMapper} from 'typestore'
import {CloudSearchProvider} from "../../CloudSearchProvider";


const log = Log.create(__filename)
export const cloudSearchProvider = new CloudSearchProvider('http://localhost/2134')

@Decorations.ModelDescriptor({tableName:'testTable1'})
export class CloudSearchTestModel extends Types.DefaultModel {

	@Decorations.AttributeDescriptor({name:'id',hashKey:true})
	id:string

	@Decorations.AttributeDescriptor({})
	date:number


	@Decorations.AttributeDescriptor({})
	text:string

	constructor() {
		super()
		log.info(`constructor for ${(this.constructor as any).name}`)
	}
}




@Decorations.RepoDescriptor({
	indexers: [{
		indexer: cloudSearchProvider,
		fields: ['id', 'text', 'date']
	}]
})
export class CloudSearchTest1Repo extends Repo<CloudSearchTestModel> {

	constructor() {
		super(CloudSearchTestModel)
	}

	/**
	 * Create a simple external finder
	 *
	 * @param text
	 * @returns {null}
	 */
	@Decorations.FinderDescriptor({
		searchOptions: {
			resultType: Object,
			resultKeyMapper: DefaultKeyMapper<Object>('id'),
			provider: cloudSearchProvider
		}
	})
	findByText(text:string):Promise<CloudSearchTestModel[]> {
		return null
	}
}

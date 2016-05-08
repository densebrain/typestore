
import {IModelMapper, IModelAttributeOptions, IModel} from "./Types";
import {TypeStoreAttrKey} from "./Constants";

const JSONFormattingSpace = (process.env.NODE_ENV !== 'production') ? 4 : 0

export class ModelMapper<M extends IModel> implements IModelMapper<M> {


	private modelAttrs:IModelAttributeOptions[]


	constructor(private modelClazz:{new():M}) {
		this.modelAttrs = Reflect.getMetadata(TypeStoreAttrKey,this.modelClazz)
	}

	private attr(key:string) {
		for (let it of this.modelAttrs) {
			if (it.name === key) {
				return it
			}
		}

		return null
	}

	toJson(o:M):string {
		return JSON.stringify(o,(key,value) => {
			return (!this.attr(key)) ? undefined : value
		},JSONFormattingSpace)
	}

	toObject(o:M):Object {
		const obj = {}
		for (let key of Object.keys(o)) {
			if (this.attr(key))
				obj[key] = o[key]
		}

		return obj
	}


	fromJson(json:string):M {
		const jsonObj = JSON.parse(json,(key,value) => {
			return (!this.attr(key)) ? undefined : value
		})

		const o = new this.modelClazz()
		Object.assign(o,jsonObj)

		return o
	}

	fromObject(obj:Object):M {
		const o = new this.modelClazz()
		for (let key of Object.keys(obj)) {
			if (this.attr(key))
				o[key] = obj[key]
		}

		return o
	}
}

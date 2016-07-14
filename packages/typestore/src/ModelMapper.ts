
import {IModelMapper, IModel} from "./Types";
import {TypeStoreAttrKey, TypeStoreModelKey} from "./Constants";
import {IModelAttributeOptions, IModelOptions} from "./decorations/ModelDecorations";

const JSONFormattingSpace = (process.env.NODE_ENV !== 'production') ? 4 : 0

export class ModelMapper<M extends IModel> implements IModelMapper<M> {


	private modelAttrs:IModelAttributeOptions[]
	private modelOpts:IModelOptions

	constructor(private modelClazz:{new():M}) {
		this.modelOpts = Reflect.getMetadata(TypeStoreModelKey,this.modelClazz)
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

	private attrTransient(key:string) {
		const attr = this.attr(key)
		return (
			this.modelOpts &&
			this.modelOpts.transientAttrs &&
			this.modelOpts.transientAttrs.includes(key)
		) || (
			attr && attr.transient === true
		)
	}

	private attrPersists(key:string) {
		return !this.attrTransient(key) && (this.modelOpts.onlyMapDefinedAttributes !== true || this.attr(key))
	}

	toJson(o:M):string {
		return JSON.stringify(o,(key,value) => {
			return (this.attrPersists(key)) ? value : undefined
		},JSONFormattingSpace)
	}

	toObject(o:M):Object {
		const obj = {}
		const keys = Object.keys(o)

		// Make sure key list is complete in case
		// of definited props
		for (let modelAttr of this.modelAttrs) {
			const included = keys.includes(modelAttr.name)
			if (modelAttr.transient && included)
				keys.splice(keys.indexOf(modelAttr.name),1)
			else if (!included)
				keys.push(modelAttr.name)
		}
		for (let key of keys) {
			if (this.attrPersists(key))
				obj[key] = o[key]
		}


		return obj
	}


	fromJson(json:string,decorator = null):M {
		const jsonObj = JSON.parse(json,(key,value) => {
			return (!this.attrPersists(key)) ? undefined : value
		})

		const o = new this.modelClazz()
		Object.assign(o,jsonObj)
		if (decorator)
			return decorator(jsonObj,o)

		return o
	}

	fromObject(obj:Object,decorator = null):M {
		const o = new this.modelClazz()
		for (let key of Object.keys(obj)) {
			if (this.attrPersists(key))
				o[key] = obj[key]
		}

		if (decorator)
			return decorator(obj,o)

		return o
	}
}

const mapperCache = new WeakMap<any,IModelMapper<IModel>>()

export function getDefaultMapper<T extends IModel>(clazz:{new():T}):IModelMapper<T> {
	let mapper = mapperCache.get(clazz) as IModelMapper<T>

	if (!mapper) {
		mapper = new ModelMapper(clazz)
		mapperCache.set(clazz,(mapper))
	}

	return mapper

}
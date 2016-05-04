
import 'reflect-metadata'

import * as _ from 'lodash'
import * as Log from './log'

import {Manager} from './Manager'
import {ITableOptions,IModelOptions,IAttributeOptions} from './Types'

const log = Log.create('ModelDecorations')

/**
 * Decorate a specified class, making it a
 * PersistableModel
 *
 * Set process.env.DYNO_SKIP to true in order to skip
 * decorations - useful in dual purpose classes,
 * in webpack use DefinePlugin
 */
export function ModelDescriptor(opts:IModelOptions) {
	if (!process.env.DYNO_SKIP) {



		return function(constructor:Function) {
			// Make sure everything is valid
			_.defaults(opts,{
				clazzName: (constructor as any).name
			})


			log.debug('Decorating: ', opts.clazzName)
			Manager.registerModel(opts.clazzName,constructor,opts as IModelOptions)
		}

	}
}



export function AttributeDescriptor(opts: IAttributeOptions) {

	return function (target:any,propertyKey:string) {
		Manager.registerAttribute(target,propertyKey,opts)
	}


}






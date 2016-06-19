import {PouchDBAttributePrefix,PouchDBReservedFields} from './PouchDBConstants'

const attrRegex = new RegExp(`^${PouchDBAttributePrefix}\\.`,'g')

export function cleanFieldPrefixes(fields:string[]) {
	return fields.map(field => field.replace(attrRegex,''))
}


export function filterReservedFields(fields:string[]) {
	return fields.filter(field => !PouchDBReservedFields.includes(field))
}

export function mapAttrsToField(fields:string[]) {
	return cleanFieldPrefixes(filterReservedFields(fields))
		.map(field => `${PouchDBAttributePrefix}${field}`)
}
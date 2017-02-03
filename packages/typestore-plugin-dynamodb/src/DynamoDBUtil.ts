

import {TableStatus} from "./DynamoDBTypes";
import * as _ from 'lodash'
import * as AWS from 'aws-sdk'

export function typeToDynamoType(type:any, typeName:string = null) {
	return (type === String || typeName === 'String') ? 'S' : //string
		(type === Number || typeName === 'Number') ? 'N' :  //number
			(type === Array || typeName === 'Array') ? 'L' : // array
				'M' //object
}

export function tableNameParam(TableName:string):AWS.DynamoDB.DescribeTableInput {
	return {TableName}
}




export function isTableStatusIn(status:string|TableStatus, ...statuses) {
	if (_.isString(status)) {
		status = TableStatus[status]
	}
	return _.includes(statuses, status)
}

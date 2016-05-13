

// import * as Bluebird from 'bluebird'
// declare var Promise:Bluebird<any>
//
// interface Bluebird<R> {
//
// }
//
// declare namespace bluebird {
// 	var Promise:Bluebird<any>
// }
//declare var BBPromise:Function

//
//


declare module NodeJS  {
	interface Global {
		getLogger:Function
	}
}

declare var getLogger:Function
import * as assert from 'assert'

export const Strings = {
	BadMessageKey: 'Bad Message Key: ?0',

	ManagerFailedToStart: 'Coordinator failed to start',
	ManagerErrorFn: 'Coordinator Function failed ?0',
	ManagerInitialized: 'Coordinator is already initialized',
	ManagerNotInitialized: 'Coordinator not initialized',
	ManagerSettled: 'Coordinator is settled',
	ManagerNotSettled: 'Coordinator not settled',
	ManagerInitComplete: 'dont forget to start when models are prepared, start triggers model prep, including table create',
	ManagerNoSyncModels: 'Create tables is disabled, nothing to prepare',
	ManagerOnlyOneKeyType: 'An attribute can only have 1 key type ?0',
	ManagerTypeStoreRequired: 'TypeStore required on options',
	PromiseUnhandledRejection: 'Unhandled promise rejection ?0',
	PromiseRejected: 'Handled rejection - just for debugging/tracing'
}

/**
 * Retrieve a message with placeholders
 * replaced
 *
 * @param key
 * @param args
 * @returns {any} an array of values, the index in the rest args
 *  starting at 0 maps to the string with ?0, ?1 ... ?n
 */
export function msg(str, ...args) {
	if (!str) {
		str = Strings.BadMessageKey
		args.splice(0,0,str)
	}

	args.forEach((arg,index) => {
		str = str.replace(new RegExp(`\\?${index}`),arg)
	})

	return str
}

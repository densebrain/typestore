



export class NotImplementedError extends Error {
	constructor(name:string) {
		super(name)
	}
}

export class IncorrectKeyTypeError extends Error {
	constructor(name:string) {
		super(name)
	}
}

export function NotImplemented(name:string) {
	if (name)
		throw new NotImplementedError(name)

	return null
}

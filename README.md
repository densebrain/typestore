TypeStore
---
_Statically typed model persistence for TypeScript, totally pluggable_

[![Circle CI](https://circleci.com/gh/densebrain/typestore/tree/master.svg?style=shield)](https://circleci.com/gh/densebrain/typestore/tree/master)


_TypeStore_ by itself won't get you very far, you'll
need a store to persist your data too.  Implementing a store is
really simple in-case you don't one of the out of the box
stores that already exist.

Installation
---

#### Install (Core)
_note: reflect-meta-data package is required_

```bash
npm i --save typestore
```

#### Install Plugin (Storage - DynamoDB)

for the sake of this example lets use AWS DynamoDB

```bash
npm i --save typestore-plugin-dynamodb
```

#### Another Plugin (Indexing - CloudSearch)

As an example of how far you can take this - let's drop
in cloudsearch.

```bash
npm i --save typestore-plugin-cloudsearch
```

Usage
---

This is going to be short for now

#### Setup a Model + Repo

**Model+Repo.ts**
```javascript
import 'reflect-metadata'
import {
	Promise,
	Log,
	Repo,
	Decorations,
	Types,
	ModelDescriptor,
	AttributeDescriptor,
	RepoDescriptor,
	FinderDescriptor
} from 'typestore'

// You can extend DefaultModel, but that's up to you -
// as long as you adhere to the IModel interface the system wont care
@ModelDescriptor({tableName:'testTable1'})
class MyModel extends DefaultModel {

	constructor() {
		super()
	}

	@AttributeDescriptor({name:'id',hashKey:true})
    id:string

    @AttributeDescriptor({name:'createdAt',rangeKey:true})
    createdAt:number


    @AttributeDescriptor({
        name:'randomText',
        index:{
            name: 'RandomTextIndex'
        }
    })
    randomText:string
}

@RepoDescriptor()
export class MyRepo extends Repo<MyModel> {

	constructor() {
		super(MyModelRepo,MyModel)
	}

	@DynamoDBFinderDescriptor({
		queryExpression: "randomText = :randomText",
		index: 'RandomTextIndex',
		// values could be ['randomText'] with the same effect
		values: function(...args) {
			return {
				':randomText': args[0]
			}
		}
	})
	@FinderDescriptor()
	findByRandomText(text:string):Promise<MyModel[]> {
		// Finders can be totally empty
		// The Repo will replace the method
		// If TSC emitted abstracted classes
		// or interfaces then no body would be
		// needed at all
		return null
	}
}

```


#### Initialize and use it

```javascript

import {Manager} from 'typestore'
import {DynamoDBStore} from 'typestore-plugin-dynamodb'
import {MyModel,MyRepo} from './Model+Repo'

const store = new DynamoDBStore()

// Used for DynamoDB Local - Obviously not needed for the real thing
const DynamoDBLocalEndpoint = 'http://localhost:8000'

const opts:IDynamoDBManagerOptions = {

	//Dynamo store specific options
	dynamoEndpoint: DynamoDBLocalEndpoint,

	// Add a prefix to my tables
	prefix: `dev_`,

	// Automatically create tables/models if
	// they dont exist
	syncStrategy: SyncStrategy.Update,

	// The actual store
	store
}

Manager.init(opts)
	.then(() => {
		// Pass your models in as REST args
		Manager.start(MyModel)
	})

// All of the Promise infrastructure used is
// bluebird - SO - if you want to get jiggy with it
// you could do something like this

Manager.init(opts).call('start',MyModel)


// Its all ready to go
const model = new MyModel()
model.id = '123124'
model.createdAt = new Date().getTime()
model.randomText = 'asdfasdfadsf'

const repo = Manager.getRepo(MyRepo)

// Save the model - create/update are synonymous in
// TypeStore - so only save matters
repo.save(model)
	.then(() =>  repo.get(repo.key(model.id)))
	.then((sameModel) => {
		if (sameModel.id !== model.id)
			throw new Error('You did something WRONG - naughty!')

		return repo.findByRandomTest(model.randomText)
	})
	.then((finderModels) => {
        if (finderModels.length !== 1 || finderModels[0].id !== model.id)
            throw new Error('You did something WRONG - naughty!')

        return repo.remove(repo.key(model.id))
    })
    .then(() => repo.findByRandomTest(model.randomText))
    .then((finderModels) => {
		if (finderModels.length !== 0)
	        throw new Error('You did something WRONG - naughty!')
	})
```






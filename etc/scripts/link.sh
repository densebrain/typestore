#!/bin/bash -e

MODS="typestore typestore-mocks typestore-plugin-indexeddb typestore-plugin-dynamodb typestore-plugin-cloudsearch typestore-plugin-pouchdb"

for pkg in ${MODS}
do
	echo "Linking ${pkg}"
	pushd packages/${pkg}
	npm link
	popd
done

echo "Linking root typestore dep"
rm -Rf $PWD/node_modules/typestore
ln -fs $PWD/packages/typestore $PWD/node_modules/typestore
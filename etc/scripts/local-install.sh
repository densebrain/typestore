#!/bin/bash -e

echo "Removing all deps first"
rm -Rf $(find . -name node_modules)

echo "Linking required mods"
npm link typelogger

echo "Installing deps"
npm i

echo "Compiling"
gulp compile

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
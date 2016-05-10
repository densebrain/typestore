#!/usr/bin/env bash

function installPackage() {
	link=$2

	echo "Installing package $1"
	pushd packages/$1
	npm install
	echo "Installed"

	if [ "$link" == "true" ]; then
		echo "Linking package $1"
		npm link
	fi
	popd

	if [ "$link" == "true" ]; then
		echo "Linking to top level modules"
		npm link $1
	fi

	echo "Prepared $1"
}

echo "Cleaning existing links"
rm -Rf node_modules/typestore*

echo "Installing Packages"
installPackage "typestore" true
installPackage "typestore-mocks" true
installPackage "typestore-plugin-dynamodb"
installPackage "typestore-plugin-cloudsearch"

echo "Ready to Code"

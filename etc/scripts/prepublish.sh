#!/usr/bin/env bash

TS_VERSION=2.1.0-dev.20160914
echo "Using TypeScript version ${TS_VERSION} for build"

# Make sure the latest typescript is installed
npm i typescript@${TS_VERSION}

# Create TS Config
gulp tsconfig

link_disabled=true

# INSTALL DEPENDENCIES
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

	if [ "$link_disabled" != "true" ]; then
		if [ "$link" == "true" ]; then
			echo "Linking to top level modules"
			npm link $1
		fi
	fi

	echo "Prepared $1"
}

# CLEAN CURRENT LINKS
echo "Cleaning existing links"
rm -Rf node_modules/typestore*

echo "Installing Packages"
for pkg in $(ls packages); do
	echo "Going to install $pkg"
	installPackage "${pkg}"
done

#installPackage "typestore" true
#installPackage "typestore-mocks" true
#installPackage "typestore-plugin-dynamodb"
#installPackage "typestore-plugin-cloudsearch"



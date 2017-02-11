require("../global-env")


exec(`mocha ${process.argv.includes('--watch') ? '--watch' : ''} -r etc/mocha/mocha-setup.js \"packages/*/dist/**/*.spec.js\"`)
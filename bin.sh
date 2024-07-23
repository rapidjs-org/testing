#!/bin/bash


[ ! -d ./packages/test/build ] && npm run debug

node ./packages/test/build/cli/cli.js $@
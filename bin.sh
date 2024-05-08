#!/bin/bash


[ ! -d ./packages/core/build ] && npm run compile

node ./packages/core/build/cli/cli.js $@
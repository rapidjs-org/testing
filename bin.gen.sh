#!/bin/bash


[ ! -d ./packages/core/build ] && npm run compile -w @t-ski/core

node ./packages/core/build/cli/cli.gen.js $@
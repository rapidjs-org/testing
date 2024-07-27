#!/bin/bash


[ ! -d ./packages/testing/build ] && npm run build

node $(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)/packages/testing/build/cli/cli.js $@
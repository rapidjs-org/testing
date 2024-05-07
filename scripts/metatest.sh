#!/bin/bash


echo -e "Test of test framework)\n"

./bin.sh unit ./metatest/uni.test.js
./bin.sh request ./metatest/request/
./bin.sh browser ./metatest/browser.test.js
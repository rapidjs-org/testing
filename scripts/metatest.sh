#!/bin/bash


echo "• $(tput bold)TEST OF TEST FRAMEWORK$(tput sgr0) (METATEST)"

./bin.sh unit ./metatest/unit.test.js       \
&& ./bin.sh request ./metatest/request/     \
&& ./bin.sh dom ./metatest/dom.test.js      \
\
&& echo -e "\n✔ $(tput bold)SUCCESS$(tput sgr0)\n"
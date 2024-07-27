#!/bin/bash


echo "$(tput bold)[METATEST]$(tput sgr0) TEST OF TESTING FRAMEWORK"

cd $(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)/../

    ./bin.sh unit ./metatest/unit.test.js           \
&&  ./bin.sh http ./metatest/http/                  \
                                                    \
&& echo -e "\n✔ $(tput bold)SUCCESS$(tput sgr0)\n"
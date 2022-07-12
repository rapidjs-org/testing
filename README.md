# no-fuss

No-brainer TDD of Java- and TypeScript applications. Simple and straightforward.

``` js
const util = require("../src/utilities");

const vcTest = new UnitTest(util.compare, "Value comparisons");

vcTest
.case(1, 1)
.for(true,
    "Compare value and type identical objects");

vcTest
.case(1, "1")
.for(false,
    "Compare value identical, but type different objects");

vcTest
.case(1, 2)
.for(false,
    "Compare value different, but type identical objects");
```

## Installation

``` cli
npm i -G @t-ski/no-fuss
```

## Usage

``` cli
no-fuss <path-to-test-directory> [(--timeout-length|-T)=3000]
```

| Parameter | Description |
| --------- | ----------- |
| --timeout | Test case timeout in ms |

## Test files

// TODO: Dir, files

## Generic test anatomy

## Unit tests

// TODO

## Network tests

// TODO

## Setup

// TODO

## Events

// TODO
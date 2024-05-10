# OTES

![GitHub project type](https://img.shields.io/badge/test%20framework-A074E7)
&ensp;
![GitHub package.json version](https://img.shields.io/github/package-json/v/t-ski/otes)

Contextual (a)sync-uniform testing framework built for simplicity.

## Install

``` cli
npm install -D t-ski/otes
```

## Usage

``` cli
npx otes <suite> <path>
```

``` cli
npx otes unit 
```

### Official Suites

| Name (Alias) | Purpose | Underlying Package |
| :- | :- | :- |
| `unit` | Unit testing ([Read Documentation](./packages/@unit/README.md)) | t-ski/otes--unit |
| `http` | HTTP(S) testing ([Read Documentation](./packages/@http/README.md)) | t-ski/otes--http |
| `dom` | DOM testing ([Read Documentation](./packages/@dom/README.md)) | t-ski/otes--dom |

## 

<sub>© Thassilo Martin Schiepanski</sub>
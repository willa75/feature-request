# Feauture Request

This is an example repo of how to build out things using TDD approach (which I probably could have talked about more, but [here](https://www.obeythetestinggoat.com/book/pre-requisite-installations.html) is a link for more info).


## Setup and Deploy

```sh
npm i
npm run sls deploy
```

For tests... (removed the count on requests for now until I implement a better query)

```sh
npm run export-env
npm run test:e2e
npm run test:int
npm run test:all
```

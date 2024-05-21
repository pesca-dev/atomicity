# npm run build && cd example && npm i && npm run serve
alias b := build
alias l := lint
alias w := watch

build:
    npm run build

lint:
    npm run lint

watch:
    npm run watch

bundle: 
    npm pack

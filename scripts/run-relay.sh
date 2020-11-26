#!/bin/bash
if [ ! -e "schema.graphql" ]; then
  yarn run convert-schema-to-sdl
fi
./node_modules/nodemon/bin/nodemon.js --exec yarn run relay
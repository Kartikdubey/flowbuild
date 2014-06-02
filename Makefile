#!/bin/bash
MOCHA=node_modules/.bin/mocha
TESTS=$(shell find -path "*/test/*.js" -not -path "*node_modules/*")

test:
	$(MOCHA) -R spec $(TESTS)

.PHONY: test

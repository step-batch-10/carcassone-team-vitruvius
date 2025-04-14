#!/bin/sh
chmod u+x ./hooks/pre-commit
cp ./hooks/pre-commit .git/hooks
deno add jsr:@std/assert
deno add jsr:@std/testing

echo "--------------------------repo initialised---------------------------"
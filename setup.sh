#!/bin/sh
chmod u+x ./hooks/pre-commit
cp ./hooks/pre-commit .git/hooks
deno init

echo "--------------------------repo initialised---------------------------"
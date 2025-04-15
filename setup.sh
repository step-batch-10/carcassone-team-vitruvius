#! /bin/bash

chmod u+x ./hooks/pre-commit
cp ./hooks/pre-commit .git/hooks
deno init

echo "--------------------------repo initialized---------------------------"
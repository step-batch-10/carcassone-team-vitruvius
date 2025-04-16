#! /bin/bash

chmod u+x ./hooks/pre-commit
cp ./hooks/pre-commit .git/hooks

echo "--------------------------repo initialized---------------------------"
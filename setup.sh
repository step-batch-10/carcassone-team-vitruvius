#! /bin/bash

chmod u+x ./hooks/pre-commit
chmod u+x ./hooks/pre-push
cp ./hooks/pre-commit .git/hooks
cp ./hooks/pre-push .git/hooks

echo "--------------------------repo initialized---------------------------"  
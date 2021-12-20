./network.sh down
./network.sh up createChannel -s couchdb
./network.sh deployCC -ccn policy -ccp ../chaincode-typescript/ -ccl typescript
export $(./set_env.sh Org1 | xargs)
./init.sh


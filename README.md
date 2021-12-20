# abac_ci
Attribute-Based Access Control (ABAC) with Contextual Integrity (CI)

Heavliy leverages the test Fabric network provided by Hyperledger: [link](https://hyperledger-fabric.readthedocs.io/en/latest/install.html#install-fabric-and-fabric-samples)

## Dependencies

```shell
$ npm install fabric-contract-api
```

## Starting the Environment

```shell
$ cd test-network

# Start the peers as Docker containers backed by LevelDB, and create a channel
# called "default".
$ ./network.sh up -s couchdb createChannel -c default

# Add all the relevant environment variables locally.
$ export $(./set_env.sh Org1 | xargs)

$ ./network.sh deployCC -c default -ccn policy -ccp ../chaincode-typescript
    -ccl typescript

$ peer chaincode invoke -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com --tls \
    --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
    --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
    --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
    -C mychannel -n policy -c '{"function":"InitAttributes","Args":[]}'
```



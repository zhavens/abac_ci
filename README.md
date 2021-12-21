# abac_ci
Attribute-Based Access Control (ABAC) with Contextual Integrity (CI)

Heavliy leverages the test Fabric network provided by Hyperledger: [link](https://hyperledger-fabric.readthedocs.io/en/latest/install.html#install-fabric-and-fabric-samples)

## Dependencies

```shell
$ npm install fabric-contract-api
```

## Starting the Environment

All steps below have been packaged into a single script `. reset.sh` that can be run to reset and repopulate the chain. All commands should be run from the `test-network` directory.

1.  Start the peers as Docker containers backed by CouchDB:
    *   `./network.sh up -s couchdb createChannel`
1.  Deploy the chaincode to the channel:
    *   `./network.sh deployCC -c default -ccn policy -ccp ../chaincode-typescript -ccl typescript`
1.  Add all the relevant environment variables locally:
    *   `export $(./set_env.sh Org1 | xargs)`
1.  Create initial set of attributes:
    *   `peer chaincode invoke $PEER_ARGS -C mychannel -n policy -c '{"function":"PolicyInformationPoint:InitAttributes","Args":[]}'`
1.  Create initial set of policies:
    *   `peer chaincode invoke $PEER_ARGS -C mychannel -n policy -c '{"function":"PolicyAdminPoint:InitPolicies","Args":[]}'`
1.  Test an access request:
    *   `peer chaincode invoke $PEER_ARGS -C mychannel -n policy -c '{"Args":["PolicyDecisionPoint:ValidateRequest", "{\"subject\":\"Alice\", \"sender\": \"Hospital\", \"recipient\": \"Bob\", \"infoType\": 1, \"principle\": 1}"]}'`

## Other Contract Functions

Most contracts take enumerable types for certain parameters. All of these are defined in `chaincode-typescript/src/types.ts`.

### PolicyInformationPoint (PIP)

*   Add new attribution with `PolicyInformationPoint:AddAttribution`:
    *  `peer chaincode invoke $PEER_ARGS -C mychannel -n policy -c '{"Args":["PolicyInformationPoint:AddAttribution", "Carol", 5]}'`


### PolicyAdminPoint (PAP)

*   Add new policy with `PolicyAdminPoint:CreatePolicy`:
    *  `peer chaincode invoke $PEER_ARGS -C mychannel -n policy -c '{"Args":["PolicyAdminPoint:CreatePolicy", "{\"subject\": \"Alice\", \"sender\": \"Hospital\", \"recipients\": {\"attrs\": [2,3,4]}, \"infoType\": 2, \"principle\": 2, \"allowed\": true}"]}'`
*   Check for policy existence with `PolicyAdminPoint:PolicyExists`:
    *  `peer chaincode invoke $PEER_ARGS -C mychannel -n policy -c '{"Args":["PolicyAdminPoint:PolicyExists", "1"]}'`
*   Delete a policy with `PolicyAdminPoint:DeletePolicy`:
    *  `peer chaincode invoke $PEER_ARGS -C mychannel -n policy -c '{"Args":["PolicyAdminPoint:DeletePolicy", "1"]'`
PEER_ARGS="-o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $(pwd)/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles $(pwd)/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles $(pwd)/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

echo "Peer Args -------------------"
echo $PEER_ARGS

echo "Initializing Attributions ----------------------"
peer chaincode invoke $PEER_ARGS -C mychannel -n policy -c '{"function":"PolicyInformationPoint:InitAttributions","Args":[]}'
echo "Initializing Policies ----------------------"
peer chaincode invoke $PEER_ARGS -C mychannel -n policy -c '{"function":"PolicyAdminPoint:InitPolicies","Args":[]}'


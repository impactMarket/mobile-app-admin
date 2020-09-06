import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    AsyncStorage,
    Alert,
} from "react-native";
import {
    DataTable,
} from "react-native-paper";
import {
    requestTxSig,
    FeeCurrency,
    waitForSignedTxs,
} from "@celo/dappkit";
import { Linking } from "expo";
import { ICommunity } from "../../types";
import {
    getAllPendingCommunities,
    getAllValidCommunities,
    acceptCreateCommunity,
} from "../services/api";
import config from "../../config";
import ImpactMarketAbi from "../contracts/ImpactMarketABI.json";
import { kit } from "../../root";
import { toTxResult } from "@celo/contractkit/lib/utils/tx-result";


const WALLET_ADDRESS = "WALLET_ADDRESS";
const impactMarketContract = new kit.web3.eth.Contract(
    ImpactMarketAbi as any,
    config.impactMarketContractAddress
);

export default function PendingScreen() {
    const [pendingCommunities, setPendingCommunities] = useState<ICommunity[]>(
        []
    );
    const [acceptingCommunityRequest, setAcceptingCommunityRequest] = useState<
        string
    >("");
    const [userAddress, setUserAddress] = useState<string | null>(null);

    useEffect(() => {
        const loadCommunities = async () => {
            try {
                const _userAddress = await AsyncStorage.getItem(WALLET_ADDRESS);
                setUserAddress(_userAddress);

                const _pendingCommunities = await getAllPendingCommunities();
                setPendingCommunities(_pendingCommunities);
            } catch (e) {
            }
            finally {
            }
        };
        loadCommunities();
    }, []);

    const handleAcceptCommunity = async (community: ICommunity) => {
        setAcceptingCommunityRequest(community.publicId);

        if (kit === undefined) {
            // TODO: do something beatiful, la la la
            return;
        }
        const impactMarketContract = new kit.web3.eth.Contract(
            ImpactMarketAbi as any,
            config.impactMarketContractAddress
        );
        if (impactMarketContract === undefined) {
            // TODO: do something beatiful, la la la
            return;
        }
        // this.setState({ claiming: true });
        const txObject = await impactMarketContract.methods.addCommunity(
            community.requestByAddress,
            community.txCreationObj.claimAmount,
            community.txCreationObj.maxClaim,
            community.txCreationObj.baseInterval,
            community.txCreationObj.incrementInterval
        );
        const requestId = "create_community";
        const dappName = "impactMarket - Admin";
        const callback = Linking.makeUrl("impactmarketappadmin://requesttx");
        requestTxSig(
            kit,
            [
                {
                    from: userAddress!,
                    to: config.impactMarketContractAddress,
                    tx: txObject,
                    feeCurrency: FeeCurrency.cUSD,
                },
            ],
            { requestId, dappName, callback }
        );
        const dappkitResponse = await waitForSignedTxs(requestId);
        const tx = dappkitResponse.rawTxs[0];
        toTxResult(kit.web3.eth.sendSignedTransaction(tx))
            .waitReceipt()
            .then((result) => {
                acceptCreateCommunity(result.transactionHash, community.publicId).then(
                    (success) => {
                        if (success) {
                            Alert.alert(
                                "Success",
                                "You've accepted the community request!",
                                [{ text: "OK" }],
                                { cancelable: false }
                            );
                        } else {
                            Alert.alert(
                                "Failure",
                                "An error happened while accepting the request!",
                                [{ text: "OK" }],
                                { cancelable: false }
                            );
                        }
                        getAllPendingCommunities().then(setPendingCommunities);
                        // getAllValidCommunities().then(setValidCommunities);
                    }
                );
            })
            .finally(() => {
                setAcceptingCommunityRequest("");
            });
    };


    return (
        <DataTable>
            <DataTable.Header>
                <DataTable.Title>Name</DataTable.Title>
                <DataTable.Title>Location</DataTable.Title>
                <DataTable.Title>By</DataTable.Title>
            </DataTable.Header>

            {pendingCommunities.map((community) => (
                <DataTable.Row
                    key={community.publicId}
                    onPress={() => handleAcceptCommunity(community) as any}
                    disabled={acceptingCommunityRequest === community.publicId}
                >
                    <DataTable.Cell>{community.name}</DataTable.Cell>
                    <DataTable.Cell>{community.city}</DataTable.Cell>
                    <DataTable.Cell>{community.requestByAddress}</DataTable.Cell>
                </DataTable.Row>
            ))}

            <DataTable.Pagination
                page={1}
                numberOfPages={1}
                onPageChange={(page) => {
                    console.log(page);
                }}
                label="1-1 of 1"
            />
        </DataTable>
    );
}

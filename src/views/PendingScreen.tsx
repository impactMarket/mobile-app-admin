import React, { useState, useEffect } from "react";
import {
    AsyncStorage,
    Alert, View
} from "react-native";
import {
    List, Portal, Text, Button, Modal, Paragraph, Card
} from "react-native-paper";
import {
    requestTxSig,
    FeeCurrency,
    waitForSignedTxs,
} from "@celo/dappkit";
import { Linking } from "expo";
import { ICommunityInfo } from "../../types";
import {
    getAllPendingCommunities,
    acceptCreateCommunity,
} from "../services/api";
import config from "../../config";
import ImpactMarketAbi from "../contracts/ImpactMarketABI.json";
import { kit } from "../../root";
import { toTxResult } from "@celo/contractkit/lib/utils/tx-result";
import { ScrollView } from "react-native-gesture-handler";
import BigNumber from "bignumber.js";


const WALLET_ADDRESS = "WALLET_ADDRESS";

export default function PendingScreen() {
    const [pendingCommunities, setPendingCommunities] = useState<ICommunityInfo[]>([]);
    const [acceptingCommunity, setAcceptingCommunity] = useState<ICommunityInfo>();
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

    const handleAcceptCommunity = async (community: ICommunityInfo) => {
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
        const txObject = await impactMarketContract.methods.addCommunity(
            community.requestByAddress,
            community.contractParams.claimAmount,
            community.contractParams.maxClaim,
            community.contractParams.baseInterval,
            community.contractParams.incrementInterval
        );
        const requestId = "createcommunity";
        const dappName = "impactMarket - Admin";
        const callback = Linking.makeUrl();
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
                    }
                );
            })
            .finally(() => {
                //
            });
    };

    const bnToStringValue = (value: string) => new BigNumber(value).dividedBy(10 ** config.cUSDDecimals).decimalPlaces(2, 1).toString()
    // const bnToStringTime = (value: BigNumber, div: number) => new BigNumber(value).dividedBy(div).toString()

    const txObject = acceptingCommunity !== undefined ? (
        <View>
            <Paragraph><Text style={{ fontWeight: "bold" }}>txCreationObj:</Text></Paragraph>
            <Paragraph><Text style={{ fontWeight: "bold" }}> - claimAmount:</Text> {bnToStringValue(acceptingCommunity!.contractParams.claimAmount)} cUSD</Paragraph>
            <Paragraph><Text style={{ fontWeight: "bold" }}> - maxClaim:</Text> {bnToStringValue(acceptingCommunity!.contractParams.maxClaim)} cUSD</Paragraph>
            <Paragraph><Text style={{ fontWeight: "bold" }}> - baseInterval:</Text> {(acceptingCommunity!.contractParams.baseInterval / 3600)}h</Paragraph>
            <Paragraph><Text style={{ fontWeight: "bold" }}> - incrementInterval:</Text> {acceptingCommunity!.contractParams.incrementInterval / 60}m</Paragraph>
        </View>
    ) : null;

    return (
        <>
            <ScrollView>
                {pendingCommunities.map((community) => (
                    <List.Item
                        title={community.name}
                        key={community.publicId}
                        description={`by ${community.requestByAddress}`}
                        onPress={() => setAcceptingCommunity(community)}
                    />
                ))}
            </ScrollView>
            <Portal>
                <Modal visible={acceptingCommunity !== undefined} onDismiss={() => setAcceptingCommunity(undefined)}>
                    <ScrollView>

                        <Card style={{ marginHorizontal: 10 }}>
                            <Card.Cover source={{ uri: acceptingCommunity?.coverImage }} />
                            <Card.Content>
                                <Paragraph><Text style={{ fontWeight: "bold" }}>requestByAddress:</Text> {acceptingCommunity?.requestByAddress}</Paragraph>
                                <Paragraph><Text style={{ fontWeight: "bold" }}>name:</Text> {acceptingCommunity?.name}</Paragraph>
                                <Paragraph><Text style={{ fontWeight: "bold" }}>description:</Text> {acceptingCommunity?.description}.</Paragraph>
                                <Paragraph><Text style={{ fontWeight: "bold" }}>city:</Text> {acceptingCommunity?.city}</Paragraph>
                                <Paragraph><Text style={{ fontWeight: "bold" }}>country:</Text> {acceptingCommunity?.country}</Paragraph>
                                <Paragraph><Text style={{ fontWeight: "bold" }}>email:</Text> {acceptingCommunity?.email}</Paragraph>
                                {txObject}
                            </Card.Content>
                            <Card.Actions>
                                <Button mode="contained" style={{ marginRight: 20 }} onPress={() => handleAcceptCommunity(acceptingCommunity!)}>
                                    Accept
                            </Button>
                                <Button mode="contained" onPress={() => setAcceptingCommunity(undefined)}>
                                    Cancel
                            </Button>
                            </Card.Actions>
                        </Card>
                    </ScrollView>
                </Modal>
            </Portal>
        </>
    );
}

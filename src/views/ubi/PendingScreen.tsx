import AsyncStorage from '@react-native-async-storage/async-storage';
import BigNumber from 'bignumber.js';
import Clipboard from 'expo-clipboard';
import React, { useState, useEffect } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
    List,
    Portal,
    Text,
    Button,
    Modal,
    Paragraph,
    Card,
    Snackbar,
} from 'react-native-paper';

import config from '../../../config';
import { kit } from '../../../root';
import { ICommunityPendingDetails } from '../../../types';
import ImpactMarketAbi from '../../contracts/ImpactMarketABI.json';
import {
    getAllPendingCommunities,
    acceptCreateCommunity,
    removeCommunity,
} from '../../services/api';
import { celoWalletRequest } from '../../services/celoWallet';

const WALLET_ADDRESS = 'WALLET_ADDRESS';

export default function PendingScreen() {
    const [pendingCommunities, setPendingCommunities] = useState<
        ICommunityPendingDetails[]
    >([]);
    const [
        acceptingCommunity,
        setAcceptingCommunity,
    ] = useState<ICommunityPendingDetails>();
    const [
        finishingCommunity,
        setFinishingCommunity,
    ] = useState<ICommunityPendingDetails>();
    const [
        newCommunityContractAddress,
        setNewCommunityContractAddress,
    ] = useState<string | null>(null);
    const [copiedToClipboard, setCopiedToClipboard] = useState(false);
    const [acceptSubmitted, setAcceptSubmitted] = useState(false);
    const [removeSubmitted, setRemoveSubmitted] = useState(false);
    const [userAddress, setUserAddress] = useState<string | null>(null);

    useEffect(() => {
        const loadCommunities = async () => {
            try {
                const _userAddress = await AsyncStorage.getItem(WALLET_ADDRESS);
                setUserAddress(_userAddress);

                const _pendingCommunities = await getAllPendingCommunities();
                setPendingCommunities(_pendingCommunities);
            } catch (e) {
            } finally {
            }
        };
        loadCommunities();
    }, []);

    const handleRemoveCommunity = async (
        community: ICommunityPendingDetails
    ) => {
        Alert.alert(
            'Confirm',
            'Do you want to remove the following community? ' + community.name,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    onPress: () => {
                        removeCommunity(community.publicId)
                            .then((r) => {
                                getAllPendingCommunities().then(
                                    setPendingCommunities
                                );
                                setRemoveSubmitted(false);
                                setAcceptingCommunity(undefined);
                                Alert.alert(
                                    'Success',
                                    'Community as been removed!',
                                    [{ text: 'OK' }],
                                    { cancelable: false }
                                );
                            })
                            .catch((e) => {
                                console.log(e);
                                setRemoveSubmitted(false);
                                Alert.alert(
                                    'Failure',
                                    'An error happened while removing the community!',
                                    [{ text: 'OK' }],
                                    { cancelable: false }
                                );
                            });
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleAcceptCommunity = async (
        community: ICommunityPendingDetails
    ) => {
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
        console.log(community);
        const txObject = await impactMarketContract.methods.addCommunity(
            community.requestByAddress,
            community.contract.claimAmount,
            community.contract.maxClaim,
            community.contract.baseInterval,
            community.contract.incrementInterval
        );
        const requestId = 'createcommunity';
        setAcceptSubmitted(true);

        celoWalletRequest(
            userAddress!,
            config.impactMarketContractAddress,
            txObject,
            requestId,
            kit
        )
            .then((txResponse) => {
                if (txResponse === undefined) {
                    return;
                }
                acceptCreateCommunity(
                    txResponse.transactionHash,
                    community.publicId
                )
                    .then((acceptResponse) => {
                        getAllPendingCommunities().then(setPendingCommunities);
                        setNewCommunityContractAddress(
                            acceptResponse.contractAddress
                        );
                        setFinishingCommunity(community);
                    })
                    .catch((e) => {
                        console.log(e);
                        Alert.alert(
                            'Failure',
                            'An error happened while accepting the request!',
                            [{ text: 'OK' }],
                            { cancelable: false }
                        );
                        setAcceptSubmitted(false);
                    });
            })
            .catch((e) => {
                console.log(e);
                Alert.alert(
                    'Failure',
                    'An error happened while accepting the request!',
                    [{ text: 'OK' }],
                    { cancelable: false }
                );
                setAcceptSubmitted(false);
            });
    };

    const bnToStringValue = (value: string) =>
        new BigNumber(value)
            .dividedBy(10 ** config.cUSDDecimals)
            .decimalPlaces(2, 1)
            .toString();
    // const bnToStringTime = (value: BigNumber, div: number) => new BigNumber(value).dividedBy(div).toString()

    const txObject =
        acceptingCommunity !== undefined ? (
            <View>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>Contract Params:</Text>
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>
                        {' '}
                        - Amount per claim:
                    </Text>{' '}
                    {bnToStringValue(
                        acceptingCommunity.contract.claimAmount
                    )}{' '}
                    cUSD
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>
                        {' '}
                        - Max Amount to claim:
                    </Text>{' '}
                    {bnToStringValue(acceptingCommunity.contract.maxClaim)} cUSD
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>
                        {' '}
                        - Base interval:
                    </Text>{' '}
                    {acceptingCommunity.contract.baseInterval / 3600}h
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>
                        {' '}
                        - Increment interval:
                    </Text>{' '}
                    {acceptingCommunity.contract.incrementInterval / 60}m
                </Paragraph>
            </View>
        ) : null;

    const renderItem = ({ item }: { item: ICommunityPendingDetails }) => (
        <List.Item
            title={item.name}
            key={item.publicId}
            description={`by ${item.requestByAddress}`}
            onPress={() => setAcceptingCommunity(item)}
        />
    );

    return (
        <>
            <FlatList
                data={pendingCommunities}
                renderItem={renderItem}
                keyExtractor={(item) => item.publicId}
            />
            <Portal>
                <Modal
                    visible={
                        acceptingCommunity !== undefined &&
                        finishingCommunity === undefined
                    }
                    onDismiss={() => setAcceptingCommunity(undefined)}
                >
                    <ScrollView>
                        <Card style={{ marginHorizontal: 10 }}>
                            <Card.Cover
                                source={{ uri: acceptingCommunity?.coverImage }}
                            />
                            <Card.Content>
                                <Paragraph>
                                    <Text style={{ fontWeight: 'bold' }}>
                                        Request by:
                                    </Text>{' '}
                                    {acceptingCommunity?.requestByAddress}
                                </Paragraph>
                                <Paragraph>
                                    <Text style={{ fontWeight: 'bold' }}>
                                        Name:
                                    </Text>{' '}
                                    {acceptingCommunity?.name}
                                </Paragraph>
                                <ScrollView style={{ maxHeight: '15%' }}>
                                    <Paragraph>
                                        <Text style={{ fontWeight: 'bold' }}>
                                            Description:
                                        </Text>{' '}
                                        {acceptingCommunity?.description}.
                                    </Paragraph>
                                </ScrollView>
                                <Paragraph>
                                    <Text style={{ fontWeight: 'bold' }}>
                                        City:
                                    </Text>{' '}
                                    {acceptingCommunity?.city}
                                </Paragraph>
                                <Paragraph>
                                    <Text style={{ fontWeight: 'bold' }}>
                                        Country:
                                    </Text>{' '}
                                    {acceptingCommunity?.country}
                                </Paragraph>
                                <Paragraph>
                                    <Text style={{ fontWeight: 'bold' }}>
                                        Email:
                                    </Text>{' '}
                                    {acceptingCommunity?.email}
                                </Paragraph>
                                {txObject}
                            </Card.Content>
                            <Card.Actions>
                                <Button
                                    mode="contained"
                                    style={{ marginRight: 20 }}
                                    loading={acceptSubmitted}
                                    onPress={() =>
                                        handleAcceptCommunity(
                                            acceptingCommunity!
                                        )
                                    }
                                >
                                    Accept
                                </Button>
                                <Button
                                    mode="contained"
                                    style={{
                                        marginRight: 20,
                                        backgroundColor: 'red',
                                    }}
                                    loading={removeSubmitted}
                                    onPress={() =>
                                        handleRemoveCommunity(
                                            acceptingCommunity!
                                        )
                                    }
                                >
                                    Remove
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() =>
                                        setAcceptingCommunity(undefined)
                                    }
                                >
                                    Cancel
                                </Button>
                            </Card.Actions>
                        </Card>
                    </ScrollView>
                </Modal>
                <Modal
                    visible={finishingCommunity !== undefined}
                    onDismiss={() => setFinishingCommunity(undefined)}
                >
                    <ScrollView>
                        <Card style={{ marginHorizontal: 10 }}>
                            <Card.Content>
                                <Paragraph>
                                    You've accepted the community request!
                                </Paragraph>
                                <Paragraph> </Paragraph>
                                <Paragraph>
                                    <Text style={{ fontWeight: 'bold' }}>
                                        Name:
                                    </Text>{' '}
                                    {finishingCommunity?.name}
                                </Paragraph>
                                <Paragraph
                                    onPress={() => {
                                        if (finishingCommunity) {
                                            Clipboard.setString(
                                                finishingCommunity?.requestByAddress
                                            );
                                            setCopiedToClipboard(true);
                                        }
                                    }}
                                >
                                    <Text style={{ fontWeight: 'bold' }}>
                                        Request by:
                                    </Text>{' '}
                                    {finishingCommunity?.requestByAddress}
                                </Paragraph>
                                <Paragraph> </Paragraph>
                                {newCommunityContractAddress !== null ? (
                                    <Paragraph
                                        onPress={() => {
                                            Clipboard.setString(
                                                newCommunityContractAddress
                                            );
                                            setCopiedToClipboard(true);
                                        }}
                                    >
                                        <Text style={{ fontWeight: 'bold' }}>
                                            Contract address is:
                                        </Text>{' '}
                                        {newCommunityContractAddress}
                                    </Paragraph>
                                ) : (
                                    <Paragraph>
                                        There are missing signatures!
                                    </Paragraph>
                                )}
                            </Card.Content>
                            <Card.Actions>
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        setAcceptingCommunity(undefined);
                                        setFinishingCommunity(undefined);
                                        setAcceptSubmitted(false);
                                    }}
                                >
                                    Close
                                </Button>
                            </Card.Actions>
                        </Card>
                    </ScrollView>
                </Modal>
                <Snackbar
                    visible={copiedToClipboard}
                    onDismiss={() => setCopiedToClipboard(false)}
                    action={{
                        label: 'Close',
                        onPress: () => {
                            setCopiedToClipboard(false);
                        },
                    }}
                >
                    Address copied to clipboard.
                </Snackbar>
            </Portal>
        </>
    );
}

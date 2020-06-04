import './global';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, AsyncStorage, YellowBox, Alert, SafeAreaView, ScrollView } from 'react-native';
import { DataTable, Button, Paragraph, Appbar, Headline } from 'react-native-paper';
// import { newKit, ContractKit } from '@celo/contractkit';
import {
    requestAccountAddress,
    waitForAccountAuth,
    requestTxSig,
    FeeCurrency,
    waitForSignedTxs,
} from '@celo/dappkit'
import { Linking } from 'expo'
import { ICommunity } from './types';
import { getAllPendingCommunities, getAllValidCommunities, acceptCreateCommunity } from './api';
import config from './config';
import ImpactMarketAbi from './ImpactMarketABI.json';
import { kit } from './root';
import { toTxResult } from '@celo/contractkit/lib/utils/tx-result';
import { Text } from 'react-native-paper';


YellowBox.ignoreWarnings(['Warning: The provided value \'moz', 'Warning: The provided value \'ms-stream']);


const WALLET_ADDRESS = 'WALLET_ADDRESS';
const impactMarketContract = new kit.web3.eth.Contract(
    ImpactMarketAbi as any,
    config.impactMarketContractAddress,
);


export default function App() {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [pendingCommunities, setPendingCommunities] = useState<ICommunity[]>([]);
    const [validCommunities, setValidCommunities] = useState<ICommunity[]>([]);
    const [acceptingCommunityRequest, setAcceptingCommunityRequest] = useState<string>('');
    // const [kit, setKit] = useState<ContractKit>();
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const loadCommunities = async () => {
            const getUserWalletFromLocal = async () => {
                let value = null;
                try {
                    value = await AsyncStorage.getItem(WALLET_ADDRESS);
                } catch (error) {
                    // Error retrieving data
                }
                return value;
            };
            // setKit(newKit(config.jsonRpc));
            const _userAddress = await getUserWalletFromLocal();
            setUserAddress(_userAddress);
            const _pendingCommunities = await getAllPendingCommunities();
            setPendingCommunities(_pendingCommunities);
            const _acceptingCommunityRequest = await getAllValidCommunities();
            setValidCommunities(_acceptingCommunityRequest);

            const _role = await impactMarketContract.methods.ADMIN_ROLE().call();
            const _isAdmin = await impactMarketContract.methods.hasRole(_role, _userAddress).call();
            setIsAdmin(_isAdmin);
            //
            setLoaded(true);
            setLoading(false);
        }
        if (!loading && !loaded) {
            setLoading(true);
            loadCommunities();
        }
    }, []);

    const handleAcceptCommunity = async (community: ICommunity) => {
        setAcceptingCommunityRequest(community.publicId);

        if (kit === undefined) {
            // TODO: do something beatiful, la la la
            return;
        }
        const impactMarketContract = new kit.web3.eth.Contract(
            ImpactMarketAbi as any,
            config.impactMarketContractAddress,
        );
        if (impactMarketContract === undefined) {
            // TODO: do something beatiful, la la la
            return;
        }
        // this.setState({ claiming: true });
        const txObject = await impactMarketContract.methods.addCommunity(
            community.requestByAddress,
            community.txCreationObj.amountByClaim,
            community.txCreationObj.baseInterval,
            community.txCreationObj.incrementalInterval,
            community.txCreationObj.claimHardcap,
        );
        const requestId = 'create_community';
        const dappName = 'Impact Market - Admin'
        const callback = Linking.makeUrl('impactmarketappadmin://requesttx')
        requestTxSig(
            kit,
            [
                {
                    from: userAddress!,
                    to: config.impactMarketContractAddress,
                    tx: txObject,
                    feeCurrency: FeeCurrency.cUSD
                }
            ],
            { requestId, dappName, callback }
        )
        const dappkitResponse = await waitForSignedTxs(requestId);
        const tx = dappkitResponse.rawTxs[0];
        toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt().then((result) => {
            acceptCreateCommunity(result.transactionHash, community.publicId).then((success) => {
                if (success) {
                    Alert.alert(
                        'Success',
                        'You\'ve accepted the community request!',
                        [
                            { text: 'OK' },
                        ],
                        { cancelable: false }
                    );
                } else {
                    Alert.alert(
                        'Failure',
                        'An error happened while accepting the request!',
                        [
                            { text: 'OK' },
                        ],
                        { cancelable: false }
                    );
                }
                getAllPendingCommunities().then(setPendingCommunities);
                getAllValidCommunities().then(setValidCommunities);
            })
        }).finally(() => {
            setAcceptingCommunityRequest('');
        });
    }

    const handleLoginWithCelo = async () => {
        const requestId = 'login'
        const dappName = 'Impact Market - Admin'
        const callback = Linking.makeUrl('impactmarketappadmin://login')

        requestAccountAddress({
            requestId,
            dappName,
            callback,
        })

        const dappkitResponse = await waitForAccountAuth(requestId)
        try {
            await AsyncStorage.setItem(WALLET_ADDRESS, dappkitResponse.address);
            const _role = await impactMarketContract.methods.ADMIN_ROLE().call();
            const _isAdmin = await impactMarketContract.methods.hasRole(_role, dappkitResponse.address).call();
            setUserAddress(dappkitResponse.address);
            setIsAdmin(_isAdmin);
            console.log(dappkitResponse.address);
        } catch (error) {
            // Error saving data
            console.log(error);
        }
    }

    if (userAddress === null) {
        return <View style={styles.container}>
            <Button mode="contained" onPress={handleLoginWithCelo}>
                Login
            </Button>
        </View>
    }

    const renderCommunities = (
        <>
            <Button
                mode="contained"
                onPress={() => {
                    setAcceptingCommunityRequest('');
                    getAllPendingCommunities().then(setPendingCommunities);
                    getAllValidCommunities().then(setValidCommunities);
                }}
            >
                Refresh
            </Button>
            <Headline>Pending</Headline>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Name</DataTable.Title>
                    <DataTable.Title>Location</DataTable.Title>
                    <DataTable.Title>Created</DataTable.Title>
                    <DataTable.Title>By</DataTable.Title>
                </DataTable.Header>

                {pendingCommunities.map((community) =>
                    <DataTable.Row
                        key={community.publicId}
                        onPress={() => (handleAcceptCommunity(community) as any)}
                        disabled={acceptingCommunityRequest === community.publicId}
                    >
                        <DataTable.Cell>{community.name}</DataTable.Cell>
                        <DataTable.Cell>{community.location.title}</DataTable.Cell>
                        <DataTable.Cell>{community.createdAt}</DataTable.Cell>
                        <DataTable.Cell>{community.contractAddress}</DataTable.Cell>
                    </DataTable.Row>)}

                <DataTable.Pagination
                    page={1}
                    numberOfPages={1}
                    onPageChange={(page) => { console.log(page); }}
                    label="1-1 of 1"
                />
            </DataTable>
            <Headline>Accepted</Headline>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Name</DataTable.Title>
                    <DataTable.Title>Location</DataTable.Title>
                    <DataTable.Title>Created</DataTable.Title>
                    <DataTable.Title>By</DataTable.Title>
                </DataTable.Header>

                {validCommunities.map((community) =>
                    <DataTable.Row key={community.publicId}>
                        <DataTable.Cell>{community.name}</DataTable.Cell>
                        <DataTable.Cell>{community.location.title}</DataTable.Cell>
                        <DataTable.Cell>{community.createdAt}</DataTable.Cell>
                        <DataTable.Cell>{community.contractAddress}</DataTable.Cell>
                    </DataTable.Row>)}

                <DataTable.Pagination
                    page={1}
                    numberOfPages={1}
                    onPageChange={(page) => { console.log(page); }}
                    label="1-1 of 1"
                />
            </DataTable>
        </>
    );

    return (
        <View>
            <Appbar.Header>
                <Appbar.Content title="Admin" />
            </Appbar.Header>
            <ScrollView style={styles.container}>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>
                        Your address:
                    </Text> {userAddress.slice(0, 8)}...{userAddress.slice(36, 42)}
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>
                        ImpactMarket address:
                    </Text> {config.impactMarketContractAddress.slice(0, 8)}...{config.impactMarketContractAddress.slice(36, 42)}
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>
                        isAdmin:
                    </Text> {isAdmin ? 'true' : 'false'}
                </Paragraph>
                {loading && <Paragraph>Loading...</Paragraph>}
                {acceptingCommunityRequest.length > 0 && <Paragraph>Sending transaction...</Paragraph>}
                {isAdmin && renderCommunities}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 80
    }
});

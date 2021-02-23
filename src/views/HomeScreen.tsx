import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import React, { useState, useEffect } from 'react';
import { View, DevSettings } from 'react-native';
import { Button, Appbar, Paragraph, Text } from 'react-native-paper';

import config from '../../config';
import { kit } from '../../root';
import ImpactMarketAbi from '../contracts/ImpactMarketABI.json';
// import { requestTxSig, FeeCurrency, waitForSignedTxs } from "@celo/dappkit";
// import { toTxResult } from "@celo/contractkit/lib/utils/tx-result";
// import * as Linking from "expo-linking";

const WALLET_ADDRESS = 'WALLET_ADDRESS';
const impactMarketContract = new kit.web3.eth.Contract(
    ImpactMarketAbi as any,
    config.impactMarketContractAddress
);

export default function HomeScreen() {
    const navigation = useNavigation();
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const loadCommunities = async () => {
            console.log('loading communities');
            try {
                const _userAddress = await AsyncStorage.getItem(WALLET_ADDRESS);
                setUserAddress(_userAddress);

                const _role = await impactMarketContract.methods
                    .ADMIN_ROLE()
                    .call();
                const _isAdmin = await impactMarketContract.methods
                    .hasRole(_role, _userAddress)
                    .call();
                setIsAdmin(_isAdmin);
            } catch (e) {
            } finally {
            }
        };
        loadCommunities();
    }, []);

    // const handleMigrateCommunity = async () => {
    //     const txObject = await impactMarketContract.methods.migrateCommunity(
    //         '0x833961aab38d24EECdCD2129Aa5a5d41Fd86Acbf',
    //         '0x8978Da2906022A57D9254002CeF4Af1640c902E5',
    //         '0x975328E7102a654db29e4E3E077b3eCb4520bF79'
    //     );
    //     const requestId = "migratecommunity";
    //     const dappName = "impactMarket - Admin";
    //     const callback = Linking.makeUrl();
    //     requestTxSig(
    //         kit,
    //         [
    //             {
    //                 from: userAddress!,
    //                 to: config.impactMarketContractAddress,
    //                 tx: txObject,
    //                 feeCurrency: FeeCurrency.cUSD,
    //             },
    //         ],
    //         { requestId, dappName, callback }
    //     );
    //     const dappkitResponse = await waitForSignedTxs(requestId);
    //     const tx = dappkitResponse.rawTxs[0];
    //     toTxResult(kit.web3.eth.sendSignedTransaction(tx))
    //         .waitReceipt()
    //         .then((result) => {
    //             console.log(result);
    //         });
    // }

    if (userAddress === null) {
        return <View />;
    }

    return (
        <View>
            <Appbar.Header>
                <Appbar.Content title="Admin" />
                <Appbar.Action
                    icon="exit-run"
                    onPress={() => {
                        AsyncStorage.removeItem(WALLET_ADDRESS);
                        DevSettings.reload();
                    }}
                />
            </Appbar.Header>
            <View style={{ margin: 10 }}>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>Your address:</Text>{' '}
                    {userAddress.slice(0, 8)}...{userAddress.slice(36, 42)}
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>
                        ImpactMarket address:
                    </Text>{' '}
                    {config.impactMarketContractAddress.slice(0, 8)}...
                    {config.impactMarketContractAddress.slice(36, 42)}
                </Paragraph>
                {/* <Paragraph>
                    <Text style={{ fontWeight: "bold" }}>Deployed at:</Text>{" "}
                    block number X @ (insert-time-here)
                </Paragraph> */}
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>isAdmin:</Text>{' '}
                    {isAdmin ? 'true' : 'false'}
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: 'bold' }}>isTestnet:</Text>{' '}
                    {config.testnet ? 'true' : 'false'}
                </Paragraph>
                <Button
                    mode="contained"
                    style={{ marginVertical: 10 }}
                    onPress={() => navigation.navigate('Pending')}
                >
                    Go to Pending
                </Button>
                {/* <Button
                    mode="contained"
                    style={{ marginVertical: 10 }}
                    onPress={() =>
                        navigation.navigate('Accepted')
                    }
                >Go to Accepted</Button>
                <Button
                    mode="contained"
                    style={{ marginVertical: 10 }}
                    onPress={handleMigrateCommunity}
                    disabled={true}
                >Migrate Community</Button> */}
            </View>
            <Paragraph>Build: {Constants.manifest.version}</Paragraph>
        </View>
    );
}

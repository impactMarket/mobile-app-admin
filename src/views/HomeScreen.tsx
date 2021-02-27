import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import React, { useState, useEffect } from 'react';
import { View, DevSettings } from 'react-native';
import {
    Button,
    Appbar,
    Paragraph,
    Text,
    ActivityIndicator,
} from 'react-native-paper';

import config from '../../config';
import {
    loadImpactMarketContract,
    loadUserWallet,
    verifyAdminRole,
} from '../helpers';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserWallet().then((wallet) => {
            setUserAddress(wallet);
            const ipctContract = loadImpactMarketContract();
            verifyAdminRole(ipctContract, wallet).then((is) => {
                setIsAdmin(is);
                setLoading(false);
            });
        });
    }, []);

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator />
            </View>
        );
    }

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
                        AsyncStorage.clear();
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
            </View>
            <Paragraph>Build: {Constants.manifest.version}</Paragraph>
        </View>
    );
}

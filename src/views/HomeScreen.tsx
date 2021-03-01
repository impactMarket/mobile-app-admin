import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import React from 'react';
import { View, DevSettings } from 'react-native';
import { Button, Appbar, Paragraph, Text, Headline } from 'react-native-paper';
import { useSelector } from 'react-redux';

import config from '../../config';
import { IRootState } from '../helpers/types';

export default function HomeScreen() {
    const navigation = useNavigation();
    const userWalletAddress = useSelector(
        (state: IRootState) => state.user.address
    );
    const userIsAdmin = useSelector((state: IRootState) => state.user.isAdmin);

    console.log('d1', userWalletAddress);

    if (userWalletAddress.length === 0) {
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
            <View
                style={{
                    // marginTop: 10,
                    marginHorizontal: 10,
                    alignItems: 'center',
                }}
            >
                <Headline>Your address</Headline>
                <Paragraph>
                    {userWalletAddress.slice(0, 8)}...
                    {userWalletAddress.slice(36, 42)}
                </Paragraph>
                <Headline>ImpactMarket address</Headline>
                <Paragraph>
                    {config.impactMarketContractAddress.slice(0, 8)}...
                    {config.impactMarketContractAddress.slice(36, 42)}
                </Paragraph>
                <Headline>isAdmin</Headline>
                <Paragraph>{userIsAdmin ? 'true' : 'false'}</Paragraph>
                <Headline>isTestnet</Headline>
                <Paragraph>{config.testnet ? 'true' : 'false'}</Paragraph>
                <Headline>Build</Headline>
                <Paragraph>{Constants.manifest.version}</Paragraph>
            </View>
        </View>
    );
}

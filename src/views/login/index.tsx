import { requestAccountAddress, waitForAccountAuth } from '@celo/dappkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import React, { useState, useEffect } from 'react';
import { View, StatusBar, LogBox, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { loadImpactMarketContract, verifyAdminRole } from '../../helpers';
import { AppData } from '../../helpers/constants';
import {
    setIsAdminState,
    setUserWalletAddressState,
} from '../../helpers/redux/actions/user';

export default function LoginScreen() {
    const [loginInProgress, setLoginInProgress] = useState(false);

    const handleLoginWithCelo = async () => {
        const requestId = 'login';
        const dappName = 'impactMarket - Admin';
        const callback = Linking.makeUrl();

        setLoginInProgress(true);
        requestAccountAddress({
            requestId,
            dappName,
            callback,
        });

        const dappkitResponse = await waitForAccountAuth(requestId);
        try {
            await AsyncStorage.setItem(
                AppData.WALLET_ADDRESS,
                dappkitResponse.address
            );
            setUserWalletAddressState(dappkitResponse.address);
            setIsAdminState(
                await verifyAdminRole(
                    loadImpactMarketContract(),
                    dappkitResponse.address
                )
            );
        } catch (error) {
            Alert.alert(
                'Error',
                'Error while login: ' + JSON.stringify(error),
                [{ text: 'Close' }],
                { cancelable: false }
            );
        }
        setLoginInProgress(false);
    };

    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <Button
                mode="contained"
                onPress={handleLoginWithCelo}
                loading={loginInProgress}
                style={{ margin: 15 }}
            >
                Login
            </Button>
        </View>
    );
}

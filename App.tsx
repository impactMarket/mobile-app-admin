import './global';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

import HomeScreen from './src/views/HomeScreen';
import PendingScreen from './src/views/PendingScreen';
import { createStore } from 'redux';
import combinedReducers from './src/helpers/redux';
import { Provider } from 'react-redux';
import { navigationTheme, theme } from './src/styles/theme';
import { setUserWalletAddressState } from './src/helpers/redux/actions/user';
import AppLoading from 'expo-app-loading';
import LoginScreen from './src/views/Login';
import {
    loadImpactMarketContract,
    loadUserWallet,
    verifyAdminRole,
} from './src/helpers';

LogBox.ignoreLogs([
    "The provided value 'moz-chunked-arraybuffer' is not a valid 'responseType'.",
    "The provided value 'ms-stream' is not a valid 'responseType'.",
]);

const store = createStore(combinedReducers);
const Stack = createStackNavigator();

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [isUserLoged, setIsUserLoged] = useState(false);

    const _cacheResourcesAsync = async () => {
        // load user
        const wallet = await loadUserWallet();
        const ipctContract = loadImpactMarketContract();
        const is = await verifyAdminRole(ipctContract, wallet);
        setUserWalletAddressState(wallet);
        if (wallet.length > 0) {
            setIsUserLoged(true);
        }
        // setIsAdmin(is);
    };

    if (!isReady) {
        return (
            <AppLoading
                startAsync={_cacheResourcesAsync}
                onFinish={() => setIsReady(true)}
                onError={console.warn}
            />
        );
    }

    return (
        <PaperProvider theme={theme}>
            <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" translucent />
            <Provider store={store}>
                <NavigationContainer theme={navigationTheme}>
                    <Stack.Navigator>
                        {isUserLoged ? (
                            <>
                                <Stack.Screen
                                    options={{
                                        headerShown: false,
                                    }}
                                    name="Home"
                                    component={HomeScreen}
                                />
                                <Stack.Screen
                                    name="Pending"
                                    component={PendingScreen}
                                />
                            </>
                        ) : (
                            <Stack.Screen
                                options={{
                                    headerShown: false,
                                }}
                                name="Login"
                                component={LoginScreen}
                            />
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        </PaperProvider>
    );
}

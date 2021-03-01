import './global';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, LogBox, View, Text, SafeAreaView } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

import HomeScreen from './src/views/home';
import PendingScreen from './src/views/ubi/PendingScreen';
import { createStore } from 'redux';
import combinedReducers from './src/helpers/redux';
import { batch, Provider } from 'react-redux';
import { navigationTheme, theme } from './src/styles/theme';
import {
    setIsAdminState,
    setUserWalletAddressState,
} from './src/helpers/redux/actions/user';
import AppLoading from 'expo-app-loading';
import LoginScreen from './src/views/login';
import {
    loadImpactMarketContract,
    loadUserWallet,
    verifyAdminRole,
} from './src/helpers';
import UBIScreen from './src/views/ubi';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { ipctColors } from './src/styles';
import StoriesScreen from './src/views/stories';

LogBox.ignoreLogs([
    "The provided value 'moz-chunked-arraybuffer' is not a valid 'responseType'.",
    "The provided value 'ms-stream' is not a valid 'responseType'.",
]);

const store = createStore(combinedReducers);
const Tab = createBottomTabNavigator();
const NotLoggedStack = createStackNavigator();
const UBIStack = createStackNavigator();

function UBIStackScreen() {
    return (
        <UBIStack.Navigator>
            <UBIStack.Screen
                options={{
                    headerShown: false,
                }}
                name="UBIScreen"
                component={UBIScreen}
            />
            <UBIStack.Screen name="Pending" component={PendingScreen} />
        </UBIStack.Navigator>
    );
}

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [isUserLoged, setIsUserLoged] = useState(false);
    const [errorLoading, setErrorLoading] = useState('');

    const _cacheResourcesAsync = async () => {
        try {
            // load user
            const wallet = await loadUserWallet();
            const ipctContract = loadImpactMarketContract();
            if (wallet !== null) {
                const is = await verifyAdminRole(ipctContract, wallet);
                batch(() => {
                    store.dispatch(setUserWalletAddressState(wallet));
                    store.dispatch(setIsAdminState(is));
                });
                await new Promise((resolve) => {
                    setTimeout(resolve, 10000);
                });
                setIsUserLoged(true);
            }
            console.log(wallet);
        } catch (e) {
            setErrorLoading(JSON.stringify(e));
        }
    };

    if (errorLoading.length > 0) {
        return (
            <View>
                <Text>Error loading: {errorLoading}</Text>
            </View>
        );
    }

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
        <SafeAreaView style={styles.container}>
            <PaperProvider theme={theme}>
                {/* <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" translucent /> */}
                <Provider store={store}>
                    <NavigationContainer theme={navigationTheme}>
                        {isUserLoged ? (
                            <Tab.Navigator>
                                <Tab.Screen
                                    name="Home"
                                    component={HomeScreen}
                                    options={{
                                        tabBarIcon: (props) => (
                                            <AntDesign
                                                name="home"
                                                size={24}
                                                color={
                                                    props.focused
                                                        ? ipctColors.blueRibbon
                                                        : 'grey'
                                                }
                                            />
                                        ),
                                    }}
                                />
                                <Tab.Screen
                                    name="UBI"
                                    component={UBIStackScreen}
                                    options={{
                                        tabBarIcon: (props) => (
                                            <FontAwesome5
                                                name="hand-holding-heart"
                                                size={24}
                                                color={
                                                    props.focused
                                                        ? ipctColors.blueRibbon
                                                        : 'grey'
                                                }
                                            />
                                        ),
                                    }}
                                />
                                <Tab.Screen
                                    name="Stories"
                                    component={StoriesScreen}
                                    options={{
                                        tabBarIcon: (props) => (
                                            <AntDesign
                                                name="camera"
                                                size={24}
                                                color={
                                                    props.focused
                                                        ? ipctColors.blueRibbon
                                                        : 'grey'
                                                }
                                            />
                                        ),
                                    }}
                                />
                            </Tab.Navigator>
                        ) : (
                            <NotLoggedStack.Navigator>
                                <NotLoggedStack.Screen
                                    options={{
                                        headerShown: false,
                                    }}
                                    name="Login"
                                    component={LoginScreen}
                                />
                            </NotLoggedStack.Navigator>
                        )}
                    </NavigationContainer>
                </Provider>
            </PaperProvider>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

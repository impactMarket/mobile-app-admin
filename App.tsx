import "./global";
import React, { useState, useEffect } from "react";
import {
    View,
    AsyncStorage,
    YellowBox,
    StatusBar,
} from "react-native";
import {
    DefaultTheme,
    Provider as PaperProvider,
    Button,
    Appbar,
} from "react-native-paper";
import {
    requestAccountAddress,
    waitForAccountAuth,
} from "@celo/dappkit";
import { Linking } from "expo";
import {
    NavigationContainer,
    DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from "./src/views/HomeScreen";
import PendingScreen from "./src/views/PendingScreen";
import AcceptedScreen from "./src/views/AcceptedScreen";

YellowBox.ignoreWarnings([
    "The provided value 'moz-chunked-arraybuffer' is not a valid 'responseType'.",
    "The provided value 'ms-stream' is not a valid 'responseType'.",
]);

const theme = {
    ...DefaultTheme,
    roundness: 4,
    colors: {
        ...DefaultTheme.colors,
        primary: "#5e72e4",
    },
};
const navigationTheme = {
    ...NavigationDefaultTheme,
    colors: {
        ...NavigationDefaultTheme.colors,
        primary: "#5e72e4",
        background: "#ffffff",
    },
};

const WALLET_ADDRESS = "WALLET_ADDRESS";
const Stack = createStackNavigator();
export default function App() {
    const [userAddress, setUserAddress] = useState<string | null>(null);

    useEffect(() => {
        const loadCommunities = async () => {
            try {
                const _userAddress = await AsyncStorage.getItem(WALLET_ADDRESS);
                setUserAddress(_userAddress);
            } catch (e) {
            }
            finally {
            }
        };
        loadCommunities();
    }, []);

    const handleLoginWithCelo = async () => {
        const requestId = "login";
        const dappName = "impactMarket - Admin";
        const callback = Linking.makeUrl();

        requestAccountAddress({
            requestId,
            dappName,
            callback,
        });

        const dappkitResponse = await waitForAccountAuth(requestId);
        try {
            await AsyncStorage.setItem(WALLET_ADDRESS, dappkitResponse.address);
            setUserAddress(dappkitResponse.address);
        } catch (error) {
            // Error saving data
            console.log(error);
        }
    };

    if (userAddress === null) {
        return (
            <PaperProvider theme={theme}>
                <View>
                    <Appbar.Header>
                        <Appbar.Content title="Admin" />
                    </Appbar.Header>
                    <Button
                        mode="contained"
                        onPress={handleLoginWithCelo}
                        style={{ margin: 15 }}
                    >
                        Login
                    </Button>
                </View>
            </PaperProvider>
        );
    }

    return (
        <PaperProvider theme={theme}>
            <StatusBar
                backgroundColor="rgba(0, 0, 0, 0.2)"
                translucent
            />
            <NavigationContainer theme={navigationTheme}>
                <Stack.Navigator>
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
                    <Stack.Screen
                        name="Accepted"
                        component={AcceptedScreen}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider >
    );
}
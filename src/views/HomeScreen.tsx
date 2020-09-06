import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    AsyncStorage,
    DevSettings,
} from "react-native";
import {
    Button,
    Appbar,
    Paragraph,
    Text,
} from "react-native-paper";
import config from "../../config";
import ImpactMarketAbi from "../contracts/ImpactMarketABI.json";
import { kit } from "../../root";
import { useNavigation } from "@react-navigation/native";


const WALLET_ADDRESS = "WALLET_ADDRESS";
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

                const _role = await impactMarketContract.methods.ADMIN_ROLE().call();
                const _isAdmin = await impactMarketContract.methods
                    .hasRole(_role, _userAddress)
                    .call();
                setIsAdmin(_isAdmin);
            } catch (e) {
            }
            finally {
            }
        };
        loadCommunities();
    }, []);

    if (userAddress === null) {
        return <View />;
    }

    return (
        <View>
            <Appbar.Header>
                <Appbar.Content title="Admin" />
                <Appbar.Action icon="exit-run" onPress={() => { AsyncStorage.removeItem(WALLET_ADDRESS); DevSettings.reload(); }} />
            </Appbar.Header>
            <View style={{ margin: 10 }}>
                <Paragraph>
                    <Text style={{ fontWeight: "bold" }}>Your address:</Text>{" "}
                    {userAddress.slice(0, 8)}...{userAddress.slice(36, 42)}
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: "bold" }}>ImpactMarket address:</Text>{" "}
                    {config.impactMarketContractAddress.slice(0, 8)}...
                        {config.impactMarketContractAddress.slice(36, 42)}
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: "bold" }}>Deployed at:</Text>{" "}
                    block number X @ (insert-time-here)
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: "bold" }}>isAdmin:</Text>{" "}
                    {isAdmin ? "true" : "false"}
                </Paragraph>
                <Paragraph>
                    <Text style={{ fontWeight: "bold" }}>isTestnet:</Text>{" "}
                    {config.testnet ? "true" : "false"}
                </Paragraph>
                <Button
                    mode="contained"
                    style={{ marginVertical: 10 }}
                    onPress={() =>
                        navigation.navigate('Pending')
                    }
                >Go to Pending</Button>
                <Button
                    mode="contained"
                    style={{ marginVertical: 10 }}
                    onPress={() =>
                        navigation.navigate('Accepted')
                    }
                >Go to Accepted</Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 80,
    },
});

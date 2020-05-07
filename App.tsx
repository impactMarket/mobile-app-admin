import React, { useState, useEffect } from 'react';
import { StyleSheet, View, AsyncStorage } from 'react-native';
import { DataTable, Button } from 'react-native-paper';
import { newKit, ContractKit } from '@celo/contractkit';
import {
    requestAccountAddress,
    waitForAccountAuth,
} from '@celo/dappkit'
import { Linking } from 'expo'
import { ICommunity } from './types';
import { getAllPendingCommunities, getAllValidCommunities } from './api';
import config from './config';


const WALLET_ADDRESS = 'WALLET_ADDRESS';


export default function App() {
    const [pendingCommunities, setPendingCommunities] = useState<ICommunity[]>([]);
    const [validCommunities, setValidCommunities] = useState<ICommunity[]>([]);
    const [acceptingCommunityRequest, setAcceptingCommunityRequest] = useState<string>('');
    const [kit, setKit] = useState<ContractKit>();
    const [userAddress, setUserAddress] = useState<string | null>(null);

    useEffect(() => {
        const getUserWalletFromLocal = async () => {
            let value = null;
            try {
                value = await AsyncStorage.getItem(WALLET_ADDRESS);
            } catch (error) {
                // Error retrieving data
            }
            return value;
        };

        setKit(newKit(config.jsonRpc));
        getAllPendingCommunities().then(setPendingCommunities);
        getAllValidCommunities().then(setValidCommunities);
        getUserWalletFromLocal().then(setUserAddress)
    });

    const handleAcceptCommunity = (community: ICommunity) => {
        setAcceptingCommunityRequest(community.publicId);
        // TODO: send transaction
        // TODO: hold until transaction is done
        // TODO: update tables
    }

    const handleLoginWithCelo = async () => {
        const requestId = 'login'
        const dappName = 'Impact Market - Admin'
        const callback = Linking.makeUrl('/my/path')

        requestAccountAddress({
            requestId,
            dappName,
            callback,
        })

        const dappkitResponse = await waitForAccountAuth(requestId)
        try {
            await AsyncStorage.setItem(WALLET_ADDRESS, dappkitResponse.address);
            setUserAddress(dappkitResponse.address);
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

    return (
        <View style={styles.container}>
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
                        onPress={() => handleAcceptCommunity(community)}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

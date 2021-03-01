import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

export default function UBIScreen() {
    const navigation = useNavigation();
    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Button
                mode="contained"
                onPress={() => navigation.navigate('Pending')}
            >
                Pending Communities
            </Button>
        </View>
    );
}

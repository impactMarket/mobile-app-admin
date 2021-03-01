import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../../config';
import { kit } from '../../root';
import ImpactMarketAbi from '../contracts/ImpactMarketABI.json';
import { Contract } from 'web3-eth-contract';
import { AppData } from './constants';

export function loadImpactMarketContract() {
    const impactMarketContract = new kit.web3.eth.Contract(
        ImpactMarketAbi as any,
        config.impactMarketContractAddress
    );
    return impactMarketContract;
}

export async function loadUserWallet() {
    const _userAddress = await AsyncStorage.getItem(AppData.WALLET_ADDRESS);
    return _userAddress;
}

export async function verifyAdminRole(
    impactMarketContract: Contract,
    _userAddress: string
) {
    const _role = await impactMarketContract.methods.ADMIN_ROLE().call();
    const _isAdmin = await impactMarketContract.methods
        .hasRole(_role, _userAddress)
        .call();
    return _isAdmin;
}

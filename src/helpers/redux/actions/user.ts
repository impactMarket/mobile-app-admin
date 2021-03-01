import { userAction } from '../../constants';

export const setUserWalletAddressState = (address: string) => ({
    type: userAction.SET_ADDRESS,
    payload: address,
});
export const setIsAdminState = (isAdmin: boolean) => ({
    type: userAction.SET_IS_ADMIN,
    payload: isAdmin,
});

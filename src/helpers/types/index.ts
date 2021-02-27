import { userAction } from '../constants';

export interface IActionSetUserAddress {
    type: typeof userAction.SET_ADDRESS;
    payload: string;
}

export type IActionsUserState = IActionSetUserAddress;

export interface IUserState {
    address: string;
}

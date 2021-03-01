import { userAction } from '../constants';

export interface IActionSetUserAddress {
    type: typeof userAction.SET_ADDRESS;
    payload: string;
}

export interface IActionSetIsAdmin {
    type: typeof userAction.SET_IS_ADMIN;
    payload: boolean;
}

export type IActionsUserState = IActionSetUserAddress | IActionSetIsAdmin;

export interface IUserState {
    address: string;
    isAdmin: boolean;
}

export interface IRootState {
    user: IUserState;
}

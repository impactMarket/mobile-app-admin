import { userAction } from '../../constants';
import { IActionsUserState, IUserState } from '../../types';

const INITIAL_STATE: IUserState = {
    address: '',
    isAdmin: false,
};

export const userReducer = (
    state: IUserState = INITIAL_STATE,
    action: IActionsUserState
): IUserState => {
    switch (action.type) {
        case userAction.SET_ADDRESS:
            return { ...state, address: action.payload };

        case userAction.SET_IS_ADMIN:
            return { ...state, isAdmin: action.payload };

        default:
            return state;
    }
};

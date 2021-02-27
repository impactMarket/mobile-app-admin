import { userAction } from '../../constants';
import { IActionsUserState, IUserState } from '../../types';

const INITIAL_STATE: IUserState = {
    address: '',
};

export const userReducer = (
    state = INITIAL_STATE,
    action: IActionsUserState
) => {
    switch (action.type) {
        case userAction.SET_ADDRESS:
            return { ...state, address: action.payload };

        default:
            return state;
    }
};

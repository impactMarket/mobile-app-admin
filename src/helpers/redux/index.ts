import { combineReducers } from 'redux';
import { IRootState } from '../types';
import { userReducer } from './reducers/user';

export default combineReducers<IRootState>({
    user: userReducer,
});

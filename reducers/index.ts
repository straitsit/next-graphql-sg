import { combineReducers } from 'redux';
import user, { initialState as userState } from './user';

export const initialState = {
  user: userState,
};

const rootReducer = combineReducers({
  user
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>

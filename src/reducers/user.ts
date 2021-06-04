import { GET_USER, SET_USER } from '../constants/actionTypes';

export const initialState = {
    jwt: '',
    username: ''
};

const contract = (state = initialState, action) => {
    const { type, item, } = action;
    switch (type) {
        case GET_USER: {
            return { state };
        }
        case SET_USER: {
            return { jwt: item.jwt, username: item.username };
        }
        default: {
            return state;
        }
    }
};
export default contract;
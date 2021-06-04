import {
  GET_USER,
  SET_USER,
} from '../constants/actionTypes';

export const setUser = (item) => ({ type: SET_USER, item });
export const getuser = () => ({ type: GET_USER });
import {createAsyncAction, reduxWrap} from 'src/redux/reduxWrap';
import {Dispatch} from 'redux';
import UserService from 'src/services/UserService';
import {orderBy} from 'lodash';

const prefix = 'Steamatic/UserRoles/';
const load = `${prefix}Load`;
const loadComplete = `${prefix}LoadComplete`;
const reset = `${prefix}Reset`;
const error = `${prefix}Error`;

export const userRolesReducer = reduxWrap({load, loadComplete, reset, error});

export const resetUserRoles = () => {
  return (dispatch: Dispatch) => {
    dispatch({type: reset});
  };
};

export const loadUserRoles = () =>
  createAsyncAction(load, loadComplete, error, async () => {
    const res = await UserService.getRoles();
    return orderBy(res.data, ['display_name'], ['asc']);
  });

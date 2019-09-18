import {combineReducers, Dispatch, Reducer} from 'redux';
import {IAppState} from './index';
import * as React from 'react';

type modalType = 'Confirm';

export interface IReduxModal {
  confirm: {
    active: boolean;
    hash: string;
    title: string;
    body: React.ReactElement<unknown> | string | undefined;
  };
}

const OPEN_CONFIRM = 'Steamatic/Modal/Confirm/OPEN';
const CLOSE_CONFIRM = 'Steamatic/Modal/Confirm/CLOSE';

const confirmActiveReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case OPEN_CONFIRM:
      return true;
    case CLOSE_CONFIRM:
      return false;
    default:
      return state;
  }
};

const confirmHashReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case OPEN_CONFIRM:
      return action.payload.hash;
    case CLOSE_CONFIRM:
      return '';
    default:
      return state;
  }
};

const confirmTitleReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case OPEN_CONFIRM:
      return action.payload.title;
    case CLOSE_CONFIRM:
      return '';
    default:
      return state;
  }
};

const confirmBodyReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case OPEN_CONFIRM:
      return action.payload.body || '';
    case CLOSE_CONFIRM:
      return '';
    default:
      return state;
  }
};

export default combineReducers({
  confirm: combineReducers({
    active: confirmActiveReducer,
    hash: confirmHashReducer,
    title: confirmTitleReducer,
    body: confirmBodyReducer
  })
});

export const openModal = (
  type: modalType,
  title: string,
  body?: React.ReactElement<unknown> | string,
  footer?: React.ReactElement<unknown> | string
) => {
  return (dispatch: Dispatch, getState: () => IAppState) => {
    if (!getState().modal.confirm.active) {
      const hash = (Math.random() * 100000000).toFixed(0);
      dispatch({type: `Steamatic/Modal/${type}/OPEN`, payload: {hash, title, body}});

      if (type === 'Confirm') {
        const promise = new Promise(resolve => {
          window.addEventListener(`modal-confirm-${hash}`, (e: any) => {
            window.removeEventListener(`modal-confirm-${hash}`, () => false);
            resolve(e.detail);
          });
        });

        return promise;
      }
    }

    return false;
  };
};

export const closeModal = (type: modalType) => {
  return (dispatch: Dispatch) => {
    dispatch({type: `Steamatic/Modal/${type}/CLOSE`});
  };
};

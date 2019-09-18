import {combineReducers, Reducer} from 'redux';
import {IContactsSuccess} from 'src/services/ContactService';
import ContactService from 'src/services/ContactService';
import {IHttpError} from 'src/models/IHttpError';
import {createAsyncAction} from 'src/redux/reduxWrap';
import {IContact} from 'src/models/IContact';

const LOAD_LIST = 'Steamatic/Contact/LOAD_LIST';
const LOAD_LIST_COMPLETE = 'Steamatic/Contact/LOAD_LIST_COMPLETE';
const RESET = 'Steamatic/Contact/RESET';
const ERROR = 'Steamatic/Contact/ERROR';
const UPDATE_CONTACT = 'Steamatic/Contact/UPDATE_CONTACT';
const ADD_CONTACT = 'Steamatic/Contact/ADD_CONTACT';
const REMOVE_CONTACT = 'Steamatic/Contact/REMOVE_CONTACT';

export interface IContacts {
  data: IContactsSuccess | null;
  error: IHttpError | null;
  loading: boolean;
  ready: boolean;
}

const dataReducer: Reducer<IContactsSuccess | null> = (state = null, action = {type: null}) => {
  switch (action.type) {
    case LOAD_LIST_COMPLETE:
      return action.payload;
    case RESET:
      return null;

    case UPDATE_CONTACT:
      if (!state) {
        return null;
      }

      return {
        ...state,
        data: state.data.map(c => {
          if (c.id === action.payload.contactId) {
            return {...c, ...action.payload.data};
          }
          return c;
        })
      };

    case REMOVE_CONTACT:
      if (!state) {
        return null;
      }

      return {
        ...state,
        data: state.data.filter(c => c.id !== action.payload.contactId)
      };

    case ADD_CONTACT:
      if (!state) {
        return null;
      }

      return {
        ...state,
        data: [...state.data, action.payload.contact]
      };

    default:
      return state;
  }
};

const loadingReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case LOAD_LIST:
      return true;
    case LOAD_LIST_COMPLETE:
      return false;
    case RESET:
      return false;
    default:
      return state;
  }
};

const readyReducer: Reducer<boolean> = (state = false, action = {type: null}) => {
  switch (action.type) {
    case LOAD_LIST_COMPLETE:
      return true;
    case RESET:
      return false;
    default:
      return state;
  }
};

const errorReducer: Reducer<unknown> = (state = null, action = {type: null}) => {
  switch (action.type) {
    case ERROR:
      return action.payload;

    case LOAD_LIST_COMPLETE:
    case RESET:
      return null;

    default:
      return state;
  }
};

export default combineReducers({
  data: dataReducer,
  error: errorReducer,
  loading: loadingReducer,
  ready: readyReducer
});

export const loadList = (params: {}) => {
  return createAsyncAction(LOAD_LIST, LOAD_LIST_COMPLETE, ERROR, () => ContactService.getContacts(params));
};

export const updateContactInList = (contactId: number, data: Partial<IContact>) => {
  return {type: UPDATE_CONTACT, payload: {contactId, data}};
};

export const addContactToList = (contact: IContact) => {
  return {type: ADD_CONTACT, payload: {contact}};
};

export const removeContactFromList = (contactId: number) => {
  return {type: REMOVE_CONTACT, payload: {contactId}};
};

export const reset = () => {
  return {type: RESET};
};

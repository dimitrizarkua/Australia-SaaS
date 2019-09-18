import {Dispatch, Reducer} from 'redux';
import {ICurrentUser} from 'src/models/IUser';
import AuthService from 'src/services/AuthService';
import UserService, {IUserNotificationsSuccess} from 'src/services/UserService';
import {ILocation} from 'src/models/IAddress';
import {IUserNotification} from 'src/models/INotification';
import {IAppState} from './index';
import {injectBeaconScript} from 'src/services/ScriptService';

const SET_USER = 'Steamatic/User/SET_USER';
const SET_USER_NOTIFICATIONS = 'Steamatic/User/SET_USER_NOTIFICATIONS';
const SET_USER_LOCATIONS = 'Steamatic/User/SET_USER_LOCATIONS';
const START_LOAD_USER_NOTIFICATIONS = 'Steamatic/User/START_LOAD_USER_NOTIFICATIONS';

export const actionSetUser = (data: Partial<ICurrentUser>) => ({type: SET_USER, payload: data});

export interface IUserState {
  me: ICurrentUser | null;
  locations: ILocation[];
  userNotifications: {
    data: IUserNotificationsSuccess;
    loading: boolean;
  };
}

const initialState: IUserState = {
  me: null,
  locations: [],
  userNotifications: {
    data: {
      data: [] as IUserNotification[]
    } as IUserNotificationsSuccess,
    loading: false
  }
};

const reducer: Reducer<IUserState> = (state = initialState, action = {type: null}) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        me: {...state.me, ...action.payload}
      };
    case SET_USER_NOTIFICATIONS:
      return {
        ...state,
        userNotifications: {
          data: action.payload,
          loading: false
        }
      };
    case SET_USER_LOCATIONS:
      return {
        ...state,
        locations: action.payload
      };
    case START_LOAD_USER_NOTIFICATIONS:
      return {
        ...state,
        userNotifications: {
          data: state.userNotifications.data,
          loading: true
        }
      };
    default:
      return state;
  }
};

export default reducer;

export const updateCurrentUser = () => {
  return async (dispatch: Dispatch) => {
    const user = await AuthService.getCurrentUser();
    injectBeaconScript();
    dispatch(actionSetUser(user.data));
    return user.data;
  };
};

export const updateCurrentUserNotifications = () => {
  return async (dispatch: Dispatch) => {
    dispatch({type: START_LOAD_USER_NOTIFICATIONS});
    const userNotifications = await UserService.getMyUnreadNotifications();
    dispatch({type: SET_USER_NOTIFICATIONS, payload: userNotifications});
  };
};

export const loadLocations = () => {
  return async (dispatch: Dispatch) => {
    const locations = await UserService.getLocations();
    dispatch({type: SET_USER_LOCATIONS, payload: locations});
  };
};

export function selectCurrentUserId({user}: IAppState): null | number {
  return user.me && user.me.id;
}

export function selectUserPrimaryLocation({user}: IAppState): null | ILocation {
  return (user.me && user.me.locations!.find(l => l.primary)) || null;
}

export function selectUserLocations({user}: IAppState): ILocation[] {
  return user.me ? user.me.locations : [];
}

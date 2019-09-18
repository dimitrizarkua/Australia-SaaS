import HttpService, {availableUnauthorizationPageList, baseURL, Method} from './HttpService';
import SessionStorageService, {Key} from './SessionStorageService';
import CrossWindowsChannel from './CrossWindowsChannel';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {ICurrentUser} from 'src/models/IUser';
import {initEcho, updateAuthorization} from 'src/utility/Echo';

interface ILoginSuccess {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
}

const redirectToLoginPage = () => {
  removeTokens();
  window.location.replace('/login');
};

// Handler for receive and updating tokens
function receiveTokens({data: {[Key.refresh_token]: ref, [Key.access_token]: acc}}: any) {
  SessionStorageService.setItem(Key.access_token, acc);
  SessionStorageService.setItem(Key.refresh_token, ref);
  if (availableUnauthorizationPageList.includes(window.location.pathname)) {
    window.location.reload();
  } else {
    setUpTokenRefresher();
  }
}

// Save tokens in current tab and receive updated tokens to other tabs
function saveOAuthTokens(access: string, ref: string) {
  SessionStorageService.setItem(Key.access_token, access);
  SessionStorageService.setItem(Key.refresh_token, ref);
  setUpTokenRefresher();
  CrossWindowsChannel.messageBroadcast({
    type: 'token',
    data: {[Key.access_token]: access, [Key.refresh_token]: ref}
  });
}

// Add handler for updating tokens for several tabs
CrossWindowsChannel.addMessageHandler({type: 'token', handler: receiveTokens});

// payload for login request should be serialized as Form Data, that is why we do not use http.post here
const sendOAuthRequest = async (formData: FormData) => {
  try {
    const response = await window.fetch(`${baseURL}/oauth/token`, {
      method: Method.POST,
      mode: 'cors',
      cache: 'no-cache',
      body: formData
    });
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const responseJson: ILoginSuccess = await response.json();
    saveOAuthTokens(responseJson.access_token, responseJson.refresh_token);
    return responseJson;
  } catch (e) {
    throw e;
  }
};

const login = async (username: string, password: string): Promise<ILoginSuccess> => {
  const formData = new FormData();
  formData.append('grant_type', 'password');
  formData.append('username', username);
  formData.append('password', password);
  const response = await sendOAuthRequest(formData);
  initEcho();
  return response;
};

const loginWithOffice365 = async (accessToken: string): Promise<ILoginSuccess> => {
  const formData = new FormData();
  formData.append('grant_type', 'social');
  formData.append('network', 'office365');
  formData.append('access_token', accessToken);
  const response = await sendOAuthRequest(formData);
  initEcho();
  return response;
};

const removeTokens = () => {
  SessionStorageService.removeItem(Key.access_token);
  SessionStorageService.removeItem(Key.refresh_token);
};

const refresh = (refreshToken: string): Promise<any> => {
  const formData = new FormData();
  formData.append('grant_type', 'refresh_token');
  formData.append('refresh_token', refreshToken);
  return sendOAuthRequest(formData)
    .then(updateAuthorization)
    .catch(e => {
      removeTokens();
      throw e;
    });
};

const reAuthChecking = () => refresh(SessionStorageService.getItem<string>(Key.refresh_token) as string);

type IUserSuccess = IObjectEnvelope<ICurrentUser>;

const getCurrentUser = async (): Promise<IUserSuccess> => {
  const res = await HttpService.get<IObjectEnvelope<any>>('/v1/me');
  return {
    data: {
      ...res.data,
      permissions: new Set(res.data.permissions)
    }
  };
};

// Decrease time in accuracy factor for preventive incorrectly timers execute
// For example "debugger", "decreasing" timers in inactive tabs and e.t.c.
function computeWithAccuracyMap(value: number, accuracyMap: {}): number {
  const keyArray = Object.keys(accuracyMap)
    .map(i => +i)
    .reverse();
  let resultFactorKey = keyArray[0];
  keyArray.forEach(el => {
    if (value <= el) {
      resultFactorKey = el;
    }
  });
  return value * accuracyMap[resultFactorKey];
}

const REFRESH_THRESHOLD_SECONDS = 240;
const accuracyFactorBySecond = {
  21600: 0.9,
  3600: 0.7,
  600: 0.5
};
let activeTimeout: any;

const setUpTokenRefresher = (): any => {
  const accessToken = SessionStorageService.getItem<string>(Key.access_token);
  const refreshToken = SessionStorageService.getItem<string>(Key.refresh_token);
  if (!accessToken || !refreshToken) {
    return;
  }

  let payload;
  try {
    payload = JSON.parse(atob(accessToken.split('.')[1]));
  } catch (err) {
    return;
  }

  const diff = payload.exp - Date.now() / 1000;
  if (diff <= 0) {
    // Token has expired, we can't refresh it
    return redirectToLoginPage();
  }
  const correctedDiff = computeWithAccuracyMap(diff, accuracyFactorBySecond);
  if (correctedDiff <= REFRESH_THRESHOLD_SECONDS) {
    refresh(refreshToken);
  } else {
    clearTimeout(activeTimeout);
    activeTimeout = setTimeout(setUpTokenRefresher, (correctedDiff - REFRESH_THRESHOLD_SECONDS) * 1000);
  }
};

function bindAuthEvents() {
  window.onblur = () => clearTimeout(activeTimeout);
  window.onfocus = setUpTokenRefresher;
}

setUpTokenRefresher();
bindAuthEvents();

export default {
  reAuthChecking,
  redirectToLoginPage,
  login,
  loginWithOffice365,
  getCurrentUser
};

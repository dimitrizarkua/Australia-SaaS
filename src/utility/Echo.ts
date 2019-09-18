import 'pusher-js';
import Echo from 'laravel-echo';
import EchoType from 'laravel-echo/dist/echo.d';
import {baseURL} from 'src/services/HttpService';
import SessionStorageService, {Key} from 'src/services/SessionStorageService';

let echoInstance: EchoType;

const getAuthorizationHeader = () => `Bearer ${SessionStorageService.getItem(Key.access_token)}`;

export const initEcho = () => {
  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: process.env.REACT_APP_PUSHER_KEY,
    cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    encrypted: true,
    authEndpoint: `${baseURL}/v1/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: getAuthorizationHeader()
      }
    }
  });
};

export const updateAuthorization = () => {
  if (echoInstance) {
    echoInstance.connector.pusher.config.auth.headers.Authorization = getAuthorizationHeader();
  }
};

export const getEcho = () => echoInstance;

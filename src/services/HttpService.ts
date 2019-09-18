import SessionStorageService, {Key} from './SessionStorageService';
import {stringify} from './QueryStringService';
import {IHttpError} from 'src/models/IHttpError';
import Notify, {NotifyType} from 'src/utility/Notify';
import AuthService from './AuthService';

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export enum ContentType {
  JSON = 'application/json',
  FORM = 'multipart/form-data',
  STREAM = 'application/octet-stream'
}

export const availableUnauthorizationPageList = ['/login', '/unauthorized'];

export interface IControlledRequest {
  promise: Promise<any>;
  controller: AbortController | undefined;
}

export interface IRequestPaginationConfig {
  per_page: number;
  page: number;
}

// For wrapper "withController" bellow
// "optionPosition" it is number of argument in you wrapped function, that is taking "fetchOptions" params

export const withController = (fetch: (...temp: any[]) => Promise<any>, optionPosition: number) => (
  ...args: any[]
): IControlledRequest => {
  let controller;
  if ('AbortController' in window) {
    controller = new AbortController();
  }
  // Number "3" bellow it's number of "fetchOptions" argument in makeJsonRequest, makeFormRequest methods,
  // it is so mechanism of unification transfer signal to final "fetch"
  const correctArgs = args.slice(0, 3);
  correctArgs[optionPosition - 1] = {
    ...correctArgs[optionPosition - 1],
    signal: controller && controller.signal
  };

  return {
    promise: fetch.apply(null, correctArgs),
    controller
  };
};

export const baseURL = process.env.REACT_APP_API_BASE_URL;

const makeJsonRequest = <T>(type: Method, path: string, data?: any, fetchOptions?: {}): Promise<T> => {
  return makeRequest<T>(type, ContentType.JSON, path, data, fetchOptions);
};

const makeFormRequest = <T>(path: string, data: FormData): Promise<T> => {
  return makeRequest<T>(Method.POST, ContentType.FORM, path, data);
};

const makeRequest = async <T>(
  type: Method,
  contentType: ContentType,
  path: string,
  data?: any,
  fetchOptions?: {}
): Promise<T> => {
  const token = SessionStorageService.getItem<string>(Key.access_token);
  const headers = {
    Accept: ContentType.JSON,
    Authorization: `Bearer ${token}`
  };
  if (contentType === ContentType.JSON) {
    headers['Content-Type'] = ContentType.JSON;
  }
  const body = contentType === ContentType.JSON ? data && JSON.stringify(data) : data;
  const response = await window.fetch(`${baseURL}${path}`, {
    ...fetchOptions,
    method: type,
    mode: 'cors',
    cache: 'no-cache',
    headers,
    body
  });
  if (!response.ok) {
    await errorHandler(response);
  }
  return response.json();
};

const errorStatusHandler = async (response: Response) => {
  switch (response.status) {
    case 401: {
      if (availableUnauthorizationPageList.includes(window.location.pathname)) {
        return;
      }

      // TODO add something as like "waitingRequestList" for collecting requests, that are were shipped in "unauth" time
      AuthService.reAuthChecking().catch(AuthService.redirectToLoginPage);
    }
    default:
      return response.json();
  }
};

const errorHandler = (response: Response) => {
  return errorStatusHandler(response).then(defaultErrorHandler);
};

const defaultErrorHandler = async (error: Promise<any>) => {
  if (!error) {
    return;
  }
  const e: IHttpError = (await error) as IHttpError;
  const message = e.error_message || e.message;
  if (message) {
    Notify(NotifyType.Danger, message);
  }
  throw e;
};

const makeDownloadRequest = async (path: string): Promise<Blob> => {
  const token = SessionStorageService.getItem<string>(Key.access_token);
  const response = await window.fetch(`${baseURL}${path}`, {
    method: Method.GET,
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      Accept: ContentType.STREAM,
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    await errorHandler(response);
  }
  return response.blob();
};

const get = <T>(path: string, params?: any, fetchOptions?: {}) => {
  return makeJsonRequest<T>(Method.GET, `${path}${stringify(params)}`, null, fetchOptions);
};

const post = <T>(path: string, data?: any, fetchOptions?: {}) => {
  return makeJsonRequest<T>(Method.POST, path, data, fetchOptions);
};

const patch = <T>(path: string, data?: any) => {
  return makeJsonRequest<T>(Method.PATCH, path, data);
};

const put = <T>(path: string, data?: any) => {
  return makeJsonRequest<T>(Method.PUT, path, data);
};

const remove = <T>(path: string, data?: any, fetchOptions?: {}) => {
  return makeJsonRequest<T>(Method.DELETE, path, data, fetchOptions);
};

const postFormData = <T>(path: string, data: FormData) => {
  return makeFormRequest<T>(path, data);
};

const downloadFile = (path: string) => {
  return makeDownloadRequest(path);
};

export default {
  get,
  post,
  patch,
  remove,
  put,
  postFormData,
  downloadFile,
  errorHandler
};

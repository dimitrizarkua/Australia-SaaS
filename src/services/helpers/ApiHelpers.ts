import HttpService from 'src/services/HttpService';
import {IEntity} from 'src/models/IEntity';

export interface IBaseConfigCreateAPI {
  name: string;
  path: string;
}

export interface IConfigCreateAPI extends IBaseConfigCreateAPI {
  method?: 'get' | 'post' | 'delete' | 'patch';
  dehydrate?: (data: any) => any;
  hydrate?: (data: any) => any;
}

export const getEntityById = (data: IEntity[], id?: number) => {
  const entity = id !== undefined ? data.find((ent: IEntity) => ent.id === id) : undefined;
  return entity;
};

export function createListingApi<T>(prefix: string, config: IBaseConfigCreateAPI[]) {
  const apiMethods = {};
  config.forEach(({name, path}) => {
    apiMethods[name] = async (params?: {}): Promise<T> => await HttpService.get<T>(`${prefix}/${path}`, params);
  });
  return apiMethods;
}

export function createFinanceListingApi<T, T1>(prefix: string, endpoints: object) {
  const config = [];
  for (const key in endpoints) {
    if (endpoints.hasOwnProperty(key)) {
      config.push({name: key, path: endpoints[key]});
    }
  }
  return {
    ...createListingApi<T>(prefix, config),
    getInfo: async (): Promise<T1> => await HttpService.get<T1>(`${prefix}/info`)
  };
}

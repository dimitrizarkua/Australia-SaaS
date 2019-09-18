import HttpService, {withController} from './HttpService';
import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';
import {IAddress, ICountry, ILocation, IState, ISuburb} from 'src/models/IAddress';
import {IRawContactAddress} from 'src/models/IContact';
import AddressTransformer from 'src/transformers/AddressTransformer';
import PageSizes from 'src/constants/PageSizes';

export type ICountriesSuccess = IListEnvelope<ICountry>;
export type IStatesSuccess = IListEnvelope<IState>;
export type ISuburbSuccess = IListEnvelope<ISuburb>;
export type ISuburbSuccess2 = IObjectEnvelope<ISuburb>;
export type IAddressSuccess = IObjectEnvelope<IAddress>;
export type IRawContactAddressSuccess = IObjectEnvelope<IRawContactAddress>;
export type ILocationsSuccess = IListEnvelope<ILocation>;

const searchCountries = async (params: {} = {}): Promise<ICountriesSuccess> => {
  return await HttpService.get<ICountriesSuccess>('/v1/countries', {...params, per_page: PageSizes.Huge});
};

const searchStates = async (params: {} = {}): Promise<IStatesSuccess> => {
  return await HttpService.get<IStatesSuccess>('/v1/states', params);
};

const getSuburbs = async (params: {} = {}): Promise<ISuburbSuccess> => {
  return await HttpService.get<ISuburbSuccess>('/v1/suburbs', params);
};

const searchSuburbs = async (
  search: string = 'a',
  stateId: string | number = '',
  count: number = 10
): Promise<ISuburbSuccess2> => {
  return await HttpService.get<ISuburbSuccess2>(
    `/v1/suburbs/search?term=${search}&${stateId ? `state_id=${stateId}&` : ''}count=${count}`
  );
};

const searchLocations = async (params?: {}, fetchOptions?: {}): Promise<ILocationsSuccess> => {
  return await HttpService.get<ILocationsSuccess>('/v1/locations', params, fetchOptions);
};

const create = async (data: Partial<IAddress>): Promise<IAddressSuccess> => {
  return await HttpService.post<IAddressSuccess>(`/v1/addresses/`, AddressTransformer.dehydrate(data));
};

const update = async (id: string | number, data: Partial<IAddress>): Promise<IRawContactAddressSuccess> => {
  return await HttpService.put<IRawContactAddressSuccess>(`/v1/addresses/${id}`, AddressTransformer.dehydrate(data));
};

const expandAddress = (address: IRawContactAddressSuccess): IAddress => {
  return AddressTransformer.hydrateContactAddress(address.data);
};

const getLocationsWithController = withController(searchLocations, 2);

export default {
  getLocationsWithController,
  searchCountries,
  searchStates,
  getSuburbs,
  searchSuburbs,
  searchLocations,
  create,
  update,
  expandAddress
};

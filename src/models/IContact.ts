import {IAddress, ICountry} from './IAddress';
import {IPerson} from './IPerson';
import {ICompany} from './ICompany';
import {ITag} from './ITag';
import {ContactStatuses} from 'src/models/IContactStatus';

export interface IBaseContact {
  id: number;
  contact_type: ContactType;
  contact_status: {
    id: number;
    status: ContactStatuses;
  };
  contact_category: IContactCategory;
  address: IContactAddress;
  mailing_address: IContactAddress;
  addresses: IRawContactAddress[];
  has_alerts?: boolean;
  tags?: ITag[];
  subsidiaries: IPerson[] & ICompany[];
  is_archived: boolean;
}

export enum ContactCategories {
  Customer = 'customer',
  Supplier = 'supplier',
  Insurer = 'insurer',
  Broker = 'broker',
  LossAdjustor = 'loss_adjustor',
  CompanyLocations = 'company_location'
}

export type IContact = IPerson | ICompany;

export interface IContactCategory {
  id: number;
  name: string;
  type: ContactCategories;
}

export enum ContactType {
  person = 'person',
  company = 'company'
}

export interface IContactAddress extends IAddress {
  type: AddressType;
  full_address?: string;
}

export interface IRawContactAddress {
  id: number;
  type: AddressType;
  address_line_1: string;
  address_line_2: string;
  contact_name: string;
  full_address?: string;
  suburb?: {
    id: number;
    name: string;
    postcode: string;
    state: {
      code: string;
      id: number;
      name: string;
      country: ICountry;
    };
  };
}

export enum AddressType {
  street = 'street',
  mailing = 'mailing',
  home = 'home',
  business = 'business',
  billing = 'billing',
  shipping = 'shipping'
}

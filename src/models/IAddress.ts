export interface IAddress {
  id: number;
  suburb?: ISuburb;
  country?: ICountry;
  state?: IState;
  postcode?: string;
  address_line_1: string;
  address_line_2?: string;
}

export interface ICountry {
  id: number;
  name: string;
}

export interface IState {
  id: number;
  country_id: number;
  name: string;
  code: string;
}

export interface ISuburb {
  id: number;
  state_id: number;
  name: string;
  postcode: string;
}

export interface ILocation {
  id: number;
  name: string;
  code: string;
  primary: boolean;
  tz_offset: number;
}

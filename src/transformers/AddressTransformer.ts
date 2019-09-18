import {IContactAddress, IRawContactAddress} from 'src/models/IContact';
import {IAddress} from 'src/models/IAddress';

const hydrateContactAddress = (data: IRawContactAddress): IContactAddress => {
  const address: IContactAddress = {
    type: data.type,
    id: data.id,
    address_line_1: data.address_line_1,
    address_line_2: data.address_line_2,
    full_address: data.full_address
  };
  if (data.suburb) {
    address.suburb = {
      id: data.suburb.id,
      name: data.suburb.name,
      state_id: data.suburb.state.id,
      postcode: data.suburb.postcode
    };
    address.postcode = data.suburb.postcode;
    address.state = {
      id: data.suburb.state.id,
      name: data.suburb.state.name,
      code: data.suburb.state.code,
      country_id: data.suburb.state.country.id
    };
    address.country = data.suburb.state.country;
  }
  return address;
};

const dehydrate = (address: Partial<IAddress>) => {
  return {
    address_line_1: address.address_line_1,
    suburb_id: address.suburb && address.suburb.id
  };
};

export default {
  hydrateContactAddress,
  dehydrate
};

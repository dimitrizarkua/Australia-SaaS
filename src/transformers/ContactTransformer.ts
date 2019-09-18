import {AddressType, IContact, IRawContactAddress} from 'src/models/IContact';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import AddressTransformer from 'src/transformers/AddressTransformer';
import {IHttpError} from 'src/models/IHttpError';

const hydrate = (res: IObjectEnvelope<any>): IObjectEnvelope<IContact> => {
  const addressMap = res.data.addresses.reduce((map: {}, address: IRawContactAddress) => {
    map[address.type] = address;
    return map;
  }, {});

  const contact = {
    ...res.data,
    address: AddressTransformer.hydrateContactAddress(addressMap[AddressType.street] || {type: AddressType.street}),
    mailing_address: AddressTransformer.hydrateContactAddress(
      addressMap[AddressType.mailing] || {type: AddressType.mailing}
    )
  };
  delete contact.addresses;
  return {data: contact};
};

const hydrateError = (err: IHttpError): IHttpError => {
  const result = {...err};
  if (result.fields) {
    result.fields = {
      first_name: err.fields.first_name,
      last_name: err.fields.last_name,
      job_title: err.fields.job_title,
      email: err.fields.email,
      business_phone: err.fields.business_phone,
      mobile_phone: err.fields.mobile_phone,
      direct_phone: err.fields.direct_phone,
      legal_name: err.fields.legal_name,
      trading_name: err.fields.trading_name,
      abn: err.fields.abn,
      website: err.fields.website,
      default_payment_terms_days: err.fields.default_payment_terms_days
    };
  }
  return result;
};

export default {
  hydrate,
  hydrateError
};

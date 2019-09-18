import {createValidator, required, requireId, unsignedInt} from 'src/services/ValidationService';
import {ContactType, IContact, IContactAddress} from 'src/models/IContact';
import {ICompany} from 'src/models/ICompany';
import ContactService from 'src/services/ContactService';
import {IProps} from './CompanyForm';

const addressRules = {
  address_line_1: [required],
  suburb: [requireId]
};

export default createValidator<ICompany>(
  {
    legal_name: [required],
    abn: [required],
    default_payment_terms_days: [required, unsignedInt],
    business_phone: [required],
    address: addressRules
  },
  (data, errors) => {
    if (data.mailing_address) {
      if (data.mailing_address.suburb || data.mailing_address.address_line_1) {
        errors.mailing_address = createValidator<IContactAddress>(addressRules)(data.mailing_address);
      }
    }
    return errors;
  }
);

export const asyncValidator = async (data: ICompany, dispatch: unknown, props: IProps) => {
  const params = {term: data.legal_name, contact_type: ContactType.company};
  const contacts = await ContactService.searchContacts(params);
  const errors: any = {};
  const match = contacts.data.find((contact: IContact) => {
    const company = contact as ICompany;
    return company.legal_name === data.legal_name && company.id !== props.company.id;
  });
  if (match) {
    errors.legal_name = 'Company with this name already exists';
    return Promise.reject(errors);
  }
  return Promise.resolve();
};

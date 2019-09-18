import {createValidator, overrideMessage, required, requireId} from 'src/services/ValidationService';
import {ContactType, IContact, IContactAddress} from 'src/models/IContact';
import {IPerson} from 'src/models/IPerson';
import ContactService from 'src/services/ContactService';
import {IProps} from './PersonForm';

const addressRules = {
  address_line_1: [required],
  suburb: [requireId]
};

export default createValidator<IPerson>(
  {
    first_name: [required],
    last_name: [required],
    address: addressRules
  },
  (data, errors) => {
    if (data.mailing_address) {
      if (data.mailing_address.suburb || data.mailing_address.address_line_1) {
        errors.mailing_address = createValidator<IContactAddress>(addressRules)(data.mailing_address);
      }
    }
    const phone = data.business_phone || data.direct_phone || data.mobile_phone;
    // direct phone is vertically the last phone number in the form, that is why, we could attach phone error there.
    errors.direct_phone = overrideMessage(required, 'One phone number is required')(phone);
    return errors;
  }
);

export const asyncValidator = async (data: IPerson, dispatch: unknown, props: IProps) => {
  const params = {term: `${data.first_name} ${data.last_name}`, contact_type: ContactType.person};
  const contacts = await ContactService.searchContacts(params);
  const errors: any = {};
  const match = contacts.data.find((contact: IContact) => {
    const person = contact as IPerson;
    return (
      person.first_name === data.first_name && person.last_name === data.last_name && person.id !== props.person.id
    );
  });
  if (match) {
    errors.first_name = 'Contact with same name already exists';
    return Promise.reject(errors);
  }
  return Promise.resolve();
};

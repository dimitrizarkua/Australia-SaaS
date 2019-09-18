import * as React from 'react';
import {AddressType} from 'src/models/IContact';
import {IPerson} from 'src/models/IPerson';
import {ICompany} from 'src/models/ICompany';
import {IContact} from 'src/models/IContact';
import {IContactAssignment} from 'src/models/IJob';
import {OptionContainer, BoldText, GrayText} from './OptionComponents';

interface IProps {
  contact: Partial<IContact> | Partial<IContactAssignment>;
  disabled?: boolean;
}

const ContactSelectOption = (props: IProps) => {
  const {contact, disabled} = props;
  let address;
  let stateCode;
  let name;

  if ((contact as IContactAssignment).addresses) {
    address = (contact as IContactAssignment).addresses.filter((a: any) => a.type === AddressType.street)[0];
    stateCode = address && address.suburb!.state.code;
  } else {
    address = contact.address;
    stateCode = address && address.state!.code;
  }

  if ((contact as ICompany).legal_name) {
    name = (contact as ICompany).legal_name;
  } else if ((contact as IPerson).first_name) {
    name = `${(contact as IPerson).first_name} ${(contact as IPerson).last_name}`;
  } else if ((contact as IContactAssignment).first_name) {
    name = `${(contact as IContactAssignment).first_name} ${(contact as IContactAssignment).last_name}`;
  }

  return (
    <OptionContainer>
      <BoldText disabled={disabled}>{name}</BoldText>
      {address && (
        <GrayText>
          {address.address_line_1}
          {address.suburb && `, ${address.suburb.name} ${stateCode || ''}`}
        </GrayText>
      )}
    </OptionContainer>
  );
};

export default ContactSelectOption;

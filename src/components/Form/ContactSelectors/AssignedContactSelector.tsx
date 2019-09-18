import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import InputWithHint from './InputWithHint';
import {IContactAssignment} from 'src/models/IJob';
import ContactSelectOption from './ContactSelectOption';

interface IContactAssigmentOption extends IContactAssignment {
  disabled?: boolean;
}

interface IProps extends WrappedFieldProps {
  onSelect?: (el: any) => any;
  label?: string;
  className?: string;
  loading?: boolean;
  assignedContacts?: IContactAssigmentOption[];
  contactValue?: string;
  disabled?: boolean;
}

class AssignedContactSelector extends React.PureComponent<IProps> {
  private includeInFullName(option: IContactAssigmentOption) {
    return option.first_name && option.last_name && this.includeInContact(`${option.first_name} ${option.last_name}`);
  }

  private includeInFields(option: IContactAssigmentOption) {
    return ['first_name', 'last_name', 'legal_name', 'email', 'mobile_phone'].find(field =>
      this.includeInContact(option[field])
    );
  }

  private includeInContact(value?: string) {
    return !!this.props.contactValue && !!value && value.toLowerCase().includes(this.props.contactValue.toLowerCase());
  }

  private renderHintForToField = () => {
    const {assignedContacts, loading} = this.props;
    if (!assignedContacts) {
      return null;
    }
    const clone = assignedContacts.filter(
      (o: IContactAssigmentOption) => this.includeInFullName(o) || this.includeInFields(o)
    );

    if (loading) {
      return <div className="dropdown-header">Loading...</div>;
    }
    if (!clone.length) {
      return null;
    }
    return clone
      .sort(c => +!!c.disabled)
      .map((el, index) => (
        <div key={`drd-i-${index}`} className="dropdown-item" onClick={() => this.selectContact(el)}>
          <ContactSelectOption contact={el} disabled={el.disabled} />
        </div>
      ));
  };

  private selectContact = (contact: IContactAssigmentOption) => {
    if (!contact.disabled && this.props.onSelect) {
      this.props.onSelect(contact);
    }
  };

  public render() {
    return (
      <InputWithHint
        input={this.props.input}
        meta={this.props.meta}
        placeholder="Select..."
        label={this.props.label}
        className={this.props.className}
        hint={this.renderHintForToField()}
        disabled={this.props.disabled}
      />
    );
  }
}

export default AssignedContactSelector;

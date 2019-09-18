import * as React from 'react';
import {Field, FieldArray, FieldsProps, InjectedFormProps, reduxForm, WrappedFieldArrayProps} from 'redux-form';
import debounce from 'debounce-promise';
import ContactService from 'src/services/ContactService';
import Delimiter from 'src/components/Form/Delimiter';
import {IContactAssignment, IAssignment} from 'src/models/IJob';
import {ITag} from 'src/models/ITag';
import {IContact} from 'src/models/IContact';
import Select from 'src/components/Form/Select';
import SelectAsync from 'src/components/Form/SelectAsync';
import ContactSelectOption from 'src/components/Form/ContactSelectors/ContactSelectOption';
import Icon, {IconName} from 'src/components/Icon/Icon';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import RadioInput from 'src/components/Form/RadioInput';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import JobContactsFormValidator from './JobContactsFormValidator';

interface IOwnProps {
  assignmentTypes: IAssignment[];
}

type IProps = InjectedFormProps<IFormData, IOwnProps> & IOwnProps;

export interface IFormContact {
  contact: IContact;
  assignment_type: IAssignment;
}

export interface IFormData {
  contacts: IFormContact[];
  invoiceToKey: string | null;
}

export const uniqueKey = (c: IContactAssignment | IFormContact) => `${c.contact.id}-${c.assignment_type.id}`;

const WarningColumn = styled.div`
  width: 20px;
  padding: auto;
  text-align: center;

  & path,
  circle {
    stroke: ${ColorPalette.orange1};
  }

  & svg {
    margin-top: 7px;
  }
`;

const RadioColumn = styled.div`
  width: 30px;
  padding-left: 10px;
  text-align: center;
  display: flex;
  align-items: center;
`;

const InvoiceColumn = styled.div`
  padding-top: 8px;
  text-align: center;
  font-size: ${Typography.size.smaller};
  color: ${ColorPalette.gray4};
  padding-left: 10px;
`;

const AddContact = styled.span`
  margin-bottom: ${Typography.size.smaller};
  display: inline-block;
  color: ${ColorPalette.blue4};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const DoneButtonWrapper = styled.div`
  margin-top: 5px;
`;

const FormInternalWrapper = styled.div`
  position: relative;
  min-height: 100px;
`;

class JobContactsForm extends React.PureComponent<IProps> {
  private static customTypeSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      maxHeight: 33.5,
      minHeight: 'auto',
      borderColor: ColorPalette.gray2,
      backgroundColor: 'transparent',
      paddingTop: 0,
      paddingBottom: 0
    })
  };

  private static customContactSelectStyles = {
    menu: (provided: any) => ({
      ...provided,
      minWidth: '330px'
    })
  };

  private addContact = (fields: FieldsProps<Partial<IContactAssignment>>) => {
    const {assignmentTypes} = this.props;
    const firstNotUniqueType = assignmentTypes.find(assignment => !assignment.is_unique);
    return () =>
      fields.push({
        assignment_type: firstNotUniqueType
      });
  };

  private loadContacts = async (query: string) => {
    const params = {
      term: query
    };
    const res = await ContactService.searchContacts(params);
    return res.data;
  };

  private debouncedLoadContacts = debounce(this.loadContacts, 1000);

  private getContactLabel = (contact: Partial<IContact>) => {
    return <ContactSelectOption contact={contact} />;
  };

  private getAvailableAssignments(fields: FieldsProps<Partial<IFormContact>>) {
    const values = fields.getAll();
    return this.props.assignmentTypes.filter(
      assignment =>
        !assignment.is_unique ||
        !values.find(v => {
          return !!v.assignment_type && v.assignment_type.name === assignment.name;
        })
    );
  }

  private renderContactsList = (data: WrappedFieldArrayProps<Partial<IFormContact>>) => {
    return (
      <div>
        {data.fields.map((contact: string, index: number, fieldsData: FieldsProps<Partial<IFormContact>>) => {
          const contactData = fieldsData.get(index);
          return (
            <div className="row" key={index}>
              <div className="col col-lg-2 col-xl-3">
                <Field
                  name={`${contact}.assignment_type`}
                  placeholder="Assignment Type"
                  component={Select}
                  options={this.getAvailableAssignments(data.fields)}
                  getOptionValue={(option: IAssignment) => option.id.toString()}
                  getOptionLabel={(option: IAssignment) => option.name.toString()}
                  selectStyles={JobContactsForm.customTypeSelectStyles}
                />
              </div>
              <div className="col col-lg-7 col-xl-6">
                <Field
                  name={`${contact}.contact`}
                  placeholder="Start typing to search..."
                  component={SelectAsync}
                  isClearable={true}
                  loadOptions={this.debouncedLoadContacts}
                  getOptionValue={(option: Partial<IContact>) => option.id}
                  getOptionLabel={this.getContactLabel}
                  selectStyles={JobContactsForm.customContactSelectStyles}
                />
              </div>
              <WarningColumn>
                {contactData.contact &&
                  (contactData.contact.has_alerts ||
                    (contactData.contact.tags && contactData.contact.tags.find((tag: ITag) => tag.is_alert))) && (
                    <Icon className="align-self-center" name={IconName.Alert} />
                  )}
              </WarningColumn>
              <RadioColumn>
                <Field
                  name="invoiceToKey"
                  component={RadioInput}
                  optionValue={
                    contactData.assignment_type && contactData.contact ? uniqueKey(contactData as IFormContact) : index
                  }
                  disabled={!contactData.contact}
                />
              </RadioColumn>
              <InvoiceColumn>Invoice To</InvoiceColumn>
            </div>
          );
        })}
        <div className="row">
          <div className="col-6 offset-2 offset-xl-3">
            <AddContact onClick={this.addContact(data.fields)}>Add contact</AddContact>
            <DoneButtonWrapper>
              <PrimaryButton type="submit" className="btn" disabled={this.props.submitting}>
                Done
              </PrimaryButton>
            </DoneButtonWrapper>
          </div>
        </div>
      </div>
    );
  };

  public render() {
    const {assignmentTypes, submitting} = this.props;
    return (
      <form onSubmit={this.props.handleSubmit}>
        <FormInternalWrapper>
          {submitting && <BlockLoading size={40} color={ColorPalette.white} />}
          {assignmentTypes.length > 0 && <FieldArray name="contacts" component={this.renderContactsList} />}
        </FormInternalWrapper>
        <Delimiter />
      </form>
    );
  }
}

export default reduxForm<IFormData, IOwnProps>({
  form: 'JobContactsForm',
  validate: JobContactsFormValidator,
  enableReinitialize: true
})(JobContactsForm);

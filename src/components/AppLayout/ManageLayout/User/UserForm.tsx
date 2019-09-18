import React, {FormEvent} from 'react';
import {ConfigProps, Field, formValues, InjectedFormProps, reduxForm} from 'redux-form';
import Input from 'src/components/Form/Input';
import {IUser, IUserRole} from 'src/models/IUser';
import {compose} from 'redux';
import Delimiter from 'src/components/Form/Delimiter';
import styled from 'styled-components';
import UserFormValidation from './UserFormValidation';
import Typography from 'src/constants/Typography';
import Select from 'src/components/Form/Select';
import {ILocation} from 'src/models/IAddress';
import {IOptions} from 'tslint';
import debounce from 'debounce-promise';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import InvertedPrimaryButton from 'src/components/Buttons/InvertedPrimaryButton';
import AvatarForm from './AvatarForm';
import CheckboxList, {ICheckboxListItem} from 'src/components/Form/CheckboxList';
import {getUserNames} from 'src/utility/Helpers';
import SelectAsync from 'src/components/Form/SelectAsync';
import ContactService from 'src/services/ContactService';
import {ContactType, IContact} from 'src/models/IContact';
import {ICompany} from 'src/models/ICompany';
import {IPerson} from 'src/models/IPerson';

interface IUserForm {
  user: IUser;
  roleList: IUserRole[];
  locationList: ILocation[];
  isCurrentUser: boolean;
  onDelete: () => void;
  isDisabledDeleting: boolean;
  isDisabledUpdating: boolean;
  onSubmit: (data: any) => void;
  changeAvatar: (data: File) => Promise<any>;
}

interface IFormInitial extends Partial<IUser> {
  primary_location: ILocation;
}

interface IFormProps {
  primaryLocation: ILocation;
}

const gridRowClasses = 'row col-lg-8';
const gridDelimetrClasses = 'row col-10';
const fixGridOffset = '15px';

const FormTitle = styled.div`
  font-weight: ${Typography.weight.bold};
  margin-bottom: 15px;
  margin-left: 0;
`;

const LocalDelemetr = styled(Delimiter)`
  margin-left: ${fixGridOffset};
  margin-right: ${fixGridOffset};
`;

const Form = styled.form`
  margin-bottom: 20px;
`;

const AvatarArea = styled.div`
  padding: 20px;
`;

const FormInner = styled.div`
  max-width: 1140px;
`;

class UserForm extends React.PureComponent<
  InjectedFormProps<IUser & IFormInitial, IUserForm> & IUserForm & IFormProps
> {
  private companyLoadController?: AbortController;
  private handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    return this.props.handleSubmit(this.props.onSubmit)();
  };

  private getOptionLabel = (label: string) => (option: Partial<IOptions>) => option[label];

  private contactGetLabel = (contact: IContact): string => {
    switch (contact.contact_type) {
      case ContactType.company:
        return (contact as ICompany).legal_name;
      case ContactType.person:
        const {last_name, first_name} = contact as IPerson;
        return first_name + ' ' + last_name;
    }
  };

  private transformToCheckbox = (location: ILocation): ICheckboxListItem => {
    const {primaryLocation} = this.props;
    const currentPrimary = primaryLocation && primaryLocation.id;
    return {
      id: location.id,
      label: location.name,
      unremovable: !!(currentPrimary && currentPrimary === location.id)
    };
  };

  private loadContacts = (value: string) => {
    if (this.companyLoadController) {
      this.companyLoadController.abort();
    }
    const {controller, promise} = ContactService.searchContactWC({term: value});
    this.companyLoadController = controller;
    return promise.then(res => res.data);
  };

  private debouncedLoadContact = debounce(this.loadContacts, 700);

  private handleChangeLocation = (id: number) => {
    const {change, primaryLocation, locationList} = this.props;
    if (!primaryLocation) {
      change('primary_location', locationList.find(l => l.id === id));
    }
  };

  private optionToValue = (item: any) => item.id.toString();

  public render() {
    const {
      roleList,
      locationList,
      onDelete,
      changeAvatar,
      user,
      isCurrentUser,
      dirty,
      valid,
      isDisabledDeleting,
      isDisabledUpdating
    } = this.props;
    return (
      <Form className="w-100" onSubmit={this.handleSubmit} autoComplete="off">
        <FormInner className="row d-flex">
          <AvatarArea>
            <AvatarForm
              disabled={!isCurrentUser || isDisabledUpdating}
              handleSave={changeAvatar}
              initialUrl={user.avatar && user.avatar!.url}
              initials={getUserNames(user).initials}
            />
          </AvatarArea>
          <div className="flex-grow-1">
            <div className={gridRowClasses}>
              <div className="col-md-6">
                <Field
                  name="first_name"
                  label="Firstname *"
                  placeholder="Firstname"
                  component={Input}
                  disabled={isDisabledUpdating}
                />
              </div>
              <div className="col-md-6">
                <Field
                  name="last_name"
                  label="Surname *"
                  placeholder="Surname"
                  component={Input}
                  disabled={isDisabledUpdating}
                />
              </div>
            </div>
            <div className={gridRowClasses}>
              <div className="col-md-6">
                <Field name="email" label="Email" placeholder="Email" component={Input} disabled={isDisabledUpdating} />
              </div>
              <div className="col-md-6">
                <Field
                  name="contact"
                  label="Contact"
                  placeholder="Start typing contact"
                  component={SelectAsync}
                  loadOptions={this.debouncedLoadContact}
                  isClearable={true}
                  getOptionValue={this.optionToValue}
                  getOptionLabel={this.contactGetLabel}
                  disabled={isDisabledUpdating}
                />
              </div>
            </div>
            <LocalDelemetr className={gridDelimetrClasses} />
            <FormTitle className={gridRowClasses}>Roles & Permissions</FormTitle>
            <div className={gridRowClasses}>
              <div className="col-md-6">
                <Field
                  name="user_roles"
                  label="Role *"
                  placeholder="Role"
                  component={Select}
                  isClearable={true}
                  options={roleList}
                  getOptionValue={this.optionToValue}
                  getOptionLabel={this.getOptionLabel('display_name')}
                  disabled={isDisabledUpdating}
                />
              </div>
              <div className="col-md-6">
                <Field
                  name="password"
                  label="Password"
                  placeholder="Password"
                  component={Input}
                  type="password"
                  disabled={isDisabledUpdating}
                />
              </div>
            </div>
            <div className={gridRowClasses}>
              <div className="col-md-4">
                <Field
                  name="invoice_approve_limit"
                  label="Invoices"
                  placeholder="limit"
                  component={Input}
                  currency={true}
                  disabled={isDisabledUpdating}
                />
              </div>
              <div className="col-md-4">
                <Field
                  name="purchase_order_approve_limit"
                  label="Purchase Orders"
                  placeholder="limit"
                  component={Input}
                  currency={true}
                  disabled={isDisabledUpdating}
                />
              </div>
              <div className="col-md-4">
                <Field
                  name="credit_note_approval_limit"
                  label="Credit Notes"
                  placeholder="limit"
                  component={Input}
                  currency={true}
                  disabled={isDisabledUpdating}
                />
              </div>
            </div>
            <FormTitle className={gridRowClasses}>Location access</FormTitle>
            <div className={gridRowClasses}>
              <div className="col-md-6">
                <Field
                  name="primary_location"
                  label="Primary location"
                  placeholder="Location"
                  component={Select}
                  options={locationList}
                  getOptionValue={this.optionToValue}
                  getOptionLabel={this.getOptionLabel('name')}
                  disabled={isDisabledUpdating}
                />
              </div>
            </div>
            <div className={gridRowClasses}>
              <div className="col-md-6">
                <Field
                  component={CheckboxList}
                  name="add_location"
                  onCheck={this.handleChangeLocation}
                  list={locationList.map(this.transformToCheckbox)}
                  label="Additional location"
                  disabled={isDisabledUpdating}
                />
              </div>
            </div>
            <LocalDelemetr className={gridDelimetrClasses} />
            <FormTitle className={gridRowClasses}>Human Resources</FormTitle>
            <div className={gridRowClasses}>
              <div className="col-4">
                <Field
                  name="working_hours_per_week"
                  label="Working hours per week"
                  placeholder="Hours"
                  component={Input}
                  disabled={isDisabledUpdating}
                />
              </div>
            </div>
            <div className={gridRowClasses}>
              <div className="col-4">
                <PrimaryButton className="btn" type="submit" disabled={isDisabledUpdating || !dirty || !valid}>
                  Save
                </PrimaryButton>
              </div>
              <div className="col-4">
                <InvertedPrimaryButton className="btn" type="button" onClick={onDelete} disabled={isDisabledDeleting}>
                  Delete
                </InvertedPrimaryButton>
              </div>
            </div>
          </div>
        </FormInner>
      </Form>
    );
  }
}

export default compose<React.ComponentClass<Partial<ConfigProps> & IUserForm>>(
  reduxForm<Partial<IUser>, IUserForm>({
    form: 'UserForm',
    validate: UserFormValidation,
    enableReinitialize: true
  }),
  formValues({
    primaryLocation: 'primary_location'
  })
)(UserForm);

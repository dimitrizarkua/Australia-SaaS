import * as React from 'react';
import {compose} from 'redux';
import {ConfigProps, Field, FormSection, formValues, InjectedFormProps, reduxForm} from 'redux-form';
import {pick, debounce} from 'lodash';
import debouncePromise from 'debounce-promise';
import Input from 'src/components/Form/Input';
import AddressFields from 'src/components/Form/AddressFields';
import Delimiter from 'src/components/Form/Delimiter';
import FormContainer from 'src/components/Form/FormContainer';
import Legend from 'src/components/Form/Legend';
import {IPerson} from 'src/models/IPerson';
import {IResource} from 'src/components/withData/withData';
import ContactService, {IContactsSuccess} from 'src/services/ContactService';
import {ICompany} from 'src/models/ICompany';
import SelectAsync from 'src/components/Form/SelectAsync';
import {AddressType, ContactType, IContactAddress, IRawContactAddress} from 'src/models/IContact';
import PersonFormValidator, {asyncValidator} from './PersonFormValidator';
import CopyAddressLink from '../CopyAddressLink';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {DIRECT_PHONE_MASK, MOBILE_PHONE_MASK} from 'src/constants/InputMasks';

export interface IProps {
  person: Partial<IPerson>;
  disabled?: boolean;
  onSubmit: (data: any) => {};
  contactCategory: string | number;
}

interface IWithDataProps {
  companies: IResource<IContactsSuccess>;
}

export interface IFormValues {
  address: IContactAddress;
  parentCompany: ICompany;
}

class PersonForm extends React.PureComponent<
  InjectedFormProps<Partial<IPerson>, IProps> & IProps & IWithDataProps & IFormValues
> {
  private loadCompanies = (query: string) => {
    const params = {
      term: query,
      contact_type: ContactType.company
    };
    return ContactService.getContacts(params).then(res =>
      res.data.sort((a: any) => (a.contact_category_id === this.props.contactCategory ? -1 : 1))
    );
  };

  private debouncedLoadCompanies = debouncePromise(this.loadCompanies, 1000);

  private copyAddress = () => {
    const address = pick(this.props.address, [
      'address_line_1',
      'address_line_2',
      'postcode',
      'suburb',
      'state',
      'country'
    ]);
    this.props.change('mailing_address', {
      ...address,
      type: AddressType.mailing,
      id: this.props.person.mailing_address!.id
    });
    this.scheduleUpdate();
  };

  private copyAddressFromCompany = () => {
    const {person, parentCompany, change} = this.props;
    const currentCompany = parentCompany || person.parent_company;
    const companyAddress = currentCompany.addresses.find(
      (addr: IRawContactAddress) => addr.type === AddressType.street
    );
    const companySuburb = companyAddress && companyAddress.suburb;
    change('address', {
      ...companyAddress,
      type: AddressType.street,
      id: person.address!.id,
      state: companySuburb && companySuburb.state,
      postcode: companySuburb && companySuburb.postcode,
      country: companySuburb && companySuburb.state && companySuburb.state.country
    });
    this.scheduleUpdate();
  };

  private handleSubmitForm = () => {
    const {handleSubmit, onSubmit} = this.props;
    if (!this.props.submitting) {
      return handleSubmit(onSubmit)();
    }
    this.scheduleUpdate();
    return Promise.resolve();
  };

  private scheduleUpdate = debounce(this.handleSubmitForm, 1000);

  private get isNewPerson(): boolean {
    const {person} = this.props;
    return person.id === null || person.id === undefined;
  }

  public render() {
    const {disabled, parentCompany} = this.props;
    return (
      <FormContainer isNew={this.isNewPerson}>
        <form onSubmit={this.props.handleSubmit} autoComplete="off">
          <fieldset disabled={disabled}>
            <div className="row">
              <div className="col-5">
                <Field
                  name="first_name"
                  label="Firstname"
                  placeholder="Firstname"
                  component={Input}
                  onChange={this.scheduleUpdate}
                />
              </div>
              <div className="col-5">
                <Field
                  name="last_name"
                  label="Surname"
                  placeholder="Surname"
                  component={Input}
                  onChange={this.scheduleUpdate}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-5">
                <Field
                  name="parent_company"
                  label="Company"
                  placeholder="Start typing to search..."
                  component={SelectAsync}
                  loadOptions={this.debouncedLoadCompanies}
                  getOptionLabel={(option: ICompany) => option.legal_name}
                  onChange={this.scheduleUpdate}
                />
              </div>
              <div className="col-5">
                <Field
                  name="job_title"
                  label="Job Title"
                  placeholder="Job Title"
                  component={Input}
                  onChange={this.scheduleUpdate}
                />
              </div>
            </div>

            <Delimiter />

            <div className="row">
              <div className="col-5">
                <Field
                  name="email"
                  label="Email"
                  placeholder="Email"
                  component={Input}
                  onChange={this.scheduleUpdate}
                />
              </div>
              <div className="col-5">
                <Field
                  name="mobile_phone"
                  label="Mobile"
                  placeholder="Mobile"
                  component={Input}
                  mask={MOBILE_PHONE_MASK}
                  onChange={this.scheduleUpdate}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-5">
                <Field
                  name="direct_phone"
                  label="Direct Phone"
                  placeholder="Direct Phone"
                  component={Input}
                  mask={DIRECT_PHONE_MASK}
                  onChange={this.scheduleUpdate}
                />
              </div>
              <div className="col-5">
                <Field
                  name="business_phone"
                  label="Business Phone"
                  placeholder="Business Phone"
                  component={Input}
                  mask={DIRECT_PHONE_MASK}
                  onChange={this.scheduleUpdate}
                />
              </div>
            </div>

            <Delimiter />

            <FormSection name="address">
              <Legend>
                Street Address <sup>*</sup>
                {!disabled && parentCompany && (
                  <CopyAddressLink onClick={this.copyAddressFromCompany}>Copy from company</CopyAddressLink>
                )}
              </Legend>
              <AddressFields name="address" change={this.props.change} onChange={this.scheduleUpdate} />
            </FormSection>

            <Delimiter />

            <FormSection name="mailing_address">
              <Legend>
                Mailing Address
                {!disabled && <CopyAddressLink onClick={this.copyAddress}>Copy from above</CopyAddressLink>}
              </Legend>
              <AddressFields name="mailing_address" change={this.props.change} onChange={this.scheduleUpdate} />
            </FormSection>
          </fieldset>

          {this.isNewPerson && (
            <>
              <Delimiter />
              <PrimaryButton type="submit" className="btn btn-primary" disabled={this.props.submitting}>
                Save
              </PrimaryButton>
            </>
          )}
        </form>
      </FormContainer>
    );
  }
}

export default compose<React.ComponentClass<Partial<ConfigProps> & IProps>>(
  reduxForm<Partial<IPerson>, IProps>({
    form: 'CustomerForm',
    validate: PersonFormValidator,
    asyncValidate: asyncValidator,
    asyncBlurFields: ['first_name', 'last_name'],
    shouldAsyncValidate: ({initialized}) => !initialized,
    enableReinitialize: false
  }),
  formValues({address: 'address', parentCompany: 'parent_company'})
)(PersonForm);

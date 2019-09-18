import * as React from 'react';
import {ConfigProps, Field, FormSection, formValues, InjectedFormProps, reduxForm} from 'redux-form';
import {pick, debounce} from 'lodash';
import Input from 'src/components/Form/Input';
import {ICompany} from 'src/models/ICompany';
import AddressFields from 'src/components/Form/AddressFields';
import Delimiter from 'src/components/Form/Delimiter';
import FormContainer from 'src/components/Form/FormContainer';
import Legend from 'src/components/Form/Legend';
import CompanyFormValidator, {asyncValidator} from './CompanyFormValidator';
import {compose} from 'redux';
import {AddressType, IContactAddress} from 'src/models/IContact';
import CopyAddressLink from '../CopyAddressLink';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {DIRECT_PHONE_MASK} from 'src/constants/InputMasks';

export interface IProps {
  company: Partial<ICompany>;
  disabled: boolean;
  onSubmit: (data: any) => {};
}

export interface IFormValues {
  address: IContactAddress;
}

class CompanyForm extends React.PureComponent<InjectedFormProps<Partial<ICompany>, IProps> & IProps & IFormValues> {
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
      id: this.props.company.mailing_address!.id
    });
    this.scheduleUpdate();
  };

  private scheduleUpdate = debounce(() => this.handleSubmitForm(), 1000);

  private handleSubmitForm = () => {
    const {handleSubmit, onSubmit} = this.props;
    if (!this.props.submitting) {
      return handleSubmit(onSubmit)();
    }
    this.scheduleUpdate();
    return Promise.resolve();
  };

  private get isNewCompany(): boolean {
    const {company} = this.props;
    return company.id === null || company.id === undefined;
  }

  public render() {
    return (
      <FormContainer isNew={this.isNewCompany}>
        <form onSubmit={this.props.handleSubmit} autoComplete="off">
          <fieldset disabled={this.props.disabled}>
            <div className="row">
              <div className="col-5">
                <Field
                  name="legal_name"
                  label="Legal Company Name"
                  placeholder="Legal Company Name"
                  component={Input}
                  onChange={this.scheduleUpdate}
                />
              </div>
              <div className="col-5">
                <Field
                  name="trading_name"
                  label="Trading Name"
                  placeholder="Trading Name"
                  component={Input}
                  onChange={this.scheduleUpdate}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-5">
                <Field name="abn" label="ABN" placeholder="ABN" component={Input} onChange={this.scheduleUpdate} />
              </div>
              <div className="col-5">
                <Field
                  name="default_payment_terms_days"
                  label="Default Payment Terms"
                  placeholder="Default Payment Terms"
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
                  name="business_phone"
                  label="Business Phone"
                  placeholder="Business Phone"
                  component={Input}
                  mask={DIRECT_PHONE_MASK}
                  onChange={this.scheduleUpdate}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-5">
                <Field
                  name="website"
                  label="Website"
                  placeholder="Website"
                  component={Input}
                  onChange={this.scheduleUpdate}
                />
              </div>
            </div>

            <Delimiter />

            <FormSection name="address">
              <Legend>
                Street Address <sup>*</sup>
              </Legend>
              <AddressFields name="address" change={this.props.change} onChange={this.scheduleUpdate} />
            </FormSection>

            <Delimiter />

            <FormSection name="mailing_address">
              <Legend>
                Mailing Address
                {!this.props.disabled && <CopyAddressLink onClick={this.copyAddress}>Copy from above</CopyAddressLink>}
              </Legend>
              <AddressFields name="mailing_address" change={this.props.change} onChange={this.scheduleUpdate} />
            </FormSection>
          </fieldset>

          {this.isNewCompany && (
            <>
              <Delimiter />
              <PrimaryButton type="submit" className="btn btn-primary" disabled={this.props.submitting}>
                Create
              </PrimaryButton>
            </>
          )}
        </form>
      </FormContainer>
    );
  }
}

export default compose<React.ComponentClass<Partial<ConfigProps> & IProps>>(
  reduxForm<Partial<ICompany>, IProps>({
    form: 'CompanyForm',
    validate: CompanyFormValidator,
    asyncValidate: asyncValidator,
    asyncBlurFields: ['legal_name'],
    shouldAsyncValidate: ({initialized}) => !initialized,
    enableReinitialize: false
  }),
  formValues({address: 'address'})
)(CompanyForm);

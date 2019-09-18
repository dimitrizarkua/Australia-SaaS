import * as React from 'react';
import {debounce} from 'lodash';
import {ConfigProps, Field, InjectedFormProps} from 'redux-form';
import Input from 'src/components/Form/Input';
import FormContainer from 'src/components/Form/FormContainer';
import {IJob} from 'src/models/IJob';
import Select from 'src/components/Form/Select';
import SelectAsync from 'src/components/Form/SelectAsync';
import {INamedEntity} from 'src/models/IEntity';
import DateTime from 'src/components/Form/DateTime';
import {RouteComponentProps} from 'react-router-dom';
import ContactService from 'src/services/ContactService';
import Delimiter from 'src/components/Form/Delimiter';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import JobService from 'src/services/JobService';
import {IContact} from 'src/models/IContact';
import {Moment} from 'moment';
import debouncePromise from 'debounce-promise';
import {ILocation} from 'src/models/IAddress';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';

export interface IOwnProps {
  isNew: boolean;
  isInvoice?: boolean;
  disabled?: boolean;
  onUpdate: (data: any) => Promise<any>;
}

interface IConnectProps {
  locations: ILocation[];
}

interface IParams {
  id: string;
}

type IProps = RouteComponentProps<IParams> &
  Partial<ConfigProps> &
  InjectedFormProps<IFormData, IOwnProps> &
  IOwnProps &
  IConnectProps;

export interface IFormData {
  recipient_contact?: IContact;
  location?: INamedEntity;
  date?: Moment;
  due_at?: Moment;
  job?: INamedEntity;
  reference?: string;
  items?: any[];
}

class FinanceFormUnwrapped extends React.PureComponent<IProps> {
  private submitSavedInvoice = () => {
    if (!this.props.isNew && this.props.dirty) {
      return this.props.handleSubmit(this.props.onUpdate)();
    }
  };

  private debouncedSubmitSavedInvoice = debounce(this.submitSavedInvoice, 200);

  private onJobSelect = async (data: any) => {
    this.props.change('location', data.assigned_location);

    if (this.props.isInvoice && this.props.isNew) {
      this.props.change('location', data.assigned_location);

      const invoiceToContact = data.invoice_to_contact
        ? {
            id: data.invoice_to_contact.contact_id,
            name: data.invoice_to_contact.contact_name
          }
        : {};

      this.props.change('recipient_contact', invoiceToContact);
    }

    this.debouncedSubmitSavedInvoice();
  };

  private loadContacts = (query: string) => {
    const params = {
      term: query
    };
    return ContactService.searchContacts(params).then(res => res.data);
  };

  private getContactName = (contact: any) => {
    return contact.name || ContactService.getContactName(contact);
  };

  private debouncedLoadContacts = debouncePromise(this.loadContacts, 1000);
  private debouncedSearchJobs = debouncePromise(JobService.searchJobs, 1000);

  public render() {
    const {locations, handleSubmit, isNew, isInvoice, disabled} = this.props;

    return (
      <FormContainer isNew={isNew}>
        <form onSubmit={handleSubmit} autoComplete="off">
          <fieldset disabled={disabled}>
            <div className="row">
              <div className="col-6">
                <div className="row">
                  <div className="col-12 position-relative">
                    <Field
                      name="recipient_contact"
                      label="To:"
                      placeholder="Start typing to search..."
                      component={SelectAsync}
                      className="row"
                      labelClassName="col-3 col-form-label"
                      valueClassName="col-9"
                      loadOptions={this.debouncedLoadContacts}
                      getOptionLabel={this.getContactName}
                      getOptionValue={(contact: any) => contact.id}
                      onChange={this.debouncedSubmitSavedInvoice}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <Field
                      name="location"
                      label="From:"
                      placeholder="Select..."
                      component={Select}
                      className="row"
                      labelClassName="col-3 col-form-label"
                      valueClassName="col-6"
                      options={locations}
                      getOptionValue={(option: INamedEntity) => option.id.toString()}
                      getOptionLabel={(option: INamedEntity) => option.name}
                      onChange={this.debouncedSubmitSavedInvoice}
                      disabled={!locations.length || disabled}
                    />
                  </div>
                </div>
              </div>
              <div className="col-5 offset-1">
                <div className="row">
                  <div className="col-12">
                    <Field
                      name="date"
                      label="Date:"
                      placeholder="Date"
                      component={DateTime}
                      className="row"
                      labelClassName="col-3 pr-0 col-form-label"
                      valueClassName="col-6"
                      onBlur={this.debouncedSubmitSavedInvoice}
                      disabled={disabled}
                      futureEnabled={true}
                    />
                  </div>
                </div>
                {isInvoice && (
                  <div className="row">
                    <div className="col-12">
                      <Field
                        name="due_at"
                        label="Due Date:"
                        placeholder="Due Date"
                        component={DateTime}
                        className="row"
                        labelClassName="col-3 pr-0 col-form-label"
                        valueClassName="col-6"
                        onBlur={this.debouncedSubmitSavedInvoice}
                        disabled={disabled}
                        futureEnabled={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col-6">
                <div className="row">
                  <div className="col-12">
                    <Field
                      name="job"
                      label="Job Number (optional):"
                      placeholder="Job Number"
                      component={SelectAsync}
                      className="row"
                      labelClassName="col-3 col-form-label"
                      valueClassName="col-6"
                      loadOptions={this.debouncedSearchJobs}
                      getOptionValue={(option: IJob) => option.id.toString()}
                      getOptionLabel={(option: IJob) => JobService.getJobName(option)}
                      onChange={this.onJobSelect}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <Field
                      name="reference"
                      label="Reference:"
                      placeholder="None"
                      component={Input}
                      className="row"
                      labelClassName="col-3 col-form-label"
                      valueClassName="col-6"
                      onBlur={this.debouncedSubmitSavedInvoice}
                    />
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
          <Delimiter />
          {isNew && (
            <PrimaryButton type="submit" className="btn btn-primary" disabled={this.props.submitting}>
              Create
            </PrimaryButton>
          )}
        </form>
      </FormContainer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({locations: state.user.locations});

export default connect(mapStateToProps)(FinanceFormUnwrapped);

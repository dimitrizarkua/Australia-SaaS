import * as React from 'react';
import debounce from 'debounce-promise';
import {ConfigProps, Field, InjectedFormProps, reduxForm} from 'redux-form';
import Input from 'src/components/Form/Input';
import FormContainer from 'src/components/Form/FormContainer';
import Delimiter from 'src/components/Form/Delimiter';
import {IJob} from 'src/models/IJob';
import Select from 'src/components/Form/Select';
import SelectAsync from 'src/components/Form/SelectAsync';
import ContactService from 'src/services/ContactService';
import {compose} from 'redux';
import withData, {IResource} from 'src/components/withData/withData';
import AddressService, {ILocationsSuccess} from 'src/services/AddressService';
import JobService, {IJobServicesSuccess} from 'src/services/JobService';
import {INamedEntity} from 'src/models/IEntity';
import {ICompany} from 'src/models/ICompany';
import {ContactType} from 'src/models/IContact';
import JobFormValidator from './JobFormValidator';
import {ClaimTypeOptions} from 'src/constants/ClaimType';
import {CriticalityOptions} from 'src/constants/Criticality';
import DateTime from 'src/components/Form/DateTime';
import {RouteComponentProps} from 'react-router-dom';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {ContactCategories} from 'src/models/IContact';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import {ILocation} from 'src/models/IAddress';
import {required} from 'src/services/ValidationService';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';

interface IProps {
  job?: Partial<IJob> | undefined | null;
  onSubmit: (data: any) => Promise<any>;
  userLocations: ILocation[];
}

interface IWithDataProps {
  locations: IResource<ILocationsSuccess>;
  jobServices: IResource<IJobServicesSuccess>;
}

interface IParams {
  id: string;
}

type ICombinedProps = RouteComponentProps<IParams> & InjectedFormProps<IJob, IProps> & IProps & IWithDataProps;

class JobForm extends React.PureComponent<ICombinedProps> {
  private scheduledUpdateTimer: any = null;

  public componentDidMount() {
    this.props.locations.fetch();
    this.props.jobServices.fetch();
  }

  public componentWillUnmount() {
    if (this.scheduledUpdateTimer) {
      clearTimeout(this.scheduledUpdateTimer);
    }
  }

  private loadInsurers = (query: string) => {
    const params = {
      term: query,
      contact_type: ContactType.company,
      contact_category_type: ContactCategories.Insurer
    };
    return ContactService.searchContacts(params).then(res => res.data);
  };

  private debouncedLoadInsurers = debounce(this.loadInsurers, 1000);

  private scheduleUpdate = () => {
    const {job} = this.props;

    if (this.scheduledUpdateTimer) {
      clearTimeout(this.scheduledUpdateTimer);
    }

    if (job) {
      this.scheduledUpdateTimer = setTimeout(this.handleSubmitForm, 1000);
    }
  };

  private handleSubmitForm = () => {
    const {handleSubmit, onSubmit, submitting} = this.props;
    if (!submitting) {
      return handleSubmit(onSubmit)();
    }
    this.scheduleUpdate();
    return Promise.resolve();
  };

  public render() {
    const {locations, jobServices, job, handleSubmit, userLocations} = this.props;
    const isNewJob = !job;

    return (
      <UserContext.Consumer>
        {context => {
          const disabled = (job && job.edit_forbidden) || !context.has(Permission.JOBS_UPDATE);
          return (
            <FormContainer isNew={isNewJob}>
              <form onSubmit={handleSubmit} autoComplete="off">
                <fieldset disabled={disabled}>
                  <div className="row">
                    <div className="col-3">
                      <Field
                        name="date_of_loss"
                        label="Date of Loss"
                        placeholder="Date of Loss"
                        component={DateTime}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                        validate={required}
                      />
                    </div>
                    <div className="col-6">
                      <Field
                        name="cause_of_loss"
                        label="Cause of Loss"
                        placeholder="Cause of Loss"
                        component={Input}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-4">
                      <Field
                        name="service"
                        label="Service Type"
                        placeholder="Select..."
                        component={Select}
                        options={jobServices.data && jobServices.data.data}
                        getOptionValue={(option: INamedEntity) => option.id.toString()}
                        getOptionLabel={(option: INamedEntity) => option.name}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                      />
                    </div>
                    <div className="col-4">
                      <Field
                        name="initial_contact_at"
                        label="Initial Contact"
                        placeholder="Initial Contact"
                        component={DateTime}
                        showTime={true}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                        validate={required}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-8">
                      <Field
                        name="description"
                        label="Job Description"
                        placeholder="Job Description"
                        component={Input}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  <Delimiter />

                  <div className="row">
                    <div className="col-5">
                      <Field
                        name="assigned_location"
                        label="Location"
                        placeholder="Select..."
                        component={Select}
                        options={userLocations}
                        getOptionValue={(option: INamedEntity) => option.id.toString()}
                        getOptionLabel={(option: INamedEntity) => option.name}
                        onChange={this.scheduleUpdate}
                        disabled={disabled || userLocations.length === 0}
                      />
                    </div>
                    <div className="col-5">
                      <Field
                        name="owner_location"
                        label="Area"
                        placeholder="Select..."
                        component={Select}
                        options={locations.data && locations.data.data}
                        getOptionValue={(option: INamedEntity) => option.id.toString()}
                        getOptionLabel={(option: INamedEntity) => option.name}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  <Delimiter />

                  <div className="row">
                    <div className="col-4">
                      <Field
                        name="insurer"
                        label="Insurance / Contract"
                        placeholder="Start typing to search..."
                        component={SelectAsync}
                        loadOptions={this.debouncedLoadInsurers}
                        getOptionValue={(option: ICompany) => option.id.toString()}
                        getOptionLabel={(option: ICompany) => option.legal_name}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                        isClearable={true}
                      />
                    </div>
                    <div className="col-4">
                      <Field
                        name="claim_number"
                        label="Claim No."
                        placeholder="Claim No."
                        component={Input}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                      />
                    </div>
                    <div className="col-4">
                      <Field
                        name="reference_number"
                        label="Reference No."
                        placeholder="Reference No."
                        component={Input}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-4">
                      <Field
                        name="claim_type"
                        label="Claim Type"
                        placeholder="Claim Type"
                        component={Select}
                        options={ClaimTypeOptions}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                      />
                    </div>
                    <div className="col-4">
                      <Field
                        name="criticality"
                        label="Criticality"
                        placeholder="Criticality"
                        component={Select}
                        options={CriticalityOptions}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-4">
                      <Field
                        name="expected_excess_payment"
                        label="Excess payment"
                        placeholder="Excess payment"
                        component={Input}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  <Delimiter />

                  <div className="row">
                    <div className="col-4">
                      <Field
                        name="anticipated_revenue"
                        label="Anticipated Revenue"
                        placeholder="Anticipated Revenue"
                        component={Input}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                      />
                    </div>
                    <div className="col-4">
                      <Field
                        name="anticipated_invoice_date"
                        label="Anticipated Invoice Date"
                        placeholder="Anticipated Invoice Date"
                        component={DateTime}
                        onChange={this.scheduleUpdate}
                        disabled={disabled}
                        futureEnabled={true}
                        validate={required}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-4">
                      <Field
                        name="created_at"
                        label="Job Received"
                        placeholder="Job Received"
                        disabled={!isNewJob}
                        component={DateTime}
                        showTime={true}
                        onChange={this.scheduleUpdate}
                      />
                    </div>
                    <div className="col-4">
                      <Field
                        name="authority_received_at"
                        label="Authority Received"
                        placeholder="Authority Received"
                        component={DateTime}
                        showTime={true}
                        onBlur={this.scheduleUpdate}
                        disabled={disabled}
                        validate={required}
                      />
                    </div>
                  </div>
                </fieldset>
                {isNewJob && (
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
        }}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  userLocations: state.user!.locations
});

export const JobFormName = 'JobForm';

export default connect(mapStateToProps)(
  compose<React.ComponentClass<Partial<ConfigProps> & IProps>>(
    reduxForm<IJob, IProps>({
      form: JobFormName,
      validate: JobFormValidator
    }),
    withData({
      locations: {
        fetch: AddressService.searchLocations
      },
      jobServices: {
        fetch: JobService.getServices
      }
    })
  )(JobForm)
);

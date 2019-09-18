import * as React from 'react';
import {keyBy} from 'lodash';
import {RouteComponentProps, withRouter} from 'react-router';
import JobForm from './JobForm';
import PageContent from 'src/components/Layout/PageContent';
import {IJob, IContactAssignment, IAssignment} from 'src/models/IJob';
import JobContactsForm, {IFormContact, IFormData, uniqueKey} from './JobContactsForm';
import JobService, {IJobSuccess} from 'src/services/JobService';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import {submissionErrorHandler} from 'src/services/ReduxFormHelper';
import {ThunkDispatch} from 'redux-thunk';
import {Action, compose} from 'redux';
import {IReturnType} from 'src/redux/reduxWrap';
import {loadJobContacts} from 'src/redux/currentJob/currentJobContactsDucks';
import {isContactsVisible} from 'src/components/AppLayout/JobsLayout/JobLayout/JobLayout';
import {loadCurrentJob, updateCurrentJob} from 'src/redux/currentJob/currentJobDucks';
import cancelablePromiseHandler from 'src/utility/CancelablePromiseHandler';

const ALL_DEFAULT_CONTACTS = ['Site Contact', 'Customer', 'Broker', 'Loss Adjustor', 'Referrer'];

interface IParams {
  id: string;
}

interface IConnectProps {
  job: IJob | null;
  assignmentTypes: IAssignment[];
  contacts: IReturnType<IContactAssignment[]>;
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = IConnectProps & RouteComponentProps<IParams>;

interface IState {
  updating: boolean;
}

class JobDetailsPage extends React.PureComponent<IProps, IState> {
  public state = {
    updating: false
  };

  public componentWillUnmount() {
    this.asyncPromiseHandler.doCancel();
  }

  private asyncPromiseHandler = cancelablePromiseHandler();

  private get isContactsFormVisible() {
    const {job} = this.props;
    if (!job || job.edit_forbidden) {
      return false;
    }
    return isContactsVisible(this.props.location);
  }

  private submitContacts = (data: IFormData) => {
    const savedContacts = this.props.contacts.data || [];
    const newContacts = data.contacts.filter(c => c.contact && c.assignment_type);

    const savedContactsMap = keyBy(savedContacts, uniqueKey);
    const newContactsMap = keyBy(newContacts, uniqueKey);

    // Treat unique contact/assignment_type pairs as unique entities
    // 1. Remove all old pairs
    // 2. Create all new pairs
    // 3. Set "Invoice to" to unchanged(saved) pair, if its invoice_to changed from "false" to "true"
    const contactsToRemove = savedContacts.filter(c => !newContactsMap[uniqueKey(c)]);
    const contactsToCreate = newContacts.filter(c => !savedContactsMap[uniqueKey(c)]);

    // On backend there is a trigger, that resets invoice_to for other assignments to "false",
    // so that only one assignment is possible to be used to send invoice to.
    let updateInvoiceToPromise: Promise<any> = Promise.resolve();
    const alreadyCreatedInvoiceToAssignment = savedContacts.find(c => {
      const key = uniqueKey(c);
      return newContactsMap[key] && key === data.invoiceToKey && !c.invoice_to;
    });
    if (alreadyCreatedInvoiceToAssignment) {
      updateInvoiceToPromise = this.markAsInvoiceTo(alreadyCreatedInvoiceToAssignment);
    }

    // There is a validation on backend, preventing creation of multiple assignments of the same type,
    // if there is unique constraint for this type. So we need to remove assignments first, and then create new ones.
    return this.asyncPromiseHandler
      .asyncHandler(() =>
        Promise.all(contactsToRemove.map(this.removeAssignment))
          .then(() =>
            Promise.all([
              ...contactsToCreate.map(c => this.createAssignment(c, uniqueKey(c) === data.invoiceToKey)),
              updateInvoiceToPromise
            ])
          )
          .then(this.updateJobSiteAddressIfNeeded(newContacts) as any)
      )
      .then(() => {
        this.closeContacts();
        this.props.dispatch(loadJobContacts(this.props.job!.id));
      });
  };

  private updateJobSiteAddressIfNeeded = (contacts: IFormContact[]) => () => {
    const {job} = this.props;
    const currentAddressId = job!.site_address_id;
    const siteContact = contacts.find(c => c.assignment_type.name === 'Site Contact');
    const newAddressId = siteContact && siteContact.contact.addresses[0] && siteContact.contact.addresses[0].id;
    if (newAddressId !== currentAddressId) {
      return JobService.update(job!.id, {site_address_id: newAddressId || null}).then(res =>
        this.props.dispatch(updateCurrentJob(res))
      );
    }
    return Promise.resolve();
  };

  private closeContacts = () => {
    if (this.props.job) {
      this.props.history.push(`/job/${this.props.job.id}/details`);
    }
  };

  private removeAssignment = (data: IContactAssignment) => {
    const {job} = this.props;
    const {assignment_type, contact} = data;

    return JobService.removeAssignment(job!.id, contact.id!, {assignment_type_id: assignment_type.id});
  };

  private createAssignment = (data: IFormContact, invoiceTo: boolean) => {
    const {job} = this.props;
    return JobService.createAssignment(job!.id, data.contact.id, {
      invoice_to: invoiceTo,
      assignment_type_id: data.assignment_type.id
    });
  };

  private markAsInvoiceTo = (data: IContactAssignment) => {
    const {job} = this.props;
    return JobService.updateAssignment(job!.id, data.contact.id!, {
      invoice_to: true,
      assignment_type_id: data.assignment_type.id
    });
  };

  private onDetailsUpdate = (data: Partial<IJob>) => {
    const {job} = this.props;
    if (!job) {
      return JobService.createJob(data)
        .then((response: IJobSuccess) => {
          this.props.history.push(`/job/${response.data.id}/details`);
        })
        .catch(submissionErrorHandler);
    } else {
      return JobService.deprecatedUpdate(job.id, data)
        .then(() => {
          this.props.dispatch(loadCurrentJob(job.id));
        })
        .catch(submissionErrorHandler);
    }
  };

  private getInitialContactsValues = () => {
    const {contacts, assignmentTypes} = this.props;
    if (contacts.data && contacts.data.length) {
      const data = contacts.data;
      const invoiceToContact = data.find(a => a.invoice_to);
      return {
        contacts: data.map(contact => ({assignment_type: contact.assignment_type, contact})),
        invoiceToKey: invoiceToContact ? uniqueKey(invoiceToContact) : null
      };
    }
    return {
      invoiceToIndex: null,
      contacts: ALL_DEFAULT_CONTACTS.map(name => ({
        assignment_type: assignmentTypes.find((a: IAssignment) => a.name === name)
      })).filter(contact => !!contact.assignment_type)
    };
  };

  public render() {
    const {job, contacts, assignmentTypes} = this.props;
    return (
      <PageContent>
        {this.isContactsFormVisible && contacts.ready && (
          <JobContactsForm
            assignmentTypes={assignmentTypes}
            initialValues={this.getInitialContactsValues() as IFormData}
            onSubmit={this.submitContacts}
          />
        )}
        <JobForm job={job} initialValues={job as any} onSubmit={this.onDetailsUpdate} />
      </PageContent>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  job: state.currentJob.data,
  assignmentTypes: state.constants.jobAssignmentTypes,
  contacts: state.currentJobContacts
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(JobDetailsPage);

export const InternalJobDetailsPage = JobDetailsPage;

import * as React from 'react';
import {shallow} from 'enzyme';
import * as currentJobContactsDucks from 'src/redux/currentJob/currentJobContactsDucks';
import {InternalJobDetailsPage as JobDetailsPage} from '../JobDetailsPage';
import JobContactsForm from 'src/components/AppLayout/JobsLayout/JobLayout/JobContactsForm';
import JobService from 'src/services/JobService';

jest.mock('src/services/JobService', () => ({
  createAssignment: jest.fn(() => Promise.resolve()),
  updateAssignment: jest.fn(() => Promise.resolve()),
  removeAssignment: jest.fn(() => Promise.resolve())
}));

describe('JobDetailsPage', () => {
  let props: any;

  beforeEach(() => {
    props = {
      job: {id: 1},
      onUpdate: jest.fn(),
      assignmentTypes: [],
      contacts: {loading: false, data: [], ready: true},
      history: {push: jest.fn()},
      dispatch: jest.fn(),
      location: {search: 'contacts=true'}
    };
    jest.resetAllMocks();
  });

  it('should close contacts form', done => {
    const component = shallow(<JobDetailsPage {...props} />);
    const data = {
      contacts: [],
      invoiceToKey: `1-1`
    };

    const submit = component.find(JobContactsForm).props().onSubmit as any;
    jest.spyOn(currentJobContactsDucks, 'loadJobContacts').mockImplementation(id => id);
    submit(data).then(() => {
      expect(props.history.push).toHaveBeenCalledWith('/job/1/details');
      expect(props.dispatch).toHaveBeenCalledWith(currentJobContactsDucks.loadJobContacts(props.job.id));
      done();
    });
  });

  it('should not send requests if data has not changed', done => {
    const component = shallow(<JobDetailsPage {...props} />);
    const data = {
      contacts: [],
      invoiceToKey: `1-1`
    };

    const submit = component.find(JobContactsForm).props().onSubmit as any;
    submit(data).then(() => {
      expect(JobService.createAssignment).not.toHaveBeenCalled();
      expect(JobService.updateAssignment).not.toHaveBeenCalled();
      expect(JobService.removeAssignment).not.toHaveBeenCalled();
      done();
    });
  });

  it('should create new assignments', done => {
    const component = shallow(<JobDetailsPage {...props} />);
    const assignment1 = {assignment_type: {id: 1, name: 'test'}, contact: {id: 1}};
    const assignment2 = {assignment_type: {id: 2, name: 'test'}, contact: {id: 1}};
    const data = {
      contacts: [assignment1, assignment2],
      invoiceToKey: `1-1`
    };

    const submit = component.find(JobContactsForm).props().onSubmit as any;
    submit(data).then(() => {
      expect(JobService.createAssignment).toHaveBeenCalledWith(props.job.id, assignment1.contact.id, {
        assignment_type_id: assignment1.assignment_type.id,
        invoice_to: true
      });
      expect(JobService.createAssignment).toHaveBeenCalledWith(props.job.id, assignment2.contact.id, {
        assignment_type_id: assignment2.assignment_type.id,
        invoice_to: false
      });
      expect(JobService.updateAssignment).not.toHaveBeenCalled();
      expect(JobService.removeAssignment).not.toHaveBeenCalled();
      done();
    });
  });

  it('should remove assignments', done => {
    const component = shallow(<JobDetailsPage {...props} />);
    const assignment1 = {assignment_type: {id: 1, name: 'test'}, contact: {id: 1}, invoice_to: true};
    const assignment2 = {assignment_type: {id: 2, name: 'test'}, contact: {id: 1}, invoice_to: false};
    props.contacts.data = [assignment1, assignment2];
    const data = {
      contacts: [],
      invoiceToKey: `1-1`
    };

    const submit = component.find(JobContactsForm).props().onSubmit as any;
    submit(data).then(() => {
      expect(JobService.createAssignment).not.toHaveBeenCalled();
      expect(JobService.removeAssignment).toHaveBeenCalledWith(props.job.id, assignment1.contact.id, {
        assignment_type_id: assignment1.assignment_type.id
      });
      expect(JobService.removeAssignment).toHaveBeenCalledWith(props.job.id, assignment2.contact.id, {
        assignment_type_id: assignment2.assignment_type.id
      });
      expect(JobService.updateAssignment).not.toHaveBeenCalled();
      done();
    });
  });

  it('should change invoiceTo if invoiceTo switched to true for existing assignment', done => {
    const component = shallow(<JobDetailsPage {...props} />);
    const assignment1 = {assignment_type: {id: 1, name: 'test'}, contact: {id: 1}, invoice_to: true};
    const assignment2 = {assignment_type: {id: 2, name: 'test'}, contact: {id: 1}, invoice_to: false};
    props.contacts.data = [assignment1, assignment2];
    const data = {
      contacts: [assignment1, assignment2],
      invoiceToKey: `1-2`
    };

    const submit = component.find(JobContactsForm).props().onSubmit as any;
    submit(data).then(() => {
      expect(JobService.createAssignment).not.toHaveBeenCalled();
      expect(JobService.updateAssignment).toHaveBeenCalledWith(props.job.id, assignment2.contact.id, {
        assignment_type_id: assignment2.assignment_type.id,
        invoice_to: true
      });
      expect(JobService.removeAssignment).not.toHaveBeenCalled();
      done();
    });
  });

  it('should create, update, remove assignments (complex use case)', done => {
    const component = shallow(<JobDetailsPage {...props} />);
    const assignment1 = {assignment_type: {id: 1, name: 'test'}, contact: {id: 1}, invoice_to: true}; // not changed
    const assignment2 = {assignment_type: {id: 2, name: 'test'}, contact: {id: 1}, invoice_to: false}; // set as "Invoice to"
    const assignment3 = {assignment_type: {id: 2, name: 'test'}, contact: {id: 2}, invoice_to: false}; // removed
    const assignment4 = {assignment_type: {id: 3, name: 'test'}, contact: {id: 3}, invoice_to: false}; // added
    props.contacts.data = [assignment1, assignment2, assignment3];
    const data = {
      contacts: [assignment1, assignment2, assignment4],
      invoiceToKey: `1-2`
    };

    const submit = component.find(JobContactsForm).props().onSubmit as any;
    submit(data).then(() => {
      expect(JobService.createAssignment).toHaveBeenCalledWith(props.job.id, assignment4.contact.id, {
        assignment_type_id: assignment4.assignment_type.id,
        invoice_to: false
      });
      expect(JobService.updateAssignment).toHaveBeenCalledWith(props.job.id, assignment2.contact.id, {
        assignment_type_id: assignment2.assignment_type.id,
        invoice_to: true
      });
      expect(JobService.removeAssignment).toHaveBeenCalledWith(props.job.id, assignment3.contact.id, {
        assignment_type_id: assignment3.assignment_type.id
      });
      expect(JobService.createAssignment).toHaveBeenCalledTimes(1);
      expect(JobService.updateAssignment).toHaveBeenCalledTimes(1);
      expect(JobService.removeAssignment).toHaveBeenCalledTimes(1);
      done();
    });
  });
});

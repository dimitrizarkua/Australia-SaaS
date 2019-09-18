import * as React from 'react';
import {shallow} from 'enzyme';
import {InternalReferenceBarJobDetails as ReferenceBarJobDetails} from '../ReferenceBarJobDetails';
import {IUserContext} from 'src/components/AppLayout/UserContext';
import {ClaimTypeOptions} from 'src/constants/ClaimType';
import Permission from 'src/constants/Permission';
import LinkedJobItem from '../LinkedJobItem';

describe('ReferenceBarJobDetails', () => {
  let props: any;
  let context: IUserContext;

  beforeEach(() => {
    props = {
      job: {
        id: 1,
        claim_type: ClaimTypeOptions[0],
        assigned_to: [],
        linked_jobs: []
      },
      contacts: []
    };
    context = {
      has: () => true
    };
  });

  const renderComponent = () => {
    return (shallow(<ReferenceBarJobDetails {...props} />) as any).renderProp('children')(context);
  };

  it('should render all controls if has permission', () => {
    const component = renderComponent();
    expect(component.find({children: 'Link to other job'}).length).toEqual(1);
    expect(component.find({children: 'Duplicate this job'}).length).toEqual(1);
    expect(component.find({children: 'Merge with job'}).length).toEqual(1);
  });

  it('should not render link and merge controls if has no permission', () => {
    context.has = permission => permission !== Permission.JOBS_MANAGE_JOBS;
    const component = renderComponent();
    expect(component.find({children: 'Link to other job'}).length).toEqual(0);
    expect(component.find({children: 'Merge with job'}).length).toEqual(0);
  });

  it('should not render link and merge controls if has no permission', () => {
    context.has = permission => permission !== Permission.JOBS_CREATE;
    const component = renderComponent();
    expect(component.find({children: 'Duplicate this job'}).length).toEqual(0);
  });

  it('should not disable linked jobs removal if has no permission', () => {
    props.job.linked_jobs = [{id: 1}];
    context.has = permission => permission !== Permission.JOBS_MANAGE_JOBS;
    const component = renderComponent();
    expect(component.find(LinkedJobItem).props().disabled).toEqual(true);
  });
});

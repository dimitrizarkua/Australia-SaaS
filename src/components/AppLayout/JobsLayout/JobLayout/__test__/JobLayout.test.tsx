import * as React from 'react';
import {shallow} from 'enzyme';
import {InternalJobLayout as JobLayout} from '../JobLayout';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import JobHeader from '../JobHeader';
import Permission from 'src/constants/Permission';

describe('JobLayout', () => {
  let props: any;
  let context: IUserContext;

  beforeEach(() => {
    props = {
      job: {
        data: {
          id: 1,
          previous_jobs: [],
          linked_jobs: [],
          job_users: [],
          job_teams: [],
          tags: []
        }
      },
      notesAndReplies: {},
      currentJobPhotos: {selectedPhotos: []},
      dispatch: jest.fn(),
      contacts: {loading: true, data: [], ready: false},
      location: {pathname: '/job/1/notes-and-replies'},
      match: {params: {id: '1'}}
    };
    context = {has: () => true};
  });

  const renderComponent = () => {
    const component = shallow(<JobLayout {...props} />);
    return (component.find(UserContext.Consumer) as any).renderProp('children')(context);
  };

  it('should allow to manage tags if has permission', () => {
    const component = renderComponent();
    expect(component.find(JobHeader).props().disabled).toEqual(false);
  });

  it('should NOT allow to manage tags if has NO permission', () => {
    context.has = (permission: Permission) => permission !== Permission.JOBS_MANAGE_TAGS;
    const component = renderComponent();
    expect(component.find(JobHeader).props().disabled).toEqual(true);
  });
});

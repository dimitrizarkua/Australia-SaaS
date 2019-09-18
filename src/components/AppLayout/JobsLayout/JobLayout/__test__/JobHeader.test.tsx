import * as React from 'react';
import {shallow} from 'enzyme';
import {InternalJobHeader as JobHeader, TagsBox} from '../JobHeader';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';

describe('JobHeader', () => {
  let props: any;
  let context: IUserContext;

  beforeEach(() => {
    props = {
      job: {id: 1, latest_status: {status: 'New'}},
      tags: {data: {data: [{id: 2}]}, loading: false, ready: true},
      dispatch: jest.fn()
    };
    context = {has: () => true};
  });

  const renderComponent = () => {
    const component = shallow(<JobHeader {...props} />);
    return (component.find(UserContext.Consumer) as any).renderProp('children')(context);
  };

  it('should render tags if has permission', () => {
    const component = renderComponent();
    expect(component.find(TagsBox).length).toEqual(1);
  });

  it('should NOT render tags if has NO permission', () => {
    context.has = (permission: Permission) => permission !== Permission.TAGS_VIEW;
    const component = renderComponent();
    expect(component.find(TagsBox).length).toEqual(0);
  });
});

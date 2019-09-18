import * as React from 'react';
import {shallow} from 'enzyme';
import {InternalJobMenu as JobMenu} from '../JobMenu';
import {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import StatusControl from 'src/components/Layout/MenuItems/StatusControl';
import UsersControl from 'src/components/Layout/MenuItems/UsersControl';
import TagsControl from 'src/components/Layout/MenuItems/TagsControl';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';

describe('JobMenu', () => {
  let props: any;
  let context: IUserContext;

  beforeEach(() => {
    props = {
      dispatch: jest.fn(),
      onNoteAdd: jest.fn(),
      onEmailReply: jest.fn(),
      onCustomerAdd: jest.fn(),
      onUpdate: jest.fn(),
      job: {id: 1},
      nextStatuses: {data: {data: []}, fetch: jest.fn()},
      user: {},
      location: {search: ''},
      currentJobContacts: {data: []}
    };
    context = {has: () => true};
  });

  const renderComponent = () => {
    return (shallow(<JobMenu {...props} />) as any).renderProp('children')(context);
  };

  it('should render controls if has permission', () => {
    const component = renderComponent();
    const otherActions = component.find(DropdownMenuControl);
    expect(component.find({'data-tip': 'Reply'}).length).toEqual(1);
    expect(component.find({'data-tip': 'Add note'}).length).toEqual(1);
    expect(component.find(StatusControl).length).toEqual(1);
    expect(component.find(UsersControl).length).toEqual(1);
    expect(component.find(TagsControl).length).toEqual(1);
    expect(otherActions.length).toEqual(1);
  });

  it('should not render Reply if has no permission', () => {
    context.has = (permission: Permission) => permission !== Permission.JOBS_MANAGE_MESSAGES;

    const component = renderComponent();
    expect(component.find({'data-tip': 'Reply'}).length).toEqual(0);
  });

  it('should not render Add note if has no permission', () => {
    context.has = (permission: Permission) => permission !== Permission.JOBS_MANAGE_NOTES;

    const component = renderComponent();
    expect(component.find({'data-tip': 'Add note'}).length).toEqual(0);
  });

  it('should not render StatusControl if has no permission', () => {
    context.has = (permission: Permission) => permission !== Permission.JOBS_UPDATE;

    const component = renderComponent();
    expect(component.find(StatusControl).length).toEqual(0);
  });

  it('should not render UsersControl if has no permission', () => {
    context.has = (permission: Permission) => permission !== Permission.USERS_VIEW;

    const component = renderComponent();
    expect(component.find(UsersControl).length).toEqual(0);
  });

  it('should disable UsersControl if has no permission', () => {
    context.has = (permission: Permission) => permission !== Permission.JOBS_ASSIGN_STAFF;

    const component = renderComponent();
    expect(component.find(UsersControl).props().disabled).toEqual(true);
  });

  it('should not render TagsControl if has no tags permission', () => {
    context.has = (permission: Permission) => permission !== Permission.TAGS_VIEW;

    const component = renderComponent();
    expect(component.find(TagsControl).length).toEqual(0);
  });

  it('should not render TagsControl if has no permission', () => {
    context.has = (permission: Permission) => permission !== Permission.JOBS_MANAGE_TAGS;

    const component = renderComponent();
    expect(component.find(TagsControl).length).toEqual(0);
  });

  it('should disable all action if no all permissions', () => {
    context.has = () => false;

    const component = renderComponent();
    expect(
      component
        .find(DropdownMenuControl)
        .props()
        .items.filter((el: any) => !el.disabled && el.type !== 'divider').length
    ).toEqual(0);
  });

  it('should disable Assign contact if has no permission', () => {
    context.has = (permission: Permission) => permission !== Permission.JOBS_MANAGE_CONTACTS;
    const component = renderComponent();
    const otherActions = component.find(DropdownMenuControl);
    expect(otherActions.props().items.find((i: IMenuItem) => i.name === 'Assign contacts').disabled).toEqual(true);
  });

  it('should disable Follow job if has no permission', () => {
    context.has = (permission: Permission) => permission !== Permission.JOBS_VIEW;
    const component = renderComponent();
    const otherActions = component.find(DropdownMenuControl);
    expect(otherActions.props().items.find((i: IMenuItem) => i.name === 'Follow job').disabled).toEqual(true);
  });

  it('should disable Create recurring job if has no permission', () => {
    context.has = (permission: Permission) => permission !== Permission.JOBS_MANAGE_RECURRING;
    const component = renderComponent();
    const otherActions = component.find(DropdownMenuControl);
    expect(otherActions.props().items.find((i: IMenuItem) => i.name === 'Create recurring job').disabled).toEqual(true);
  });

  it('should disable Delete if has no permission', () => {
    context.has = (permission: Permission) => permission !== Permission.JOBS_DELETE;
    const component = renderComponent();
    const otherActions = component.find(DropdownMenuControl);
    expect(otherActions.props().items.find((i: IMenuItem) => i.name === 'Delete').disabled).toEqual(true);
  });
});

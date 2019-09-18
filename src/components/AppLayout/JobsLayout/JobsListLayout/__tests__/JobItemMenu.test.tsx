import * as React from 'react';
import {shallow} from 'enzyme';
import {ClockIcon, InternalJobItemMenu as JobItemMenu, PinIcon} from '../JobItemMenu';
import DropdownMenuControl from 'src/components/Layout/MenuItems/DropdownMenuControl';
import Permission from 'src/constants/Permission';
import {JobStatuses} from 'src/models/IJob';

describe('JobItemMenu', () => {
  let props: any;
  let context: any;

  beforeEach(() => {
    props = {
      job: {
        id: 12,
        latest_status: {
          status: JobStatuses.New
        }
      },
      type: 'mine',
      dispatch: jest.fn(),
      fetchJobs: () => Promise.resolve(),
      onAction: jest.fn(),
      stopAction: jest.fn()
    };
    context = {has: () => true};
  });

  const renderComponent = () => (shallow(<JobItemMenu {...props} />) as any).renderProp('children')(context);

  it('should not render items if not hovered', () => {
    const component = renderComponent();
    expect(component.find(PinIcon).length).toEqual(0);
    expect(component.find(ClockIcon).length).toEqual(0);
    expect(component.find(DropdownMenuControl).length).toEqual(0);
  });

  it('should NOT show Pin and Snooze items if job status is Cancelled', () => {
    props.show = true;
    props.job.latest_status.status = JobStatuses.Cancelled;
    const component = renderComponent();
    expect(component.find(PinIcon).length).toEqual(0);
    expect(component.find(ClockIcon).length).toEqual(0);
    expect(component.find(DropdownMenuControl).length).toEqual(1);
  });

  it('should NOT show Pin and Snooze items if job status is Closed', () => {
    props.show = true;
    props.job.latest_status.status = JobStatuses.Closed;
    const component = renderComponent();
    expect(component.find(PinIcon).length).toEqual(0);
    expect(component.find(ClockIcon).length).toEqual(0);
    expect(component.find(DropdownMenuControl).length).toEqual(1);
  });

  it('should show all items if hovered', () => {
    props.show = true;
    const component = renderComponent();
    expect(component.find(PinIcon).length).toEqual(1);
    expect(component.find(DropdownMenuControl).length).toEqual(2);
  });

  it('should show pin icon if item is pinned', () => {
    props.pinned_at = true;
    const component = renderComponent();
    expect(component.find(PinIcon).length).toEqual(1);
  });

  it('should show clock icon if item is snoozed', () => {
    props.snoozed_until = true;
    const component = renderComponent();
    expect(component.find(ClockIcon).length).toEqual(1);
  });

  it('should NOT show clock icon if item is snoozed and inbox is opened', () => {
    props.type = 'inbox';
    props.snoozed_until = true;
    const component = renderComponent();
    expect(component.find(ClockIcon).length).toEqual(0);
  });

  it('should NOT show snooze menu if hovered and inbox is opened', () => {
    props.type = 'inbox';
    props.show = true;
    const component = renderComponent();
    expect(component.find(DropdownMenuControl).length).toEqual(1);
  });

  it('should NOT show pin and snooze if user has no permission to do it', () => {
    props.show = true;
    context.has = (permission: Permission) => permission !== Permission.JOBS_MANAGE_INBOX;
    const component = renderComponent();
    expect(component.find(PinIcon).length).toEqual(0);
    const otherActions = component.find(DropdownMenuControl).props().items;
    expect(otherActions[0].name).toEqual('Mark as unread');
    expect(otherActions[2].name).toEqual('Delete');
  });

  it('should NOT show mark as unread if user has no permission to do it', () => {
    props.show = true;
    context.has = (permission: Permission) => permission !== Permission.JOBS_MANAGE_MESSAGES;
    const component = renderComponent();
    const otherActions = component
      .find(DropdownMenuControl)
      .at(1)
      .props().items;
    expect(otherActions.length).toEqual(1);
    expect(otherActions[0].name).toEqual('Delete');
  });

  it('should NOT show Delete action if user has no permission to do it', () => {
    props.show = true;
    context.has = (permission: Permission) => permission !== Permission.JOBS_DELETE;
    const component = renderComponent();
    expect(component.find(PinIcon).length).toEqual(1);
    const otherActions = component
      .find(DropdownMenuControl)
      .at(1)
      .props().items;
    expect(otherActions.length).toEqual(1);
    expect(otherActions[0].name).toEqual('Mark as unread');
  });

  it('should NOT show other actions dropdown if there are no options due to permissions', () => {
    props.show = true;
    context.has = () => false;
    const component = renderComponent();
    expect(component.find(DropdownMenuControl).length).toEqual(0);
  });
});

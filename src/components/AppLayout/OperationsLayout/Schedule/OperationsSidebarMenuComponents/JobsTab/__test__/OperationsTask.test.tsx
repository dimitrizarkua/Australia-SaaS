import * as React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {render} from 'enzyme';
import {InternalComponent as OperationsTask} from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/JobsTab/OperationsTask';
import {ITask, ITaskType} from 'src/models/ITask';
import {ILocation} from 'src/models/IAddress';
import moment from 'moment';
import {IStatus} from 'src/models/IStatus';
import {IJob} from 'src/models/IJob';

describe('OperationTask', () => {
  const momentFormat = 'YYYY MM DD HH:mm';
  const fakeTask: ITask = {
    id: 7,
    job_id: 77,
    job_run_id: 777,
    job_task_type_id: 7777,
    starts_at: moment('2019 03 12 13:00', momentFormat).format(),
    ends_at: moment('2019 03 12 19:00', momentFormat).format(),
    due_at: moment('2019 03 12 15:00', momentFormat).format(),
    created_at: moment('2019 02 14 15:00', momentFormat).format(),
    assigned_users: [],
    assigned_teams: [],
    type: {
      kpi_hours: 48
    } as ITaskType,
    name: 'Test task 7',
    internal_note: 'internal_note',
    scheduling_note: 'scheduling_note',
    kpi_missed_reason: 'no_reason',
    latest_status: {} as IStatus<any>,
    latest_scheduled_status: {} as IStatus<any>,
    job: {} as IJob,
    snoozed_until: moment('2019 05 14 15:00', momentFormat).format()
  };
  const fakeLocation: ILocation = {
    id: 32,
    name: 'Location',
    code: 'LCT',
    primary: true,
    tz_offset: -2
  };
  const props = {
    task: fakeTask,
    index: 1,
    locationArea: fakeLocation,
    currentTime: moment('2019 03 11 10:28', momentFormat),
    dispatch: jest.fn()
  };

  it('should not render left time when KPI is not close to due', () => {
    props.currentTime = moment('2019 03 10 10:00', momentFormat);
    const component = render(
      <BrowserRouter>
        <OperationsTask {...props} />
      </BrowserRouter>
    );
    expect(component.find('.close-to-kpi').length).toEqual(0);
  });

  it('should render correct left time when KPI is close to due', () => {
    props.currentTime = moment('2019 03 11 10:28', momentFormat);
    const component = render(
      <BrowserRouter>
        <OperationsTask {...props} />
      </BrowserRouter>
    );
    expect(component.find('.close-to-kpi').length).toEqual(1);
    expect(component.find('.close-to-kpi').text()).toEqual('28:32hrs');
  });

  it('should render 00:00 time when KPI is over', () => {
    props.currentTime = moment('2019 05 11 10:28', momentFormat);
    const component = render(
      <BrowserRouter>
        <OperationsTask {...props} />
      </BrowserRouter>
    );
    expect(component.find('.close-to-kpi').length).toEqual(1);
    expect(component.find('.close-to-kpi').text()).toEqual('00:00hrs');
  });
});

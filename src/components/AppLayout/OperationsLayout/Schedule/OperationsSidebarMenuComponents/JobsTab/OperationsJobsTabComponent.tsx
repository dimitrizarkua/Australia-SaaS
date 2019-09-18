import * as React from 'react';
import SearchInput from 'src/components/SearchInput/SearchInput';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import withData, {IResource} from 'src/components/withData/withData';
import TaskService, {ISearchTasksConfig} from 'src/services/TaskService';
import {debounce, orderBy} from 'lodash';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import {IListEnvelope} from 'src/models/IEnvelope';
import {ITask} from 'src/models/ITask';
import {ILocation} from 'src/models/IAddress';
import moment, {Moment} from 'moment';
import DragTask from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/JobsTab/OperationsDragTask';
import {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import St from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsSidebarMenuStyleConfig';
import OperationsSidebarMenuSubTitle from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsSidebarMenuSubTitle';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';
import OperationsScheduleSubFilter from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsScheduleSubFilter';
import ColorPalette from 'src/constants/ColorPalette';
import Cover from 'src/components/Layout/Common/Cover';
import {BACKEND_DATE} from 'src/constants/Date';

const {ColoredDiv} = StyledComponents;

interface IWithDataProps {
  searchTasks: IResource<IListEnvelope<ITask>>;
  tasksFromLocation: IResource<IListEnvelope<ITask>>;
}

interface IProps {
  locationArea: ILocation | null;
  date: Moment | null;
  scheduledTasks: ITask[];
}

interface IState {
  search: string;
  sortType: SortTypes;
}

enum SortTypes {
  KPI,
  OldToNew,
  NewToOld
}

const SortTypeNames: {[key: number]: string} = {
  [SortTypes.KPI]: 'Closest KPI due',
  [SortTypes.OldToNew]: 'All tasks (oldest to newest)',
  [SortTypes.NewToOld]: 'All tasks (newest to oldest)'
};

class OperationsJobsTabComponent extends React.PureComponent<IProps & IWithDataProps, IState> {
  public state = {
    search: '',
    sortType: SortTypes.KPI
  };

  public componentDidMount() {
    this.loadTasksFromLocations();
    EventBus.listen(EventBusEventName.TaskWasAddedToRun, this.loadTasksFromLocations);
    EventBus.listen(EventBusEventName.TaskWasRemovedFromRun, this.loadTasksFromLocations);
    EventBus.listen(EventBusEventName.TaskWasSnoozed, this.loadTasksFromLocations);
    EventBus.listen(EventBusEventName.TaskWasUnsnoozed, this.loadTasksFromLocations);
  }

  public componentWillUnmount() {
    EventBus.removeListener(EventBusEventName.TaskWasAddedToRun, this.loadTasksFromLocations);
    EventBus.removeListener(EventBusEventName.TaskWasRemovedFromRun, this.loadTasksFromLocations);
    EventBus.removeListener(EventBusEventName.TaskWasSnoozed, this.loadTasksFromLocations);
    EventBus.removeListener(EventBusEventName.TaskWasUnsnoozed, this.loadTasksFromLocations);
  }

  public componentDidUpdate(prevProps: IProps) {
    const {locationArea} = this.props;

    if (locationArea && locationArea.id !== (prevProps.locationArea && prevProps.locationArea.id)) {
      this.onSearchValueChange(this.state.search);
      this.loadTasksFromLocations();
    }
  }

  private loadTasksFromLocations = () => {
    const {locationArea, tasksFromLocation} = this.props;

    if (locationArea) {
      tasksFromLocation.fetch(locationArea.id);
    }
  };

  private onSearchValueChange = (search: string) => {
    const {locationArea} = this.props;

    this.setState({search});

    if (locationArea && search) {
      this.debouncedSearch({
        location_id: locationArea.id,
        term: search
      } as ISearchTasksConfig);
    }
  };

  private debouncedSearch = debounce(this.props.searchTasks.fetch, 500);

  private isKPIIsCloseToBeFired = (task: ITask): boolean => {
    const currentTime = moment();
    const dueTime = moment(task.due_at);
    const hoursLeft = dueTime.diff(currentTime, 'h');
    const kpi = task.type.kpi_hours || 24;
    return hoursLeft < kpi;
  };

  private sortTasks = (tasks: ITask[]) => {
    const {scheduledTasks} = this.props;
    const {sortType} = this.state;
    let scheduled: ITask[] = scheduledTasks;
    let toSchedule: ITask[] = [];
    const snoozed: ITask[] = [];

    tasks.forEach((task: ITask) => {
      if (task.type.can_be_scheduled) {
        if (task.snoozed_until) {
          snoozed.push(task);
        } else if (!task.starts_at && !task.ends_at) {
          toSchedule.push(task);
        }
      }
    });

    if (sortType === SortTypes.OldToNew) {
      toSchedule = orderBy(toSchedule, [(task: ITask) => moment(task.created_at).unix()], ['asc']);
      scheduled = orderBy(scheduled, [(task: ITask) => moment(task.created_at).unix()], ['asc']);
    }

    if (sortType === SortTypes.NewToOld) {
      toSchedule = orderBy(toSchedule, [(task: ITask) => moment(task.created_at).unix()], ['desc']);
      scheduled = orderBy(scheduled, [(task: ITask) => moment(task.created_at).unix()], ['desc']);
    }

    if (sortType === SortTypes.KPI) {
      toSchedule = orderBy(toSchedule, [(task: ITask) => this.isKPIIsCloseToBeFired(task)], ['desc']);
      scheduled = orderBy(scheduled, [(task: ITask) => this.isKPIIsCloseToBeFired(task)], ['desc']);
    }

    return {
      scheduled,
      toSchedule,
      snoozed
    };
  };

  private sortItems = (): IMenuItem[] => {
    const {sortType} = this.state;

    return [
      {
        name: SortTypeNames[SortTypes.KPI],
        classNames: sortType === SortTypes.KPI ? 'active' : '',
        onClick: () => this.setState({sortType: SortTypes.KPI})
      },
      {
        name: SortTypeNames[SortTypes.OldToNew],
        classNames: sortType === SortTypes.OldToNew ? 'active' : '',
        onClick: () => this.setState({sortType: SortTypes.OldToNew})
      },
      {
        name: SortTypeNames[SortTypes.NewToOld],
        classNames: sortType === SortTypes.NewToOld ? 'active' : '',
        onClick: () => this.setState({sortType: SortTypes.NewToOld})
      }
    ];
  };

  public render() {
    const {
      searchTasks: {loading, data},
      tasksFromLocation: {loading: ld, data: dt},
      locationArea,
      date
    } = this.props;
    const {sortType, search} = this.state;
    const tasks = data ? data.data : [];
    const locTasks = dt ? dt.data : [];
    const sortedTasks = this.sortTasks(search ? tasks : locTasks);

    return (
      <>
        <ColoredDiv
          padding={`${St.paddingTop} ${St.paddingRight} ${St.menuPaddingBottom} ${St.paddingLeft}`}
          className="flex-shrink-0"
          overflow="visible"
        >
          <SearchInput
            loading={loading || ld}
            onSearchValueChange={this.onSearchValueChange}
            placeholder={'Search...'}
            disabled={!location}
          />
          <div className="d-flex justify-content-end">
            <OperationsScheduleSubFilter items={this.sortItems()} selectedName={SortTypeNames[sortType]} />
          </div>
        </ColoredDiv>

        <ScrollableContainer className="d-flex flex-column flex-grow-1 position-relative">
          {loading && <Cover color={ColorPalette.gray1} zIndex={2} />}
          <ColoredDiv padding={`0 ${St.paddingRight} ${St.paddingBottom} ${St.paddingLeft}`} overflow="visible">
            {sortedTasks.scheduled.length > 0 && (
              <OperationsSidebarMenuSubTitle>Scheduled</OperationsSidebarMenuSubTitle>
            )}
            {sortedTasks.scheduled.map((el: ITask) => (
              <DragTask
                key={el.id}
                task={el}
                locationArea={locationArea}
                date={date ? moment(date.format(BACKEND_DATE)) : moment()}
              />
            ))}
            {sortedTasks.toSchedule.length > 0 && (
              <OperationsSidebarMenuSubTitle>To Schedule</OperationsSidebarMenuSubTitle>
            )}
            {sortedTasks.toSchedule.map((el: ITask) => (
              <DragTask key={el.id} task={el} locationArea={locationArea} />
            ))}
            {sortedTasks.snoozed.length > 0 && <OperationsSidebarMenuSubTitle>Snoozed</OperationsSidebarMenuSubTitle>}
            {sortedTasks.snoozed.map((el: ITask) => (
              <DragTask key={el.id} task={el} locationArea={locationArea} />
            ))}
          </ColoredDiv>
        </ScrollableContainer>
      </>
    );
  }
}

export default withData<IProps>({
  searchTasks: {
    fetch: TaskService.searchTasks
  },
  tasksFromLocation: {
    fetch: TaskService.getTasksFromLocation
  }
})(OperationsJobsTabComponent);

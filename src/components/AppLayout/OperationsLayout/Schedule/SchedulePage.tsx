import * as React from 'react';
import UserContext from 'src/components/AppLayout/UserContext';
import OperationsSidebarMenu from 'src/components/SidebarMenu/OperationsSidebarMenu';
import HeaderPanel, {headerHeight} from 'src/components/AppLayout/OperationsLayout/Schedule/HeaderPanel';
import {Action, compose} from 'redux';
import {withRouter} from 'react-router';
import {RouteComponentProps} from 'react-router-dom';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux/index';
import {ILocation} from 'src/models/IAddress';
import {Moment} from 'moment';
import {ThunkDispatch} from 'redux-thunk';
import {resetRuns, searchRuns} from 'src/redux/operationsDucks';
import {BACKEND_DATE_TIME, FRONTEND_DATE, FRONTEND_TIME} from 'src/constants/Date';
import {debounce} from 'lodash';
import {IReturnType} from 'src/redux/reduxWrap';
import {IRun} from 'src/models/IRun';
import MapComponent from 'src/components/AppLayout/OperationsLayout/Schedule/Map/MapComponent';
import ScheduleCalendar from 'src/components/ScheduleCalendar/ScheduleCalendar';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import OperationsService from 'src/services/OperationsService';
import Cover from 'src/components/Layout/Common/Cover';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ModalJobTask, {IAddTaskToRunConfig, ModalModes} from 'src/components/Modal/Jobs/ModalJobTask/ModalJobTask';
import TaskService from 'src/services/TaskService';
import {IFormValues} from 'src/components/Modal/Jobs/ModalJobTask/JobTaskDetailsForm';
import DateTransformer from 'src/transformers/DateTransformer';
import styled from 'styled-components';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';
import {ITask} from 'src/models/ITask';
import {IUser} from 'src/models/IUser';
import {getUserNames} from 'src/utility/Helpers';
import {IVehicle} from 'src/models/IVehicle';
import moment from 'moment';

const Body = styled.div`
  height: calc(100% - ${headerHeight}px);
`;

interface IParams {
  section: string;
}

interface IState {
  date: Moment | null;
  showMap: boolean;
  location: ILocation | null;
  loading: boolean;
  showTaskSettingsModal: boolean;
  addTaskToRunConfig: IAddTaskToRunConfig;
}

interface IConnectionProps {
  dispatch: ThunkDispatch<any, any, Action>;
  runs: IReturnType<IRun[]>;
  locations: ILocation[];
}

type IProps = RouteComponentProps<IParams> & IConnectionProps;

class SchedulePage extends React.PureComponent<IProps, IState> {
  public state = {
    date: null,
    showMap: false,
    location: null,
    loading: false,
    showTaskSettingsModal: false,
    addTaskToRunConfig: {} as IAddTaskToRunConfig
  };

  public componentWillUnmount() {
    this.props.dispatch(resetRuns());
    this.eventListeners.forEach(el => el.stopListening());
  }

  private loadRuns = async () => {
    const {date, location} = this.state;
    const {dispatch} = this.props;

    if (date && location) {
      await dispatch(
        searchRuns({
          date: (date as Moment).format(BACKEND_DATE_TIME),
          location_id: (location as ILocation).id
        })
      );
    }
  };

  private debouncedLoadRuns = debounce(this.loadRuns, 300);

  private eventListeners = [EventBus.listen(EventBusEventName.TaskWasAddedToRun, this.debouncedLoadRuns)];

  private onDateChange = (date: Moment) => {
    this.setState({date});
    this.debouncedLoadRuns();
  };

  private onLocationChange = (location: ILocation) => {
    this.setState({location});
    this.debouncedLoadRuns();
  };

  private toggleShowMap = () => {
    const {location, showMap} = this.state;

    if (location) {
      this.setState({showMap: !showMap});
    }
  };

  private addNewRun = async () => {
    const {runs} = this.props;
    const {date, location} = this.state;

    if (date && location) {
      this.setState({loading: true});

      try {
        await OperationsService.createRun({
          location_id: (location as ILocation).id,
          date: (date as Moment).format(BACKEND_DATE_TIME),
          name: `Run ${runs.data ? runs.data.length + 1 : 1}`
        });
        await this.loadRuns();
      } finally {
        this.setState({loading: false});
      }
    }
  };

  private openTaskSettingModal = (addTaskToRunConfig: IAddTaskToRunConfig) => {
    this.setState({
      showTaskSettingsModal: true,
      addTaskToRunConfig
    });
  };

  private closeTaskSettingModal = () => {
    this.setState({showTaskSettingsModal: false});
  };

  private onAddTaskToRun = async (data: IFormValues) => {
    const {
      addTaskToRunConfig: {runId, task},
      location
    } = this.state;

    if (location) {
      await TaskService.addTaskToRun(+runId, task.id, {
        starts_at: DateTransformer.dehydrateDateTime(
          (data.starts_at as Moment).add(-(location as ILocation).tz_offset, 'm')
        ) as string,
        ends_at: DateTransformer.dehydrateDateTime(
          (data.ends_at as Moment).add(-(location as ILocation).tz_offset, 'm')
        ) as string
      });
    }

    EventBus.emit(EventBusEventName.TaskWasAddedToRun);
  };

  private getScheduledTasks = () => {
    const {runs} = this.props;
    const tasks: ITask[] = [];

    if (runs.data) {
      runs.data.forEach((run: IRun) => {
        tasks.push(...run.assigned_tasks);
      });
    }

    return tasks;
  };

  private renderPrintVersion = () => {
    const {runs} = this.props;
    const {location, date} = this.state;

    const l = location! as ILocation;
    const d = date! as Moment;

    return (
      <>
        <h3>
          Schedule for {l && l.name}, {d && d.format(FRONTEND_DATE)}
        </h3>
        {runs.data &&
          runs.data.map((run: IRun, i) => (
            <div key={run.id}>
              <div>
                <strong>{run.name}</strong>
                <div>Assigned staff: {run.assigned_users.map((u: IUser) => getUserNames(u).name).join(', ')}</div>
                <div>
                  Assigned vehicles:{' '}
                  {run.assigned_vehicles
                    .map((v: IVehicle) => `${v.make} ${v.model} (${v.type}, ${v.registration})`)
                    .join(', ')}
                </div>
                {run.assigned_tasks.length > 0 && (
                  <>
                    <br />
                    <table className="schedule-print-table">
                      <tbody>
                        {run.assigned_tasks
                          .sort((a: ITask, b: ITask) => (moment(a.starts_at).isAfter(moment(b.starts_at)) ? 1 : -1))
                          .map((t: ITask, index) => (
                            <tr key={t.id}>
                              <td className="task-number">#{index + 1}&nbsp;&nbsp;&nbsp;</td>
                              <td>
                                {t.job.site_address && t.job.site_address.full_address}
                                <div>
                                  {t.type.name}, #{t.job.id}
                                  {l && `-${l.code}`}
                                </div>
                                <div>
                                  {moment(t.starts_at)
                                    .utcOffset(l.tz_offset)
                                    .format(FRONTEND_TIME)}
                                  &nbsp;-&nbsp;
                                  {moment(t.ends_at)
                                    .utcOffset(l.tz_offset)
                                    .format(FRONTEND_TIME)}
                                </div>
                                {t.internal_note && <div className="task-note">{t.internal_note}</div>}
                                {t.scheduling_note && <div className="task-note">{t.scheduling_note}</div>}
                                {index < run.assigned_tasks.length - 1 && <br />}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
              {i < runs.data!.length - 1 && <div className="schedule-print-divider" />}
            </div>
          ))}
      </>
    );
  };

  public render() {
    const {locations, runs} = this.props;
    const {showMap, loading, location, date, showTaskSettingsModal, addTaskToRunConfig} = this.state;

    return (
      <UserContext.Consumer>
        {context => (
          <>
            <div style={{position: 'absolute', right: '100%', display: 'none'}}>
              <div id="print-runs">{this.renderPrintVersion()}</div>
            </div>
            {showTaskSettingsModal && location && (
              <ModalJobTask
                addTaskToRunConfig={addTaskToRunConfig}
                isOpen={showTaskSettingsModal}
                onClose={this.closeTaskSettingModal}
                edit={false}
                taskTypes={[]}
                onSave={this.onAddTaskToRun}
                item={addTaskToRunConfig.task}
                mode={ModalModes.ADD_TASK_TO_RUN}
                isSchedulingActive={true}
                doSave={false}
                doAssign={false}
              />
            )}
            <div className="d-flex h-100 flex-column align-items-stretch">
              <HeaderPanel
                title="Schedule"
                locations={locations}
                locationsLoading={false}
                onMapIconClick={this.toggleShowMap}
                showMap={showMap}
                onDateChange={this.onDateChange}
                onLocationChange={this.onLocationChange}
                runs={runs.loading ? [] : runs.data || []}
              />
              <Body className="d-flex flex-row align-items-stretch flex-grow-1 position-relative">
                {showMap && location ? (
                  <MapComponent runs={runs.data || []} loadingRuns={runs.loading} location={location!} />
                ) : (
                  <>
                    <OperationsSidebarMenu
                      locationArea={location}
                      date={date}
                      ready={runs.ready}
                      scheduledTasks={this.getScheduledTasks()}
                    />
                    <div className="flex-grow-1 position-relative">
                      {(!location || !date) && <Cover zIndex={110} />}
                      {(runs.loading || loading) && <BlockLoading size={40} color={ColorPalette.white} zIndex={110} />}
                      <div className="h-100 w-100 position-absolute">
                        <ScheduleCalendar
                          createNewRun={this.addNewRun}
                          loadRuns={this.loadRuns}
                          runs={runs.data || []}
                          openModal={this.openTaskSettingModal}
                          location={location! as ILocation}
                        />
                      </div>
                    </div>
                  </>
                )}
              </Body>
            </div>
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  locations: state.user.locations,
  runs: state.runsFromLocation
});

export default compose<React.ComponentClass<{}>>(
  withRouter,
  connect(mapStateToProps),
  DragDropContext(HTML5Backend)
)(SchedulePage);

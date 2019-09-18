import * as React from 'react';
import styled from 'styled-components';
import Icon, {IconName} from 'src/components/Icon/Icon';
import ColorPalette from 'src/constants/ColorPalette';
import {IJob, JobStatuses} from 'src/models/IJob';
import JobService from 'src/services/JobService';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import moment, {Moment} from 'moment';
import ReactDatetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import {IMenuProps} from 'src/components/Dropdown/Dropdown';
import Notify, {NotifyType} from 'src/utility/Notify';
import ReactTooltip from 'react-tooltip';
import {openModal} from 'src/redux/modalDucks';
import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {connect} from 'react-redux';
import withoutProps from 'src/components/withoutProps/withoutProps';
import {BACKEND_DATE_TIME} from 'src/constants/Date';
import {updateJobsInfo} from 'src/redux/jobsInfo';

interface IProps {
  pinned_at?: string;
  snoozed_until?: string;
  show: boolean;
  job: IJob;
  type: string;
  fetchJobs: () => Promise<any>;
  onAction: () => void;
  stopAction: () => void;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  showPicker: boolean;
}

const IconsArea = styled.div`
  width: 40px;
  padding-left: 20px;
  position: relative;
  cursor: pointer;
  path,
  circle {
    stroke: ${ColorPalette.black0};
    fill: ${ColorPalette.white};
  }
  background: inherit;
  margin-left: auto;
`;

const FullIconsArea = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  right: 0;
  background: ${ColorPalette.white};
  cursor: pointer;

  > * {
    margin-left: 15px;
  }

  input {
    display: none;
  }

  background: inherit;
`;

export const PinIcon = styled(withoutProps(['pinned_at'])(Icon))<{
  pinned_at: boolean;
}>`
  path,
  circle,
  line {
    stroke: ${props => (props.pinned_at ? ColorPalette.blue4 : ColorPalette.black0)};
    fill: ${props => (props.pinned_at ? ColorPalette.blue4 : 'transparent')};
  }

  :hover path,
  :hover line,
  :hover circle {
    stroke: ${ColorPalette.blue4};
  }
`;

export const ClockIcon = styled(withoutProps(['snoozed_until'])(Icon))<{
  snoozed_until: boolean;
}>`
  path,
  circle,
  line {
    stroke: ${props => (props.snoozed_until ? ColorPalette.orange1 : ColorPalette.black0)};
    fill: transparent;
  }

  :hover path,
  :hover line,
  :hover circle {
    stroke: ${ColorPalette.orange1};
  }
`;

class JobItemMenu extends React.PureComponent<IProps & IConnectProps, IState> {
  public state = {
    showPicker: false
  };

  public componentDidUpdate(prevProps: IProps) {
    const {show} = this.props;

    if (!show) {
      this.setState({showPicker: false});
    } else if (show !== prevProps.show) {
      ReactTooltip.rebuild();
    }
  }

  private pinJob = (e: React.MouseEvent) => {
    const {job, pinned_at, onAction, stopAction, fetchJobs} = this.props;

    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    e.nativeEvent.preventDefault();

    onAction();

    const updatePin = pinned_at ? JobService.unpinJob : JobService.pinJob;
    return updatePin(job.id)
      .then(() => {
        stopAction();
        return fetchJobs();
      })
      .catch(stopAction);
  };

  private snoozeJob = (until: string = '') => {
    const {job, onAction, stopAction, fetchJobs} = this.props;

    onAction();

    return JobService.snoozeJob(job.id, until)
      .then(() => {
        stopAction();
        return fetchJobs();
      })
      .catch(er => {
        stopAction();
        Notify(NotifyType.Danger, er.error_message);
      });
  };

  private unSnoozeJob = (e: React.MouseEvent) => {
    const {job, fetchJobs, onAction, stopAction} = this.props;

    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    e.nativeEvent.preventDefault();

    onAction();

    return JobService.unSnoozeJob(job.id)
      .then(() => {
        stopAction();
        return fetchJobs();
      })
      .catch(stopAction);
  };

  private removeJob = async () => {
    const {job, fetchJobs, onAction, stopAction, dispatch} = this.props;

    const res = await dispatch(openModal('Confirm', `Delete job ${JobService.getJobName(job)}?`));

    if (res) {
      onAction();

      return JobService.removeJob(job.id)
        .then(() => {
          stopAction();
          dispatch(updateJobsInfo());
          return fetchJobs();
        })
        .catch(stopAction);
    } else {
      return Promise.reject(true);
    }
  };

  private markAsUnread = () => {
    const {job, fetchJobs, onAction, stopAction} = this.props;

    onAction();

    return JobService.markJobAsUnread(job.id)
      .then(() => {
        stopAction();
        return fetchJobs();
      })
      .catch(stopAction);
  };

  private getRestMenuItems = (context: IUserContext) => {
    const menuItems: IMenuItem[] = [];
    const {job} = this.props;

    if (context.has(Permission.JOBS_MANAGE_MESSAGES) && !job.has_new_replies) {
      menuItems.push({name: 'Mark as unread', onClick: this.markAsUnread});
    }
    if (context.has(Permission.JOBS_DELETE)) {
      menuItems.push({name: 'Delete', onClick: this.removeJob});
    }
    if (menuItems.length === 2) {
      menuItems.splice(1, 0, {type: 'divider'});
    }
    return menuItems;
  };

  private handlePickerChange = (date: Moment | string) => {
    this.setState({showPicker: false});
    return this.snoozeJob((date as Moment).format(BACKEND_DATE_TIME));
  };

  private snoozeMenuItems: IMenuItem[] = [
    {
      type: 'header',
      name: 'Snooze until'
    },
    {
      name: 'Tomorrow',
      onClick: () => {
        return this.snoozeJob(
          moment(moment().format('YYYY-M-D'))
            .add(1, 'd')
            .format(BACKEND_DATE_TIME)
        );
      }
    },
    {
      name: `Next week: ${moment()
        .add(7, 'd')
        .format('ddd D MMM YYYY')}`,
      onClick: () => {
        return this.snoozeJob(
          moment(moment().format('YYYY-M-D'))
            .add(7, 'd')
            .format(BACKEND_DATE_TIME)
        );
      }
    },
    {
      customElements: (menuProps: IMenuProps) => (
        <>
          {!this.state.showPicker ? (
            <div
              onClick={() => {
                this.setState({showPicker: true});
              }}
            >
              Pick a date
            </div>
          ) : (
            <>
              <div className="dropdown-divider" />
              <ReactDatetime
                input={false}
                timeFormat={false}
                isValidDate={(current: Date) => {
                  const now = moment();
                  return moment(current).isAfter(now);
                }}
                onChange={date => {
                  this.handlePickerChange(date);
                  menuProps.close();
                }}
              />
            </>
          )}
        </>
      ),
      noClose: true,
      classNames: 'custom'
    }
  ];

  public render() {
    const {show, type, pinned_at, snoozed_until, job} = this.props;
    const editForbidden =
      job.latest_status.status === JobStatuses.Closed || job.latest_status.status === JobStatuses.Cancelled;

    const isInbox = type === 'inbox';

    return (
      <UserContext.Consumer>
        {context => {
          const canManageInbox = context.has(Permission.JOBS_MANAGE_INBOX);
          const tooltipId = `job-list-tooltip-${job.id}`;
          const restMenuItems = this.getRestMenuItems(context);

          return (
            <IconsArea>
              <FullIconsArea className="d-flex flex-row justify-content-between">
                <ReactTooltip className="overlapping" id={tooltipId} effect="solid" />

                {((show && canManageInbox && !editForbidden) || pinned_at) && (
                  <PinIcon
                    name={IconName.Pin}
                    pinned_at={!!pinned_at}
                    data-tip={pinned_at ? 'Unpin job' : 'Pin job'}
                    data-for={tooltipId}
                    onClick={canManageInbox ? this.pinJob : undefined}
                  />
                )}
                {!isInbox &&
                  !editForbidden &&
                  (show || snoozed_until) &&
                  (() => {
                    if (snoozed_until) {
                      return (
                        <ClockIcon
                          name={IconName.Clock}
                          data-tip={canManageInbox ? 'Unsnooze job' : 'Snoozed'}
                          data-for={tooltipId}
                          onClick={canManageInbox ? this.unSnoozeJob : undefined}
                          snoozed_until={true}
                        />
                      );
                    } else if (canManageInbox) {
                      return (
                        <DropdownMenuControl
                          items={this.snoozeMenuItems}
                          direction="right"
                          trigger={() => (
                            <ClockIcon
                              name={IconName.Clock}
                              data-tip="Snooze job"
                              data-for={tooltipId}
                              snoozed_until={false}
                            />
                          )}
                        />
                      );
                    }
                    return null;
                  })()}
                {show && restMenuItems.length > 0 && (
                  <DropdownMenuControl
                    items={restMenuItems}
                    noMargin={true}
                    direction="right"
                    iconName={IconName.MenuVertical}
                  />
                )}
              </FullIconsArea>
            </IconsArea>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default connect()(JobItemMenu);

export const InternalJobItemMenu = JobItemMenu;

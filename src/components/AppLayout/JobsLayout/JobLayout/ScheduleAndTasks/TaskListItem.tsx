import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {ITask, TaskStatuses} from 'src/models/ITask';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import Typography from 'src/constants/Typography';
import moment from 'moment';
import {default as Icon, IconName} from 'src/components/Icon/Icon';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {ActionIcon} from 'src/components/Layout/PageMenu';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {IUser} from 'src/models/IUser';
import {ITeamSimple} from 'src/models/ITeam';
import TaskService from 'src/services/TaskService';
import withoutProps from 'src/components/withoutProps/withoutProps';
import {colorTransformer} from 'src/utility/Helpers';

interface IProps {
  item: ITask;
  onTaskEdit: (task: ITask) => void;
  jobId: number;
  fetch: () => Promise<any>;
  deleteTask: () => Promise<any>;
}

interface IState {
  showNote: boolean;
}

const Plate = styled(withoutProps(['color'])('div'))<{
  color: string;
}>`
  border-top: 1px solid ${ColorPalette.gray2};
  background: ${ColorPalette.white};
  box-shadow: 4px 0 0 0 ${props => props.color} inset;
`;

const TopPart = styled.div`
  padding: 0 30px;
  height: 60px;
`;

const UpperCaseSpan = styled.span`
  text-transform: uppercase;
  white-space: nowrap;
`;

const {ColoredDiv} = StyledComponents;

class TaskListItem extends React.PureComponent<IProps, IState> {
  public state = {
    showNote: false
  };

  private menuItems = (context: any): IMenuItem[] => {
    const {onTaskEdit, item, jobId, fetch, deleteTask} = this.props;
    const taskIsCompleted = this.isTaskCompleted();
    const taskIsScheduledCompleted = this.isTaskScheduledCompleted();

    const res = [
      {
        name: 'Edit',
        onClick: () => onTaskEdit(item)
      },
      {
        type: 'divider'
      },
      {
        name: `Mark task ${taskIsCompleted ? 'incomplete' : 'done'}`,
        onClick: async () => {
          await TaskService.changeTaskStatus(jobId, item.id, {
            status: taskIsCompleted ? TaskStatuses.Active : TaskStatuses.Completed
          });
          fetch();
        }
      },
      {
        name: `Mark scheduled ${taskIsScheduledCompleted ? 'incomplete' : 'done'}`,
        onClick: async () => {
          await TaskService.changeTaskScheduledStatus(jobId, item.id, {
            status: taskIsScheduledCompleted ? TaskStatuses.Active : TaskStatuses.Completed
          });
          fetch();
        },
        remove: !item.starts_at
      },
      {
        type: 'divider'
      },
      {
        name: 'Delete',
        onClick: deleteTask
      }
    ];

    return res.filter((el: any) => !el.remove) as IMenuItem[];
  };

  private isTaskCompleted = () => {
    const {item} = this.props;

    return !!item.latest_status && item.latest_status.status === TaskStatuses.Completed;
  };

  private isTaskScheduledCompleted = () => {
    const {item} = this.props;

    return !!item.latest_scheduled_status && item.latest_scheduled_status.status === TaskStatuses.Completed;
  };

  private get isWasted() {
    const {item} = this.props;

    return moment().isAfter(moment(item.due_at));
  }

  public render() {
    const {item} = this.props;
    const {showNote} = this.state;

    return (
      <UserContext.Consumer>
        {context => {
          const menuItems = this.menuItems(context);

          return (
            <Plate color={item.type.color ? colorTransformer(item.type.color) : ColorPalette.white}>
              <TopPart className="d-flex align-items-center justify-content-between">
                <ColoredDiv margin="0 20px 0 0" weight={Typography.weight.bold}>
                  {item.type.name}
                </ColoredDiv>
                <div className="d-flex align-items-center">
                  <ColoredDiv className="d-flex align-items-center" padding="0 0 0 30px">
                    <ColoredDiv className="d-flex align-items-center" margin="0 0 0 30px" style={{width: '180px'}}>
                      {item.due_at && (
                        <>
                          {this.isTaskCompleted() ? (
                            <ColoredIcon
                              name={IconName.CheckSquare}
                              color={ColorPalette.blue2}
                              style={{margin: '0 15px 0 0'}}
                            />
                          ) : (
                            <ColoredIcon
                              name={IconName.LayoutNone}
                              color={ColorPalette.gray2}
                              style={{margin: '0 15px 0 0'}}
                            />
                          )}
                          <ColoredDiv color={ColorPalette.gray5} weight={Typography.weight.medium}>
                            <UpperCaseSpan>Due</UpperCaseSpan>
                            <ColoredDiv color={this.isWasted ? ColorPalette.red1 : ColorPalette.black1}>
                              <UpperCaseSpan>{moment(item.due_at).format('D MMM, H:mm A')}</UpperCaseSpan>
                            </ColoredDiv>
                          </ColoredDiv>
                        </>
                      )}
                    </ColoredDiv>
                    <ColoredDiv className="d-flex align-items-center" margin="0 0 0 30px" style={{width: '180px'}}>
                      {item.starts_at && (
                        <>
                          {this.isTaskScheduledCompleted() ? (
                            <ColoredIcon
                              name={IconName.CheckSquare}
                              color={ColorPalette.blue2}
                              style={{margin: '0 15px 0 0'}}
                            />
                          ) : (
                            <ColoredIcon
                              name={IconName.LayoutNone}
                              color={ColorPalette.gray2}
                              style={{margin: '0 15px 0 0'}}
                            />
                          )}
                          <ColoredDiv color={ColorPalette.gray5} weight={Typography.weight.medium}>
                            <UpperCaseSpan>Scheduled</UpperCaseSpan>
                            <ColoredDiv color={ColorPalette.black1}>
                              <UpperCaseSpan>{moment(item.starts_at).format('D MMM, H:mm A')}</UpperCaseSpan>
                            </ColoredDiv>
                          </ColoredDiv>
                        </>
                      )}
                    </ColoredDiv>
                  </ColoredDiv>
                  <ColoredDiv
                    className="d-flex align-items-center justify-content-end"
                    overflow="visible"
                    margin="0 0 0 30px"
                    style={{width: '60px'}}
                  >
                    {(item.internal_note ||
                      item.assigned_users.length > 0 ||
                      (item.assigned_teams || []).length > 0) && (
                      <ActionIcon onClick={() => this.setState({showNote: !this.state.showNote})}>
                        <Icon name={IconName.MessageChat} />
                      </ActionIcon>
                    )}
                    <DropdownMenuControl
                      iconName={IconName.MenuVertical}
                      items={menuItems}
                      disabled={!context.has(Permission.JOBS_TASK_MANAGE)}
                      noMargin={true}
                    />
                  </ColoredDiv>
                </div>
              </TopPart>
              {showNote && (
                <ColoredDiv padding="5px 30px 15px 30px" color={ColorPalette.gray5}>
                  {item.internal_note}
                  <ColoredDiv weight={Typography.weight.bold} color={ColorPalette.gray5}>
                    {(item.assigned_teams || [])
                      .map((el: ITeamSimple) => el.name)
                      .concat(item.assigned_users.map((el: IUser) => el.full_name) as any)
                      .join(', ')}
                  </ColoredDiv>
                </ColoredDiv>
              )}
            </Plate>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default TaskListItem;

import * as React from 'react';
import styled from 'styled-components';
import withoutProps from 'src/components/withoutProps/withoutProps';
import ColorPalette from 'src/constants/ColorPalette';
import {IRun} from 'src/models/IRun';
import {ITask} from 'src/models/ITask';
import ScheduleCalendarRunTask from 'src/components/ScheduleCalendar/ScheduleCalendarRunTask';
import ScheduleCalendarRunDropTargetBlock from 'src/components/ScheduleCalendar/ScheduleCalendarRunDropTargetBlock';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {ILocation} from 'src/models/IAddress';

const RunContainer = styled(withoutProps(['width'])('div'))<{
  width: number;
}>`
  width: ${props => props.width}px;
  border-right: 1px solid ${ColorPalette.gray1};
  position: relative;
  box-sizing: unset;
  border-bottom: 1px solid ${ColorPalette.gray2};

  &:last-child {
    border-right: 1px solid ${ColorPalette.gray2};
  }
`;

export const RunContainerBlock = styled(withoutProps(['height', 'width'])('div'))<{
  height: number;
  width: number;
}>`
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  border-bottom: 1px solid ${ColorPalette.gray1};

  &:last-child {
    border-bottom: 0;
  }
`;

interface IProps {
  startHours: number;
  endHours: number;
  blockHeight: number;
  blockWidth: number;
  newRun?: boolean;
  run?: IRun;
  openModal?: (data: any) => any;
  loadRuns?: () => any;
  location: ILocation;
}

interface IState {
  hours: number[];
}

class ScheduleCalendarRun extends React.PureComponent<IProps, IState> {
  public state = {
    hours: [],
    dragEntered: false
  };

  public componentDidMount() {
    const {startHours, endHours} = this.props;
    const hours = [];

    for (let i = startHours; i < endHours; i++) {
      hours.push(i);
    }

    this.setState({hours});
  }

  public render() {
    const {blockHeight, blockWidth, newRun, run, openModal, loadRuns, location} = this.props;
    const {hours} = this.state;

    return (
      <UserContext.Consumer>
        {context => (
          <RunContainer width={blockWidth}>
            {run &&
              run.assigned_tasks.map((task: ITask) => (
                <ScheduleCalendarRunTask key={task.id} task={task} run={run} loadRuns={loadRuns!} location={location} />
              ))}
            {hours.map(hour => (
              <RunContainerBlock key={hour} height={blockHeight} width={blockWidth}>
                {context.has(Permission.OPERATIONS_RUNS_MANAGE) && !newRun && (
                  <ScheduleCalendarRunDropTargetBlock openModal={openModal!} run={run!} hour={hour} />
                )}
              </RunContainerBlock>
            ))}
          </RunContainer>
        )}
      </UserContext.Consumer>
    );
  }
}

export default ScheduleCalendarRun;

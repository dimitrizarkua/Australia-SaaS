import * as React from 'react';
import {DropTarget, DropTargetMonitor} from 'react-dnd';
import {EssencesTypes} from 'src/constants/Operations';
import {IRun} from 'src/models/IRun';
import moment from 'moment';
import {IAddTaskToRunConfig} from 'src/components/Modal/Jobs/ModalJobTask/ModalJobTask';
import {ITask} from 'src/models/ITask';
import styled from 'styled-components';
import withoutProps from 'src/components/withoutProps/withoutProps';
import ColorPalette from 'src/constants/ColorPalette';

const DropArea = styled(withoutProps(['dragEntered'])('div'))<{
  dragEntered: boolean;
}>`
  background: ${props => (props.dragEntered ? ColorPalette.blue0 : 'transparent')};
  width: 100%;
  height: 100%;
`;

interface IInputProps {
  openModal: (data: IAddTaskToRunConfig) => any;
  run: IRun;
  hour: number;
}

interface IDropProps {
  connectDropTarget: any;
  isOver: boolean;
}

class ScheduleCalendarRunDropTargetBlock extends React.PureComponent<IInputProps & IDropProps> {
  public render() {
    const {isOver, connectDropTarget} = this.props;

    return connectDropTarget(
      <div className="w-100 h-100">
        <DropArea dragEntered={isOver} />
      </div>
    );
  }
}

const dropSpec = {
  drop(props: IInputProps, monitor: DropTargetMonitor) {
    const {openModal, run, hour} = props;
    const task = monitor.getItem();

    openModal({
      runId: run.id,
      task: task as ITask,
      startHour: hour,
      date: moment(run.date)
    });

    return task;
  }
};

const dropCollect = (dropConnect: any, monitor: DropTargetMonitor) => {
  return {
    connectDropTarget: dropConnect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

export default DropTarget<IInputProps>(EssencesTypes.TASK, dropSpec, dropCollect)(ScheduleCalendarRunDropTargetBlock);

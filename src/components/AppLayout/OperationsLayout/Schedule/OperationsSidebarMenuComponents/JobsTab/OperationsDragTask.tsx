import * as React from 'react';
import {DragSource} from 'react-dnd';
import {EssencesTypes} from 'src/constants/Operations';
import OperationsTask, {
  IInputProps
} from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/JobsTab/OperationsTask';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';

interface IDragProps {
  connectDragSource: any;
}

class OperationsDragTask extends React.PureComponent<IInputProps & IDragProps> {
  public render() {
    const {task, locationArea, connectDragSource, date} = this.props;

    return (
      <UserContext.Consumer>
        {context =>
          context.has(Permission.OPERATIONS_RUNS_MANAGE) &&
          (!task.starts_at && !task.ends_at) &&
          !task.snoozed_until ? (
            connectDragSource(
              <div>
                <OperationsTask task={task} locationArea={locationArea} date={date} />
              </div>
            )
          ) : (
            <OperationsTask task={task} locationArea={locationArea} date={date} />
          )
        }
      </UserContext.Consumer>
    );
  }
}

const dragSpec = {
  beginDrag(props: IInputProps) {
    const {task} = props;

    return task;
  }
};

const dragCollect = (dragConnect: any, monitor: any) => {
  return {
    connectDragSource: dragConnect.dragSource(),
    isDragging: monitor.isDragging()
  };
};

export default DragSource<IInputProps>(EssencesTypes.TASK, dragSpec, dragCollect)(OperationsDragTask);

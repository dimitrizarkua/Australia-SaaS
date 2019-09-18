import * as React from 'react';
import {DragSource} from 'react-dnd';
import {EssencesTypes} from 'src/constants/Operations';
import OperationsVehicle, {
  IInputProps
} from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/VehiclesTab/OperationsVehicle';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';

interface IDragProps {
  connectDragSource: any;
}

class OperationsDragVehicle extends React.PureComponent<IInputProps & IDragProps> {
  public render() {
    const {vehicle, connectDragSource} = this.props;

    return (
      <UserContext.Consumer>
        {context =>
          context.has(Permission.OPERATIONS_RUNS_MANAGE) && !vehicle.is_booked ? (
            connectDragSource(
              <div>
                <OperationsVehicle vehicle={vehicle} />
              </div>
            )
          ) : (
            <OperationsVehicle vehicle={vehicle} />
          )
        }
      </UserContext.Consumer>
    );
  }
}

const dragSpec = {
  beginDrag(props: IInputProps) {
    const {vehicle} = props;

    return vehicle;
  }
};

const dragCollect = (dragConnect: any, monitor: any) => {
  return {
    connectDragSource: dragConnect.dragSource(),
    isDragging: monitor.isDragging()
  };
};

export default DragSource<IInputProps>(EssencesTypes.VEHICLE, dragSpec, dragCollect)(OperationsDragVehicle);

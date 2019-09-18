import * as React from 'react';
import OperationsStaffMember, {
  IInputProps
} from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/StaffTab/OperationsStaffMember';
import {DragSource} from 'react-dnd';
import {EssencesTypes} from 'src/constants/Operations';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';

interface IDragProps {
  connectDragSource: any;
}

class OperationsDragStaffMember extends React.PureComponent<IInputProps & IDragProps> {
  public render() {
    const {staffMember, connectDragSource, booked} = this.props;

    return (
      <UserContext.Consumer>
        {context =>
          context.has(Permission.OPERATIONS_RUNS_MANAGE) ? (
            connectDragSource(
              <div>
                <OperationsStaffMember staffMember={staffMember} booked={booked} />
              </div>
            )
          ) : (
            <OperationsStaffMember staffMember={staffMember} booked={booked} />
          )
        }
      </UserContext.Consumer>
    );
  }
}

const dragSpec = {
  beginDrag(props: IInputProps) {
    const {staffMember} = props;

    return staffMember;
  }
};

const dragCollect = (dragConnect: any, monitor: any) => {
  return {
    connectDragSource: dragConnect.dragSource(),
    isDragging: monitor.isDragging()
  };
};

export default DragSource<IInputProps>(EssencesTypes.CREW, dragSpec, dragCollect)(OperationsDragStaffMember);

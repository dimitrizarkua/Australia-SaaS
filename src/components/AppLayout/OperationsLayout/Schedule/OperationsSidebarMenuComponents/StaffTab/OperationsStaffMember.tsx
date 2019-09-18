import * as React from 'react';
import {IStaff} from 'src/models/IUser';
import {getUserNames} from 'src/utility/Helpers';
import OperationsSidebarMenuUnitWrapper from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsSidebarMenuUnitWrapper';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';

export interface IInputProps {
  staffMember: IStaff;
  booked?: boolean;
}

class OperationsStaffMember extends React.PureComponent<IInputProps> {
  private getHoursColor = () => {
    const {
      staffMember: {week_hours, working_hours_per_week}
    } = this.props;

    if (working_hours_per_week) {
      let color = ColorPalette.black1;
      const ratio = week_hours / working_hours_per_week;

      if (ratio > 0.89) {
        color = ColorPalette.orange2;
      }

      if (ratio > 0.99) {
        color = ColorPalette.red1;
      }

      return color;
    }

    return ColorPalette.black1;
  };

  public render() {
    const {staffMember, booked} = this.props;
    const staffNames = getUserNames(staffMember);

    return (
      <OperationsSidebarMenuUnitWrapper>
        <ColoredDiv
          fontSize={Typography.size.smaller}
          weight={Typography.weight.bold}
          className="d-flex justify-content-between align-items-center"
          color={booked ? ColorPalette.gray4 : ColorPalette.black1}
        >
          <div>{staffNames.name}</div>
          <div className="d-flex">
            <ColoredDiv color={ColorPalette.gray4} margin="0 5px 0 0">
              ({staffMember.date_hours.toFixed(1)}hrs)
            </ColoredDiv>
            <ColoredDiv color={this.getHoursColor()}>{staffMember.week_hours.toFixed(1)}hrs</ColoredDiv>
          </div>
        </ColoredDiv>
      </OperationsSidebarMenuUnitWrapper>
    );
  }
}

export default OperationsStaffMember;

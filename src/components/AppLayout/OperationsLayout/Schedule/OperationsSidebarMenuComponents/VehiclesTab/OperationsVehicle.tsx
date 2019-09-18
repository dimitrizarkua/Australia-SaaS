import * as React from 'react';
import OperationsSidebarMenuUnitWrapper from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsSidebarMenuUnitWrapper';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import Typography from 'src/constants/Typography';
import {IVehicle} from 'src/models/IVehicle';
import ColorPalette from 'src/constants/ColorPalette';

export interface IInputProps {
  vehicle: IVehicle;
}

class OperationsVehicle extends React.PureComponent<IInputProps> {
  public render() {
    const {vehicle} = this.props;

    return (
      <OperationsSidebarMenuUnitWrapper>
        <ColoredDiv fontSize={Typography.size.smaller} className="d-flex justify-content-between">
          <div className="d-flex">
            <ColoredDiv
              weight={Typography.weight.bold}
              color={vehicle.is_booked ? ColorPalette.gray4 : ColorPalette.black1}
            >
              {vehicle.registration}
            </ColoredDiv>
            {vehicle.rent_starts_at && (
              <ColoredDiv color={ColorPalette.purple2} margin="0 0 0 10px">
                (Rental)
              </ColoredDiv>
            )}
          </div>
          <ColoredDiv color={ColorPalette.gray4}>{vehicle.type.toUpperCase()}</ColoredDiv>
        </ColoredDiv>
      </OperationsSidebarMenuUnitWrapper>
    );
  }
}

export default OperationsVehicle;

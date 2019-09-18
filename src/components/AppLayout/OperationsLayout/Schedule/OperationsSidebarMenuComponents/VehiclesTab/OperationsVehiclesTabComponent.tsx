import * as React from 'react';
import {ILocation} from 'src/models/IAddress';
import {ColoredDiv, Link} from 'src/components/Layout/Common/StyledComponents';
import withData, {IResource} from 'src/components/withData/withData';
import VehiclesService from 'src/services/VehiclesService';
import {IVehicle} from 'src/models/IVehicle';
import OperationsDragVehicle from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/VehiclesTab/OperationsDragVehicle';
import St from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsSidebarMenuStyleConfig';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import {IUserContext} from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import UserContext from 'src/components/AppLayout/UserContext';
import ColorPalette from 'src/constants/ColorPalette';
import OperationsSidebarMenuSubTitle from 'src/components/AppLayout/OperationsLayout/Schedule/OperationsSidebarMenuComponents/OperationsSidebarMenuSubTitle';
import {Moment} from 'moment';
import DateTransformer from 'src/transformers/DateTransformer';
import ModalRentalCars, {IFormValues} from 'src/components/Modal/Operations/Schedule/ModalRentalCars';
import VehicleTransformer from 'src/transformers/VehicleTransformer';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {IWithContextProps, withContext} from 'src/components/withContext';
import {compose} from 'redux';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';

interface IInputProps {
  locationArea: ILocation | null;
  date: Moment | null;
}

interface IWithDataProps {
  loadVehicles: IResource<IVehicle[]>;
}

interface IState {
  showRentalCarsModal: boolean;
}

class OperationsVehiclesTabComponent extends React.PureComponent<
  IInputProps & IWithDataProps & IWithContextProps<IUserContext>,
  IState
> {
  public state = {
    showRentalCarsModal: false
  };

  public componentDidMount() {
    this.fetchVehiclesWithContext(this.props.currentContext);
  }

  public componentDidUpdate(prevProps: IInputProps) {
    const {locationArea, date, currentContext} = this.props;

    if (
      (locationArea && locationArea.id !== (prevProps.locationArea && prevProps.locationArea.id)) ||
      (date && date.unix() !== (prevProps.date && prevProps.date.unix()))
    ) {
      this.fetchVehiclesWithContext(currentContext);
    }
  }

  public componentWillUnmount() {
    this.eventListeners.map(el => el.stopListening());
  }

  private fetchVehiclesWithContext = (context?: IUserContext) => {
    const {
      locationArea,
      loadVehicles: {fetch},
      date
    } = this.props;

    if (context && context.has(Permission.OPERATIONS_VEHICLES_VIEW) && locationArea && date) {
      fetch(locationArea.id, DateTransformer.dehydrateDate(date));
    }
  };

  private eventListeners = [
    EventBus.listen(EventBusEventName.VehicleAssignedToTask, () =>
      this.fetchVehiclesWithContext(this.props.currentContext)
    )
  ];

  private sortVehicles = () => {
    const {
      loadVehicles: {data}
    } = this.props;
    const vehicles = data
      ? data.filter((vehicle: IVehicle) => !vehicle.latest_status.type.makes_vehicle_unavailable)
      : [];
    const booked: IVehicle[] = [];
    const available: IVehicle[] = [];

    vehicles.forEach((v: IVehicle) => {
      if (v.is_booked) {
        booked.push(v);
      } else {
        available.push(v);
      }
    });

    return {
      available,
      booked
    };
  };

  private showRentalCarsModal = () => {
    this.setState({showRentalCarsModal: true});
  };

  private hideRentalCarsModal = () => {
    this.setState({showRentalCarsModal: false});
  };

  private onRentalCarSubmit = async (data: IFormValues) => {
    await VehiclesService.createVehicle(VehicleTransformer.convertToApi(data));
    this.fetchVehiclesWithContext(this.props.currentContext);
  };

  public render() {
    const {
      loadVehicles: {loading}
    } = this.props;
    const {showRentalCarsModal} = this.state;
    const sortedVehicles = this.sortVehicles();

    return (
      <UserContext.Consumer>
        {context => (
          <>
            {showRentalCarsModal && (
              <ModalRentalCars
                isOpen={showRentalCarsModal}
                onClose={this.hideRentalCarsModal}
                title="Add Rental Car"
                onSubmit={this.onRentalCarSubmit}
              />
            )}
            {loading && <BlockLoading color={ColorPalette.gray1} zIndex={2} size={40} />}
            <ColoredDiv
              padding={`${St.paddingTop} ${St.paddingRight} 0 ${St.paddingLeft}`}
              className="flex-shrink-0"
              overflow="visible"
            >
              <div className="d-flex justify-content-end">
                <Link noDecoration={true} onClick={this.showRentalCarsModal}>
                  Add rental
                </Link>
              </div>
            </ColoredDiv>
            <ScrollableContainer className="d-flex flex-column flex-grow-1">
              <ColoredDiv
                padding={`${St.paddingTop} ${St.paddingRight} ${St.paddingBottom} ${St.paddingLeft}`}
                overflow="visible"
              >
                {sortedVehicles.available.map((vehicle: IVehicle) => (
                  <OperationsDragVehicle key={vehicle.id} vehicle={vehicle} />
                ))}
                {sortedVehicles.booked.length > 0 && (
                  <OperationsSidebarMenuSubTitle>Booked</OperationsSidebarMenuSubTitle>
                )}
                {sortedVehicles.booked.map((vehicle: IVehicle) => (
                  <OperationsDragVehicle key={vehicle.id} vehicle={vehicle} />
                ))}
              </ColoredDiv>
            </ScrollableContainer>
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

export default compose<React.ComponentClass<IInputProps>>(
  withData({
    loadVehicles: {
      fetch: VehiclesService.searchVehicles
    }
  }),
  withContext(UserContext)
)(OperationsVehiclesTabComponent);

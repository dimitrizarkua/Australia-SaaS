import * as React from 'react';
import {IUser} from 'src/models/IUser';
import {reduxForm, InjectedFormProps} from 'redux-form';
import {IRun} from 'src/models/IRun';
import {compose} from 'redux';
import withData, {IResource} from 'src/components/withData/withData';
import {orderBy} from 'lodash';
import styled from 'styled-components';
import {Wrapper} from 'src/components/Modal/Jobs/ModalJobTask/Assignee';
import VehiclesService from 'src/services/VehiclesService';
import {IVehicle} from 'src/models/IVehicle';
import {ColoredDiv} from 'src/components/Layout/Common/StyledComponents';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';

const VehiclesHolder = styled.div`
  margin-top: 30px;
  min-height: 60px;
  position: relative;
`;

interface IInputProps {
  run: IRun;
  onSubmit: (data: IFormValues) => any;
}

export interface IFormValues {
  selectedVehicles: IVehicle[];
}

interface IWithDataProps {
  locationVehicles: IResource<IVehicle[]>;
}

interface IState {
  selectedVehicles: IVehicle[];
}

export const RunSettingsVehiclesFormName = 'RunSettingsVehiclesForm';

type IProps = InjectedFormProps<IFormValues, IInputProps> & IInputProps & IWithDataProps;

class RunSettingsVehiclesForm extends React.PureComponent<IProps, IState> {
  public state = {
    search: '',
    selectedVehicles: []
  };

  public componentDidMount() {
    const {run, change, locationVehicles} = this.props;

    this.setState({
      selectedVehicles: run.assigned_vehicles || []
    });
    change('selectedVehicles', run.assigned_vehicles || []);
    locationVehicles.fetch(run.location_id);
  }

  private isVehicleSelected = (id: number) => {
    const {selectedVehicles} = this.state;

    return selectedVehicles.map((el: IUser) => el.id).includes(id);
  };

  private onVehicleClick = (vehicle: IVehicle) => {
    if (this.isVehicleSelected(vehicle.id)) {
      this.setState({selectedVehicles: this.state.selectedVehicles.filter((el: IVehicle) => el.id !== vehicle.id)});
    } else {
      this.setState({selectedVehicles: (this.state.selectedVehicles as any).concat(vehicle)});
    }

    setTimeout(() => this.props.change('selectedVehicles', this.state.selectedVehicles));
  };

  private renderVehicle = (el: IVehicle) => (
    <Wrapper key={`${el.id}-vehicle`} onClick={() => this.onVehicleClick(el)} selected={this.isVehicleSelected(el.id)}>
      <div className="d-flex">
        <ColoredDiv weight={Typography.weight.bold}>{el.registration}</ColoredDiv>
        <ColoredDiv color={ColorPalette.gray4} margin="0 0 0 10px">
          {el.make} {el.model}
        </ColoredDiv>
      </div>
      <ColoredDiv color={ColorPalette.gray5} style={{textTransform: 'uppercase'}}>
        {el.type}
      </ColoredDiv>
    </Wrapper>
  );

  private getOrderedVehicles = () => {
    const {
      locationVehicles: {data}
    } = this.props;

    return orderBy(data || [], ['registration'], ['asc']);
  };

  public render() {
    const {handleSubmit, locationVehicles} = this.props;
    const vehicles = this.getOrderedVehicles();

    return (
      <form autoComplete="off" onSubmit={handleSubmit}>
        <VehiclesHolder>
          {locationVehicles.loading && <BlockLoading size={40} color={ColorPalette.white} />}
          {vehicles.length > 0 ? vehicles.map((el: IVehicle) => this.renderVehicle(el)) : 'No available vehicles'}
        </VehiclesHolder>
      </form>
    );
  }
}

export default compose<React.ComponentClass<IInputProps>>(
  reduxForm<IFormValues, IInputProps>({
    form: RunSettingsVehiclesFormName
  }),
  withData({
    locationVehicles: {
      fetch: VehiclesService.searchVehicles
    }
  })
)(RunSettingsVehiclesForm);

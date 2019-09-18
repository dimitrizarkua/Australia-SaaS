import * as React from 'react';
import {IModal} from 'src/models/IModal';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import {IRun} from 'src/models/IRun';
import styled from 'styled-components';
import {ModalStyles} from 'src/components/Modal/ModalStyles';
import ColorPalette from 'src/constants/ColorPalette';
import TabNav, {ITab} from 'src/components/TabNav/TabNav';
import RunSettingsDetailsForm, {
  IFormValues,
  RunSettingsDetailsFormName
} from 'src/components/Modal/Operations/Schedule/ModalOperationsRunSettings/RunSettingsDetailsForm';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {isValid, submit} from 'redux-form';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import RunSettingsStaffForm, {
  IFormValues as IStaffFormValues,
  RunSettingsStaffFormName
} from 'src/components/Modal/Operations/Schedule/ModalOperationsRunSettings/RunSettingsStaffForm';
import {ThunkDispatch} from 'redux-thunk';
import OperationsService from 'src/services/OperationsService';
import {IUser} from 'src/models/IUser';
import {intersection, difference} from 'lodash';
import RunSettingsVehiclesForm, {
  RunSettingsVehiclesFormName,
  IFormValues as IVehiclesFormValues
} from 'src/components/Modal/Operations/Schedule/ModalOperationsRunSettings/RunSettingsVehiclesForm';
import {IVehicle} from 'src/models/IVehicle';
import {ColoredDiv, Link} from 'src/components/Layout/Common/StyledComponents';
import {openModal} from 'src/redux/modalDucks';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';

const TopMenu = styled.div`
  padding: 0 ${ModalStyles.horizontalPadding}px;
  height: 60px;
  margin: -30px -${ModalStyles.horizontalPadding}px 30px;
  border-bottom: 1px solid ${ColorPalette.gray2};
  display: flex;
`;

interface IInputProps {
  run: IRun;
  afterSubmit?: () => any;
  startOpenTabId?: Tabs;
}

interface IConnectProps {
  validFormDetails: boolean;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  loading: boolean;
  activeTabId: Tabs;
  detailsValues: IFormValues;
  staffValues: IStaffFormValues;
  vehiclesValues: IVehiclesFormValues;
}

export enum Tabs {
  Details,
  Staff,
  Vehicles
}

class ModalOperationsRunSettings extends React.PureComponent<IInputProps & IModal & IConnectProps, IState> {
  public state = {
    loading: false,
    activeTabId: this.props.startOpenTabId || Tabs.Details,
    detailsValues: {} as IFormValues,
    staffValues: {} as IStaffFormValues,
    vehiclesValues: {} as IVehiclesFormValues
  };

  private tabs: ITab[] = [
    {
      name: 'Details',
      id: Tabs.Details,
      onClick: () => this.setState({activeTabId: Tabs.Details})
    },
    {
      name: 'Staff',
      id: Tabs.Staff,
      onClick: () => this.setState({activeTabId: Tabs.Staff})
    },
    {
      name: 'Vehicles',
      id: Tabs.Vehicles,
      onClick: () => this.setState({activeTabId: Tabs.Vehicles})
    }
  ];

  private onDetailsSubmit = (detailsValues: IFormValues) => {
    this.setState({detailsValues});
  };
  private onStaffSubmit = (staffValues: IStaffFormValues) => {
    this.setState({staffValues});
  };
  private onVehiclesSubmit = (vehiclesValues: IVehiclesFormValues) => {
    this.setState({vehiclesValues});
  };

  private removeRun = async () => {
    const {run, dispatch, afterSubmit, onClose} = this.props;

    if (run && afterSubmit) {
      const res = await dispatch(openModal('Confirm', `Delete ${run.name}?`));

      if (res) {
        this.setState({loading: true});
        try {
          await OperationsService.removeRun(run.id);
          afterSubmit();
          setTimeout(() => {
            onClose();
          });
        } finally {
          this.setState({loading: false});
        }
      }
    }
  };

  private renderBody = () => {
    const {run} = this.props;
    const {activeTabId} = this.state;

    return (
      <>
        <TopMenu>
          <TabNav selectedTabId={activeTabId} items={this.tabs} />
        </TopMenu>
        <div style={{display: activeTabId === Tabs.Details ? 'block' : 'none'}}>
          <RunSettingsDetailsForm
            onSubmit={this.onDetailsSubmit}
            initialValues={{
              name: run.name
            }}
          />
          <ColoredDiv>
            <Link color={ColorPalette.red1} colorOnHover={ColorPalette.red1} onClick={this.removeRun}>
              Delete Run
            </Link>
          </ColoredDiv>
        </div>
        <div style={{display: activeTabId === Tabs.Staff ? 'block' : 'none'}}>
          <RunSettingsStaffForm onSubmit={this.onStaffSubmit} run={run} />
        </div>
        <div style={{display: activeTabId === Tabs.Vehicles ? 'block' : 'none'}}>
          <RunSettingsVehiclesForm run={run} onSubmit={this.onVehiclesSubmit} />
        </div>
      </>
    );
  };

  private submitCombine = async () => {
    const {dispatch, onClose, run, afterSubmit} = this.props;

    this.setState({loading: true});

    try {
      await dispatch(submit(RunSettingsDetailsFormName));
      await dispatch(submit(RunSettingsStaffFormName));
      await dispatch(submit(RunSettingsVehiclesFormName));

      const {detailsValues, staffValues, vehiclesValues} = this.state;

      await Promise.all([
        OperationsService.updateRun(run.id, detailsValues),
        this.onAssignUsers(staffValues),
        this.onAssignVehicles(vehiclesValues)
      ]);

      if (afterSubmit) {
        afterSubmit();
      }

      onClose();
    } finally {
      this.setState({loading: false});
    }
  };

  private onAssignUsers = async (data: IStaffFormValues) => {
    const {run} = this.props;

    const existedUsersId = (run.assigned_users || []).map((el: IUser) => el.id);
    const newUsersId = (data.selectedUsers || []).map((el: IUser) => el.id);
    const usersIntersection = intersection(existedUsersId, newUsersId);
    const usersToAdd = difference(newUsersId, usersIntersection);
    const usersToRemove = difference(existedUsersId, usersIntersection);

    await Promise.all([
      Promise.all(usersToAdd.map(el => OperationsService.assignStaffToRun(run.id, el))),
      Promise.all(usersToRemove.map(el => OperationsService.removeStaffFromRun(run.id, el)))
    ]);

    EventBus.emit(EventBusEventName.StaffAssignedToTask);
  };

  private onAssignVehicles = async (data: IVehiclesFormValues) => {
    const {run} = this.props;

    const existedVehiclesId = (run.assigned_vehicles || []).map((el: IVehicle) => el.id);
    const newVehiclesId = (data.selectedVehicles || []).map((el: IVehicle) => el.id);
    const vehiclesIntersection = intersection(existedVehiclesId, newVehiclesId);
    const vehiclesToAdd = difference(newVehiclesId, vehiclesIntersection);
    const vehiclesToRemove = difference(existedVehiclesId, vehiclesIntersection);

    await Promise.all([
      Promise.all(vehiclesToAdd.map(el => OperationsService.assignVehicleToRun(run.id, el))),
      Promise.all(vehiclesToRemove.map(el => OperationsService.removeVehicleFromRun(run.id, el)))
    ]);

    EventBus.emit(EventBusEventName.VehicleAssignedToTask);
  };

  private renderFooter = () => {
    const {validFormDetails} = this.props;
    const disableSaveButton = !validFormDetails;

    return (
      <PrimaryButton className="btn" disabled={disableSaveButton} onClick={this.submitCombine}>
        Save
      </PrimaryButton>
    );
  };

  public render() {
    const {isOpen, title, onClose} = this.props;
    const {loading} = this.state;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          loading={loading}
          title={title || ''}
          body={this.renderBody()}
          footer={this.renderFooter()}
        />
      </Modal>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  validFormDetails: isValid(RunSettingsDetailsFormName)(state)
});

export default compose(connect(mapStateToProps))(ModalOperationsRunSettings);

import React from 'react';
import {Action, compose} from 'redux';
import {pickBy, isEqual, isEmpty} from 'lodash';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import UserService from 'src/services/UserService';
import {IUser, IUserRole} from 'src/models/IUser';
import UserForm from 'src/components/AppLayout/ManageLayout/User/UserForm';
import AddressService from 'src/services/AddressService';
import {ILocation} from 'src/models/IAddress';
import Notify, {NotifyType} from 'src/utility/Notify';
import {toUpdateUserStructure} from 'src/transformers/UserTranformer';
import {actionSetUser, loadLocations, selectCurrentUserId, updateCurrentUser} from 'src/redux/userDucks';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {IAppState} from 'src/redux';
import PageSizes from 'src/constants/PageSizes';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import LoadingLayout from './LoadingLayout';
import Permission from 'src/constants/Permission';
import {openModal} from 'src/redux/modalDucks';
import {IWithContextProps, withContext} from 'src/components/withContext';
import {IControlledRequest} from 'src/services/HttpService';
import {submissionErrorHandler} from 'src/services/ReduxFormHelper';
import {IPerson} from 'src/models/IPerson';

interface IRouteParams {
  id: string;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

export interface ISubmitData {
  primary_location?: ILocation;
  locations: ILocation[];
  add_location: number[];
  first_name: string;
  last_name: string;
  user_roles: IUserRole;
  password: string;
  contact: IPerson;
  working_hours_per_week: string;
  credit_note_approval_limit: string;
  purchase_order_approve_limit: string;
  invoice_approve_limit: string;
}

interface IUserDetailPageState {
  isLoading: boolean;
  isInitial: boolean;
  user?: IUser;
  allRoles: IUserRole[];
  userRoles: IUserRole[];
  allLocations: ILocation[];
}

interface IPropsFromStore {
  currentUserId: number | null;
}

interface ICheckDataTransferForm {
  formData: ISubmitData;
  resultDiff: {};
}

enum RequestName {
  user = 'user',
  userRoles = 'userRoles',
  allRoles = 'allRoles',
  allLocations = 'allLocations',
  addingRoles = 'addingRoles',
  removeRoles = 'removeRoles'
}

type TProps = RouteComponentProps<IRouteParams> & IConnectProps & IPropsFromStore & IWithContextProps<IUserContext>;

class UserDetailPage extends React.PureComponent<TProps, IUserDetailPageState> {
  public state: IUserDetailPageState = {
    isLoading: true,
    isInitial: true,
    user: undefined,
    userRoles: [],
    allLocations: [],
    allRoles: []
  };
  private activeRequestList: {[id: string]: AbortController} = {};
  public componentDidMount() {
    this.setState({isLoading: true});
    this.requestFormData()
      .then(this.setStateChained({isInitial: false, isLoading: false}))
      .catch(e => {
        // TODO take out abort handler
        if (e.name === 'AbortError') {
          return;
        }

        Notify(NotifyType.Warning, 'The form is not fully loaded');
        this.setState({isInitial: false, isLoading: false});
      });
  }

  public componentWillUnmount() {
    Object.keys(this.activeRequestList).forEach(key => {
      const controller = this.activeRequestList[key];
      if (controller) {
        controller.abort();
      }
    });
  }

  public componentDidUpdate(pProps: TProps, {user}: IUserDetailPageState) {
    if (user !== this.state.user) {
      this.updateUserInStore();
    }
  }

  private removeRequest = (reqName: string) => {
    if (this.activeRequestList[reqName]) {
      delete this.activeRequestList[reqName];
    }
  };

  private removeRequestChained = (reqName: string) => (data: any) => {
    this.removeRequest(reqName);
    return data;
  };

  private isAllow = (permission: Permission) => {
    return this.props.currentContext.has(permission);
  };

  private get isAllowDeleteUser(): boolean {
    return this.isAllow(Permission.USERS_DELETE);
  }

  private get isAllowUpdateUser(): boolean {
    return this.isAllow(Permission.USERS_UPDATE);
  }

  private setStateChained = (state: Partial<IUserDetailPageState>) => () => {
    this.setState(state as IUserDetailPageState);
    return Promise.resolve();
  };

  private requestFormData = async (): Promise<any> => {
    const {match} = this.props;
    this.activeRequestList = {};

    const requestList = [
      {fetch: UserService.getUserWithControl(match.params.id), stateName: RequestName.user},
      {fetch: UserService.getUserRoleWithControl(match.params.id), stateName: RequestName.userRoles},
      {fetch: UserService.getRolesWithControl(), stateName: RequestName.allRoles},
      {
        fetch: AddressService.getLocationsWithController({per_page: PageSizes.Huge}),
        stateName: RequestName.allLocations
      }
    ];

    const promiseList: Array<Promise<any>> = [];

    requestList.forEach(req => {
      promiseList.push(
        this.wrapControllerRequest(req.fetch, req.stateName).then(res =>
          this.setState({[req.stateName]: res.data} as any)
        )
      );
    });

    return Promise.all(promiseList);
  };

  private get isCurrentUser(): boolean {
    return +this.props.match.params.id === this.props.currentUserId;
  }

  private handleSave = (data: any) => {
    if (!this.isAllowUpdateUser) {
      return Notify(NotifyType.Warning, 'You have not permission for updating user');
    }

    this.setState({isLoading: true});
    return this.updateUserInfo(data)
      .then(this.checkAndUpdateRole(data))
      .then(this.requestFormData)
      .then(this.setStateChained({isLoading: false}))
      .catch(e => {
        if (e.name === 'AbortError') {
          return Promise.resolve();
        }
        this.setState({isLoading: false});
        return submissionErrorHandler(e);
      });
  };

  private extendRequestByLocation = ({
    formData,
    resultDiff
  }: ICheckDataTransferForm): Promise<ICheckDataTransferForm> => {
    const {primary_location, add_location} = formData;
    let result = {...resultDiff};

    if (
      primary_location &&
      !(
        primary_location.id === (this.primaryUserLocation && this.primaryUserLocation.id) &&
        isEqual(add_location, this.additionalUserLocations.map(l => l.id))
      )
    ) {
      result = {...resultDiff, locations: add_location, primary_location_id: primary_location!.id};
    }
    return Promise.resolve({formData, resultDiff: result});
  };

  private extendRequestByContact = ({
    formData,
    resultDiff
  }: ICheckDataTransferForm): Promise<ICheckDataTransferForm> => {
    const {contact} = formData;
    let result = {...resultDiff};
    if (!((contact && contact.id) === this.state.user!.contact_id)) {
      result = {...result, contact_id: contact.id || null};
    }
    return Promise.resolve({formData, resultDiff: result});
  };

  private extendRequestByPassword = ({
    formData,
    resultDiff
  }: ICheckDataTransferForm): Promise<ICheckDataTransferForm> => {
    const password = formData.password && formData.password.trim();
    let result = {...resultDiff};
    if (password) {
      result = {...result, password};
    }

    return Promise.resolve({formData, resultDiff: result});
  };

  private updateUserInfo = async (data: ISubmitData): Promise<any> => {
    const user = this.state.user!;
    const changedFields = pickBy(toUpdateUserStructure(data), (value, fieldName) => {
      return !isEqual(user[fieldName], value);
    });

    const {resultDiff: updatedFields} = await Promise.resolve({formData: data, resultDiff: changedFields})
      .then(this.extendRequestByLocation)
      .then(this.extendRequestByContact)
      .then(this.extendRequestByPassword);

    if (isEmpty(updatedFields)) {
      return Promise.resolve();
    }

    return UserService.updateUserData(+this.props.match.params.id, updatedFields);
  };

  private checkAndUpdateRole = (data: ISubmitData) => async (): Promise<any> => {
    const {userRoles} = this.state;
    const {
      match: {
        params: {id}
      }
    } = this.props;
    const prevRoleId = userRoles[0] && userRoles[0].id;
    const currentRoleId = data.user_roles && data.user_roles.id;
    if (currentRoleId === prevRoleId) {
      return Promise.resolve(data);
    }

    if (prevRoleId) {
      await this.wrapControllerRequest(UserService.removeRoleFromUserWC(id, [prevRoleId]), RequestName.removeRoles);
    }

    if (currentRoleId) {
      await this.wrapControllerRequest(UserService.addRoleToUserWC(id, [currentRoleId]), RequestName.addingRoles);
    }
  };

  private wrapControllerRequest(req: IControlledRequest, reqName: string): Promise<any> {
    const {promise, controller} = req;
    if (controller) {
      this.activeRequestList[reqName] = controller;
    }

    return promise.then(this.removeRequestChained(reqName));
  }

  private updateUserInStore = () => {
    const {dispatch} = this.props;
    const {user} = this.state;
    if (this.isCurrentUser && user) {
      dispatch(actionSetUser(user));
      dispatch(loadLocations());
    }
  };

  private handleDelete = async () => {
    if (!this.isAllowDeleteUser) {
      return Notify(NotifyType.Warning, 'You have not permission for deleting user');
    }

    const {
      history: {replace},
      match: {
        params: {id}
      },
      dispatch
    } = this.props;
    const approvedDelete = await dispatch(
      openModal('Confirm', `Are you sure to delete user ${this.state.user!.full_name || ''} ?`)
    );

    if (!approvedDelete) {
      return;
    }
    this.setState({isLoading: true});
    UserService.deleteUser(+id)
      .then(() => replace('/manage/user'))
      .catch(e => {
        this.setState({isLoading: false});
        Notify(NotifyType.Warning, 'User have not been deleted');
      });
  };

  private handleSetAvatar = (avatar: File) => {
    this.setState({isLoading: true});
    return UserService.setAvatar(avatar)
      .then(() => this.props.dispatch(updateCurrentUser()))
      .catch(e => Notify(NotifyType.Warning, 'Avatar have not been changed'))
      .finally(this.setStateChained({isLoading: false}));
  };

  private get primaryUserLocation(): ILocation | undefined {
    return this.state.user!.locations.find(this.filterUserLocation());
  }

  private get additionalUserLocations(): ILocation[] {
    return this.state.user!.locations.filter(this.filterUserLocation(false));
  }

  private filterUserLocation = (isPrimary: boolean = true) => (l: ILocation) => (isPrimary ? l.primary : !l.primary);

  private get formInitialValues() {
    const {user, userRoles} = this.state;
    return {
      ...user,
      primary_location: this.primaryUserLocation,
      add_location: this.additionalUserLocations.map(l => l.id),
      // TODO When backend come to single users role logic we need transform users role in the form from array to Obj
      user_roles: userRoles && userRoles[0]
    };
  }

  private renderForm() {
    const {allRoles, user, allLocations} = this.state;
    return (
      <UserForm
        onSubmit={this.handleSave}
        onDelete={this.handleDelete}
        isDisabledDeleting={!this.isAllowDeleteUser}
        isDisabledUpdating={!this.isAllowUpdateUser}
        changeAvatar={this.handleSetAvatar}
        initialValues={this.formInitialValues}
        user={user!}
        isCurrentUser={this.isCurrentUser}
        roleList={allRoles}
        locationList={allLocations}
      />
    );
  }
  public render() {
    const {isLoading, isInitial} = this.state;
    return (
      <React.Fragment>
        {isLoading && <LoadingLayout />}
        {!isInitial && this.renderForm()}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state: IAppState): IPropsFromStore {
  return {currentUserId: selectCurrentUserId(state)};
}

export default compose<React.ComponentClass>(
  withRouter,
  withContext(UserContext),
  connect(mapStateToProps)
)(UserDetailPage);

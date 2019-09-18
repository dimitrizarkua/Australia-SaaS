import HttpService, {withController} from './HttpService';
import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';
import {ICurrentUser, IMentionsUser, IUpUserForm, IUser, IUserRole, IUserSearch} from 'src/models/IUser';
import {ILocation} from 'src/models/IAddress';
import {orderBy} from 'lodash';
import {IUserNotification} from 'src/models/INotification';
import PageSizes from 'src/constants/PageSizes';
export type IUserSearchSuccess = IObjectEnvelope<IUserSearch[]>;
export type IUsersSuccess = IListEnvelope<IUser>;
export type IUserListSuccess = IListEnvelope<IUser[]>;
export type IUserSuccess = IObjectEnvelope<ICurrentUser>;
export type IMentionsUsersSuccess = IListEnvelope<IMentionsUser>;
export type IUserRolesSuccess = IListEnvelope<IUserRole>;
export type IUserNotificationsSuccess = IListEnvelope<IUserNotification>;
export type IUserLocationSuccess = IObjectEnvelope<ILocation[]>;

const getUser = async (id: number, params?: {}, fetchOptions?: {}): Promise<ICurrentUser> => {
  return await HttpService.get<ICurrentUser>(`/v1/users/${id}`, params, fetchOptions);
};

const getUserList = async (params: {} = {per_page: 35}, fetchOptions?: {}): Promise<IUsersSuccess> => {
  return await HttpService.get<IUsersSuccess>(`/v1/users`, params, fetchOptions);
};

const getUserRoles = (userId: number | string, fetchOptions?: {}) => {
  return HttpService.get<IUserRolesSuccess>(`/v1/users/${userId}/roles`, null, fetchOptions);
};

const searchUsers = async (
  params: {name?: string; ids?: string[]},
  fetchOptions?: {}
): Promise<IMentionsUsersSuccess> => {
  return await HttpService.get<IMentionsUsersSuccess>('/v1/users/search/mentions', params, fetchOptions);
};

const updateUserData = (id: number, data: Partial<IUpUserForm>): Promise<IUserSuccess> => {
  return HttpService.patch<IUserSuccess>(`/v1/users/${id}`, data);
};

const deleteUser = (id: number): Promise<any> => {
  return HttpService.remove<any>(`/v1/users/${id}`);
};

const setAvatar = async (data: any): Promise<any> => {
  const form = new FormData();
  form.append('file', data);
  return await HttpService.postFormData<any>('/v1/me/avatar', form);
};

const getMyUnreadNotifications = async (): Promise<IUserNotificationsSuccess> => {
  return await HttpService.get<IUserNotificationsSuccess>('/v1/me/notifications?per_page=10');
};

const removeAllNotifications = async () => {
  return await HttpService.remove('/v1/me/notifications');
};

const removeNotification = async (id: number) => {
  return await HttpService.remove(`/v1/me/notifications/${id}`);
};

const getRoles = (fetchOptions?: {}): Promise<IUserRolesSuccess> => {
  return HttpService.get<IUserRolesSuccess>('/v1/roles', null, fetchOptions);
};

const chainLocationToUser = (userId: number, locationId: number, isPrimary: boolean = false): Promise<any> => {
  return HttpService.post(`/v1/locations/${locationId}/users/${userId}`, {primary: isPrimary});
};

const unchainLocationToUser = (userId: number, locationId: number): Promise<any> => {
  return HttpService.remove(`/v1/locations/${locationId}/users/${userId}`);
};

const getLocations = async (): Promise<ILocation[]> => {
  const res = await HttpService.get<IUserLocationSuccess>('/v1/me/locations', {per_page: PageSizes.Huge});
  return orderBy(res.data, ['name'], ['asc']);
};

const addRoleToUser = (userId: number, roleIdList: number[], fetchOptions?: {}): Promise<any> => {
  return HttpService.post(`/v1/users/${userId}/roles`, {roles: roleIdList}, fetchOptions);
};

const removeRoleFromUser = (userId: number, roleIdList: number[], fetchOptions?: {}): Promise<any> => {
  return HttpService.remove(`/v1/users/${userId}/roles`, {roles: roleIdList}, fetchOptions);
};

const getUsersWithControl = withController(getUserList, 2);
const getSearchedUsers = withController(searchUsers, 2);
const getUserWithControl = withController(getUser, 3);
const getRolesWithControl = withController(getRoles, 1);
const getUserRoleWithControl = withController(getUserRoles, 2);
const removeRoleFromUserWC = withController(removeRoleFromUser, 3);
const addRoleToUserWC = withController(addRoleToUser, 3);

export default {
  getUsersWithControl,
  getSearchedUsers,
  getUserWithControl,
  getRolesWithControl,
  getUserRoleWithControl,
  removeRoleFromUserWC,
  addRoleToUserWC,
  searchUsers,
  getUser,
  getUserList,
  getUserRoles,
  getRoles,
  addRoleToUser,
  updateUserData,
  chainLocationToUser,
  unchainLocationToUser,
  setAvatar,
  deleteUser,
  getMyUnreadNotifications,
  removeNotification,
  removeAllNotifications,
  getLocations
};

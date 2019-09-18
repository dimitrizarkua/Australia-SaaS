import HttpService from 'src/services/HttpService';
import {IRun} from 'src/models/IRun';
import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';
import {IStaff} from 'src/models/IUser';

export interface IConfigForRunsSearch {
  location_id: number;
  date: string;
}

const getRuns = async (config: IConfigForRunsSearch): Promise<IRun[]> => {
  const res = await HttpService.get<IListEnvelope<IRun>>('/v1/operations/runs', config);

  return res.data;
};

export interface IConfigForRunCreate {
  location_id: number;
  date: string;
  name: string;
}

const createRun = async (config: IConfigForRunCreate): Promise<IRun> => {
  const res = await HttpService.post<IObjectEnvelope<IRun>>('/v1/operations/runs', config);

  return res.data;
};

const removeRun = async (runId: number): Promise<any> => {
  return await HttpService.remove<any>(`/v1/operations/runs/${runId}`);
};

const updateRun = async (runId: number, config: Partial<IRun>): Promise<IRun> => {
  const res = await HttpService.patch<IObjectEnvelope<IRun>>(`/v1/operations/runs/${runId}`, config);

  return res.data;
};

export interface IConfigForStaffSearch {
  location_id: number;
  date: string;
  name: string;
}

const searchStaff = async (config: IConfigForStaffSearch): Promise<IStaff[]> => {
  const res = await HttpService.get<IListEnvelope<IStaff>>('/v1/operations/staff/search', config);

  return res.data;
};

const getStaffList = async (config: Partial<IConfigForStaffSearch>): Promise<IStaff[]> => {
  const res = await HttpService.get<IListEnvelope<IStaff>>('/v1/operations/staff', config);

  return res.data;
};

const assignStaffToRun = async (runId: number, userId: number): Promise<any> => {
  return await HttpService.post<any>(`/v1/operations/runs/${runId}/crew/${userId}`);
};

const removeStaffFromRun = async (runId: number, userId: number): Promise<any> => {
  return await HttpService.remove<any>(`/v1/operations/runs/${runId}/crew/${userId}`);
};

const assignVehicleToRun = async (runId: number, vehicleId: number): Promise<any> => {
  return await HttpService.post<any>(`/v1/operations/runs/${runId}/vehicles/${vehicleId}`);
};

const removeVehicleFromRun = async (runId: number, vehicleId: number): Promise<any> => {
  return await HttpService.remove<any>(`/v1/operations/runs/${runId}/vehicles/${vehicleId}`);
};

export default {
  getRuns,
  createRun,
  removeRun,
  searchStaff,
  assignStaffToRun,
  removeStaffFromRun,
  updateRun,
  assignVehicleToRun,
  removeVehicleFromRun,
  getStaffList
};

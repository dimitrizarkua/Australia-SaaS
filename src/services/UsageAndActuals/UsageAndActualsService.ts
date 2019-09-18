import HttpService from 'src/services/HttpService';
import {IMaterial, IMeasureUnit} from 'src/models/UsageAndActualsModels/IMaterial';
import {IEquipment, IEquipmentInfo} from 'src/models/UsageAndActualsModels/IEquipment';
import AssessmentReportsService from 'src/services/UsageAndActuals/AssessmentReportsService';
import AllowanceService from 'src/services/UsageAndActuals/AllowanceService';
import LabourService from './LabourService';
import ReimbursementService from 'src/services/UsageAndActuals/ReimbursementService';
import LahaService from 'src/services/UsageAndActuals/LahaService';

const getAllMaterials = async (): Promise<IMaterial[]> => {
  const res = await HttpService.get<any>(`/v1/usage-and-actuals/materials`);
  return res.data;
};

const getAllMeasureUnits = async (): Promise<IMeasureUnit[]> => {
  const res = await HttpService.get<any>(`/v1/usage-and-actuals/measure-units`);
  return res.data;
};

const createNewMaterial = async (config: any): Promise<IMaterial> => {
  const res = await HttpService.post<any>(`/v1/usage-and-actuals/materials`, config);
  return res.data;
};

const searchMaterials = async (name: string): Promise<IMaterial[]> => {
  const res = await HttpService.get<any>(`/v1/usage-and-actuals/materials/search`, {name});
  return res.data;
};

const getAllEquipments = async (): Promise<IEquipment[]> => {
  const res = await HttpService.get<any>(`/v1/usage-and-actuals/equipment`);
  return res.data;
};

const createNewEquipment = async (config: any): Promise<IEquipment> => {
  const res = await HttpService.post<any>(`/v1/usage-and-actuals/equipment`, config);
  return res.data;
};

const searchEquipment = async (params: {}): Promise<IEquipment[]> => {
  const res = await HttpService.get<any>(`/v1/usage-and-actuals/equipment/search`, params);
  return res.data;
};

const getEquipmentInfo = async (equipmentId: number): Promise<IEquipmentInfo> => {
  const res = await HttpService.get<any>(`/v1/usage-and-actuals/equipment/${equipmentId}`);
  return res.data;
};

export default {
  ...AssessmentReportsService,
  ...AllowanceService,
  ...LabourService,
  ...ReimbursementService,
  ...LahaService,
  getAllMaterials,
  getAllMeasureUnits,
  createNewMaterial,
  searchMaterials,
  getAllEquipments,
  createNewEquipment,
  searchEquipment,
  getEquipmentInfo
};

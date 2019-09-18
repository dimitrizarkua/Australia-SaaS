import {createAsyncAction, reduxWrap, createSelectActionsCreators, createSelectionReducer} from 'src/redux/reduxWrap';
import {combineReducers} from 'redux';
import {IAllowance} from 'src/models/UsageAndActualsModels/IAllowance';
import JobService from 'src/services/JobService';
import {IJobUsageSummary} from 'src/models/UsageAndActualsModels/IJobSummary';
import {IEquipmentInfo} from 'src/models/UsageAndActualsModels/IEquipment';
import {IMaterialInfo} from 'src/models/UsageAndActualsModels/IMaterial';
import {IReimbursement} from 'src/models/UsageAndActualsModels/IReimbursement';
import {ILaha} from 'src/models/UsageAndActualsModels/ILaha';
import {ILabour} from 'src/models/UsageAndActualsModels/ILabour';
import {IJobCostingCounters} from 'src/models/UsageAndActualsModels/IJobCostingCounters';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';

function getReducerStates(entityName: string) {
  return {
    load: `Steamatic/Job/${entityName}/LOAD`,
    loadComplete: `Steamatic/Job/${entityName}/LOAD_COMPLETE`,
    reset: `Steamatic/Job/${entityName}/RESET`,
    error: `Steamatic/Job/${entityName}/ERROR`
  };
}

export interface IUsageAndActualsState {
  summary: IJobUsageSummary;
  equipments: IEquipmentInfo[];
  materials: IMaterialInfo[];
  labourAllowances: IAllowance[];
  labourReimbursements: IReimbursement[];
  costingCounters: IJobCostingCounters;
  labourLahas: ILaha[];
  labours: ILabour[];
  selectedLabourIds: Array<number | string>;
}

const summaryStates = getReducerStates('Costings');
const summaryReducer = reduxWrap<IJobUsageSummary>({
  load: summaryStates.load,
  loadComplete: summaryStates.loadComplete,
  reset: summaryStates.reset,
  error: summaryStates.error
});

const allowanceStates = getReducerStates('Allowances');
const allowanceReducer = reduxWrap<IAllowance[]>({
  load: allowanceStates.load,
  loadComplete: allowanceStates.loadComplete,
  reset: allowanceStates.reset,
  error: allowanceStates.error
});

const equipmentStates = getReducerStates('Equipments');
const equipmentReducer = reduxWrap<IEquipmentInfo[]>({
  load: equipmentStates.load,
  loadComplete: equipmentStates.loadComplete,
  reset: equipmentStates.reset,
  error: equipmentStates.error
});

const materialStates = getReducerStates('Materials');
const materialReducer = reduxWrap<IMaterialInfo[]>({
  load: materialStates.load,
  loadComplete: materialStates.loadComplete,
  reset: materialStates.reset,
  error: materialStates.error
});

const reimbursementStates = getReducerStates('Reimbursements');
const reimbursementReducer = reduxWrap<IReimbursement[]>({
  load: reimbursementStates.load,
  loadComplete: reimbursementStates.loadComplete,
  reset: reimbursementStates.reset,
  error: reimbursementStates.error
});

const lahaStates = getReducerStates('Lahas');
const lahaReducer = reduxWrap<ILaha[]>({
  load: lahaStates.load,
  loadComplete: lahaStates.loadComplete,
  reset: lahaStates.reset,
  error: lahaStates.error
});

const labourStates = getReducerStates('Labours');
const TOGGLE_LABOUR = 'Steamatic/Job/Labour/TOGGLE_LABOUR';
const RESET_SELECTED_LABOUR = 'Steamatic/Job/Labour/RESET_SELECTED_LABOUR';
const MASS_SELECT_LABOUR = 'Steamatic/Job/Labour/MASS_SELECT_LABOUR';
const selectReducerConfig = {
  toggle: TOGGLE_LABOUR,
  resetSelected: RESET_SELECTED_LABOUR,
  massSelect: MASS_SELECT_LABOUR
};
const labourReducer = reduxWrap<ILabour[]>({
  load: labourStates.load,
  loadComplete: labourStates.loadComplete,
  reset: labourStates.reset,
  error: labourStates.error
});

const costingStates = getReducerStates('CostingCounters');
const costingCounterReducer = reduxWrap<IReimbursement[]>({
  load: costingStates.load,
  loadComplete: costingStates.loadComplete,
  reset: costingStates.reset,
  error: costingStates.error
});

export const loadJobUsageSummary = (jobId: number) => {
  return createAsyncAction(summaryStates.load, summaryStates.loadComplete, summaryStates.error, () =>
    JobService.getJobUsageSummary(jobId)
  );
};

export const loadJobEquipments = (jobId: number) => {
  return createAsyncAction(equipmentStates.load, equipmentStates.loadComplete, equipmentStates.error, () =>
    JobService.getJobEquipments(jobId)
  );
};

export const loadJobMaterials = (jobId: number) => {
  return createAsyncAction(materialStates.load, materialStates.loadComplete, materialStates.error, () =>
    JobService.getJobMaterials(jobId)
  );
};

export const loadJobAllowances = (jobId: number, page?: number) => {
  return createAsyncAction(allowanceStates.load, allowanceStates.loadComplete, allowanceStates.error, () =>
    UsageAndActualsService.getJobAllowances(jobId, {page})
  );
};

export const loadJobReimbursements = (jobId: number, page?: number) => {
  return createAsyncAction(reimbursementStates.load, reimbursementStates.loadComplete, reimbursementStates.error, () =>
    UsageAndActualsService.getJobReimbursements(jobId, {page})
  );
};

export const loadJobCostingCounters = (jobId: number) => {
  return createAsyncAction(costingStates.load, costingStates.loadComplete, costingStates.error, () =>
    JobService.getJobCostingCounters(jobId)
  );
};

export const loadJobLahas = (jobId: number, page?: number) => {
  return createAsyncAction(lahaStates.load, lahaStates.loadComplete, lahaStates.error, () =>
    UsageAndActualsService.getJobLahas(jobId, {page})
  );
};

export const loadJobLabours = (jobId: number, page?: number) => {
  return createAsyncAction(labourStates.load, labourStates.loadComplete, labourStates.error, () =>
    UsageAndActualsService.getJobLabours(jobId, {page})
  );
};

const selectionActionCreators = createSelectActionsCreators(selectReducerConfig);
const labourSelectedReducer = createSelectionReducer(selectReducerConfig);

export const resetSelection = selectionActionCreators.resetSelected;
export const toggleSelection = (item: ILabour) => selectionActionCreators.toggle(item.id);
export const massSelect = (items: ILabour[]) => {
  return selectionActionCreators.massSelect(items.map(p => p.id));
};

export default combineReducers({
  summary: summaryReducer,
  equipments: equipmentReducer,
  materials: materialReducer,
  labourAllowances: allowanceReducer,
  labourReimbursements: reimbursementReducer,
  labours: labourReducer,
  costingCounters: costingCounterReducer,
  labourLahas: lahaReducer,
  selectedLabourIds: labourSelectedReducer
});

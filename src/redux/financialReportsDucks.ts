import {combineReducers} from 'redux';
import {createAsyncAction, IReduxWrapConfig, IReturnType, reduxWrap} from './reduxWrap';
import FinancialReportsService from 'src/services/FinancialReportsService';
import {
  IFinancialVolume,
  IFinancialReportParams,
  IFinancialRevenue,
  IFinancialAccReceivable
} from 'src/models/ReportModels/IFinancialReports';
import {IAppState} from './index';

const FINANCE_STORE_KEY = 'Steamatic/FinancialReports/';

enum FinanceReportType {
  revenue = 'revenue',
  volume = 'volume',
  accounts_receivables = 'accounts_receivables'
}

enum ActionTypes {
  load = 'load',
  loadComplete = 'loadComplete',
  reset = 'reset',
  error = 'error'
}

export type IFinReportVolumeState = IReturnType<IFinancialVolume>;
export type IFinReportRevenueState = IReturnType<IFinancialRevenue>;
export type IFinAccReceivableState = IReturnType<IFinancialAccReceivable>;

export interface IFinanceReportState {
  [FinanceReportType.revenue]: IFinReportRevenueState;
  [FinanceReportType.accounts_receivables]: IFinAccReceivableState;
  [FinanceReportType.volume]: IFinReportVolumeState;
}

function getActionTypeForEntity(finReportEntity: FinanceReportType, actionType: ActionTypes) {
  return `${FINANCE_STORE_KEY}${finReportEntity}/${actionType}`;
}

const fullActionTypes = [ActionTypes.load, ActionTypes.loadComplete, ActionTypes.reset, ActionTypes.error];

function configForFinReportEntity(finReportEntity: FinanceReportType, actionList: ActionTypes[] = fullActionTypes) {
  return actionList.reduce((res, type) => ({...res, [type]: getActionTypeForEntity(finReportEntity, type)}), {});
}

export const FinReportReducer = combineReducers({
  [FinanceReportType.revenue]: reduxWrap(configForFinReportEntity(FinanceReportType.revenue) as IReduxWrapConfig),
  [FinanceReportType.accounts_receivables]: reduxWrap(configForFinReportEntity(
    FinanceReportType.accounts_receivables
  ) as IReduxWrapConfig),
  [FinanceReportType.volume]: reduxWrap(configForFinReportEntity(FinanceReportType.volume) as IReduxWrapConfig)
});

const volumeActionTypes = configForFinReportEntity(FinanceReportType.volume, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

export const getVolume = (params: IFinancialReportParams) =>
  createAsyncAction(
    volumeActionTypes[ActionTypes.load],
    volumeActionTypes[ActionTypes.loadComplete],
    volumeActionTypes[ActionTypes.error],
    () => FinancialReportsService.getVolume(params)
  );

const revenueActionTypes = configForFinReportEntity(FinanceReportType.revenue, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

export const getRevenue = (params: IFinancialReportParams) =>
  createAsyncAction(
    revenueActionTypes[ActionTypes.load],
    revenueActionTypes[ActionTypes.loadComplete],
    revenueActionTypes[ActionTypes.error],
    () => FinancialReportsService.getRevenue(params)
  );

const accReceivableActionTypes = configForFinReportEntity(FinanceReportType.accounts_receivables, [
  ActionTypes.load,
  ActionTypes.loadComplete,
  ActionTypes.error
]);

export const getAccReceivable = (params: IFinancialReportParams) =>
  createAsyncAction(
    accReceivableActionTypes[ActionTypes.load],
    accReceivableActionTypes[ActionTypes.loadComplete],
    accReceivableActionTypes[ActionTypes.error],
    () => FinancialReportsService.gerAccountsReceivable(params)
  );

function selectEntity(state: IAppState, finEntity: FinanceReportType) {
  return state.financialReport[finEntity];
}

export function selectVolume(state: IAppState) {
  return selectEntity(state, FinanceReportType.volume);
}

export function selectRevenue(state: IAppState) {
  return selectEntity(state, FinanceReportType.revenue);
}

export function selectAccReceive(state: IAppState) {
  return selectEntity(state, FinanceReportType.accounts_receivables);
}

import {Dispatch, Reducer, Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import FinanceService from 'src/services/FinanceService';
import {IGLAccount, IGSCode, ITaxRate, IAccountingOrganization} from 'src/models/IFinance';
import {IAppState} from './index';
import {IHttpError} from 'src/models/IHttpError';

const LOAD_COMPLETE = 'Steamatic/Finance/LOAD_COMPLETE';
const ERROR = 'Steamatic/Finance/ERROR';
const RESET_ENTITY = 'Steamatic/Finance/RESET_ENTITY';

enum CommonEntities {
  accountingOrganizations = 'accountingOrganizations',
  glAccounts = 'glAccounts',
  glAccountsForUser = 'glAccountsForUser',
  taxRates = 'taxRates',
  gsCodes = 'gsCodes'
}

export interface IFinanceState {
  [CommonEntities.accountingOrganizations]: IAccountingOrganization[];
  [CommonEntities.glAccounts]: IGLAccount[];
  [CommonEntities.taxRates]: ITaxRate[];
  [CommonEntities.gsCodes]: IGSCode[];
  error: IHttpError | null;
}

const defaultState = {
  [CommonEntities.accountingOrganizations]: [],
  [CommonEntities.glAccounts]: [],
  [CommonEntities.taxRates]: [],
  [CommonEntities.gsCodes]: [],
  error: null
};

const reducer: Reducer<IFinanceState> = (state = defaultState, action = {type: null}) => {
  switch (action.type) {
    case LOAD_COMPLETE:
      return {...state, ...action.payload};
    case ERROR:
      return {...state, error: action.payload};
    case RESET_ENTITY:
      return {...state, [action.payload]: []};
    default:
      return state;
  }
};

export default reducer;

const resetEntity = (entityName: CommonEntities) => ({
  type: RESET_ENTITY,
  payload: entityName
});

const loadComplete = (entityName: CommonEntities, entity: any) => ({
  type: LOAD_COMPLETE,
  payload: {[entityName]: entity}
});

const error = (e: IHttpError) => ({
  type: ERROR,
  payload: e
});

export const loadAndDispatchEntity = async (
  dispatch: Dispatch,
  entityName: CommonEntities,
  loadingMethod: (params?: any) => Promise<any>
) => {
  try {
    dispatch(resetEntity(entityName));
    const res = await loadingMethod();
    dispatch(loadComplete(entityName, res));
  } catch (e) {
    dispatch(error(e));
    throw e;
  }
};

export const loadGLAccounts = (accOrgId: number) => {
  return async (dispatch: Dispatch) => {
    loadAndDispatchEntity(dispatch, CommonEntities.glAccounts, () => FinanceService.getGLAccounts(accOrgId));
  };
};

export const loadGLAccountsForLocations = (locations: number[]) => {
  return async (dispatch: Dispatch) => {
    loadAndDispatchEntity(dispatch, CommonEntities.glAccounts, async () => {
      try {
        return await FinanceService.searchGLAccounts({locations});
      } catch (e) {
        return Promise.resolve([]);
      }
    });
  };
};

export const loadGLAccountsForCurrentUser = () => {
  return async (dispatch: Dispatch | ThunkDispatch<any, any, Action>, getState: () => IAppState) => {
    const locations = getState().user.locations;
    const locationIds = locations.map(l => l.id);
    if (locationIds.length) {
      return (dispatch as ThunkDispatch<any, any, Action>)(loadGLAccountsForLocations(locationIds));
    } else {
      return Promise.resolve([]);
    }
  };
};

export const loadFinanceEnums = () => {
  return async (dispatch: Dispatch) => {
    loadAndDispatchEntity(dispatch, CommonEntities.accountingOrganizations, FinanceService.getAccountingOrganizations);
    loadAndDispatchEntity(dispatch, CommonEntities.taxRates, FinanceService.getTaxRates);
    loadAndDispatchEntity(dispatch, CommonEntities.gsCodes, FinanceService.getGSCodes);
  };
};

export function selectGlAccounts(state: IAppState): IGLAccount[] {
  return state.finance[CommonEntities.glAccounts];
}

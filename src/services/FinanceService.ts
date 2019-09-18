import HttpService from './HttpService';
import {IListEnvelope, IObjectEnvelope} from 'src/models/IEnvelope';
import {IAccountingOrganization, IGLAccount, IGSCode, ITaxRate} from 'src/models/IFinance';
import PageSizes from 'src/constants/PageSizes';
import Permission from 'src/constants/Permission';
import {IUserContext} from 'src/components/AppLayout/UserContext';
import {IFinanceEntity} from 'src/models/FinanceModels/ICommonFinance';
import {FinanceEntityStatus} from 'src/constants/FinanceEntityStatus';
const getGLAccounts = async (accOrgId: number): Promise<IGLAccount[]> => {
  const res = await HttpService.get<IListEnvelope<any>>(`/v1/finance/accounting-organizations/${accOrgId}/gl-accounts`);
  return res.data;
};

const getAccountingOrganizations = async (): Promise<IAccountingOrganization[]> => {
  const res = await HttpService.get<IListEnvelope<IAccountingOrganization>>('/v1/finance/accounting-organizations', {
    per_page: PageSizes.Huge
  });
  return res.data;
};

const getAccountingOrganizationsForLocation = async (locationId: number): Promise<IAccountingOrganization> => {
  const res = await HttpService.get<IObjectEnvelope<IAccountingOrganization>>(
    `/locations/${locationId}/accounting-organization`
  );
  return res.data;
};

const getTaxRates = async (): Promise<ITaxRate[]> => {
  const res = await HttpService.get<IListEnvelope<any>>('/v1/finance/tax-rates', {per_page: PageSizes.Huge});
  return res.data;
};

const getGSCodes = async (): Promise<IGSCode[]> => {
  const res = await HttpService.get<IListEnvelope<any>>('/v1/finance/gs-codes', {per_page: PageSizes.Huge});
  return res.data;
};

const searchGLAccounts = async (params: {}): Promise<IGLAccount[]> => {
  const res = await HttpService.get<IListEnvelope<any>>('/v1/finance/gl-accounts/search', params);
  return res.data;
};

const isEditable = (
  managePermission: Permission,
  manageLockedPermission: Permission,
  entity: Partial<IFinanceEntity>,
  context: IUserContext
) => {
  const status = entity.latest_status ? entity.latest_status.status : FinanceEntityStatus.draft;
  const isDraft = status === FinanceEntityStatus.draft;
  const isLocked = !!entity.locked_at;
  return context.has(managePermission) && isDraft && (!isLocked || context.has(manageLockedPermission));
};

const getGLAccountLabel = (o: IGLAccount) => `${o.name}${o.code ? `: ${o.code}` : ''}`;

export default {
  getAccountingOrganizations,
  getAccountingOrganizationsForLocation,
  getGLAccounts,
  searchGLAccounts,
  getTaxRates,
  getGSCodes,
  isEditable,
  getGLAccountLabel
};

import {combineReducers} from 'redux';
import {reducer as formReducer} from 'redux-form';
import userReducer, {IUserState} from './userDucks';
import jobsInfoReducer from './jobsInfo';
import contactsReducer, {IContacts} from './contactsDucks';
import jobNotesAndRepliesReducer, {INotesAndRepliesState} from './notesAndReplies';
import currentJobReducer, {ICurrentJob} from './currentJob/currentJobDucks';
import modalReducer, {IReduxModal} from './modalDucks';
import editedReplyReducer, {IEditedReplyState} from './editedReply';
import {IJobsInfo} from 'src/models/IJobsInfo';
import currentJobPhotosReducer, {ICurrentJobPhotos} from './currentJob/currentJobPhotosDucks';
import currentJobSurveyReducer, {ISurveyState} from './currentJob/currentJobSurvey';
import currentJobContactsReducer from './currentJob/currentJobContactsDucks';
import invoicesReducer from './invoicesDucks';
import invoiceReducer, {IInvoiceState} from './invoiceDucks';
import invoicesInfoReducer from './invoicesInfo';
import {IInvoicesSuccess} from 'src/services/InvoicesService';
import {IPurchaseOrdersInfoSuccess, IPurchaseOrdersSuccess} from 'src/services/PurchaseOrdersService';
import {ICreditNote} from 'src/models/FinanceModels/ICreditNotes';
import creditNotesListReducer from './creditNotesDucks';
import creditNotesInfoReducer from './creditNotesInfo';
import creditNoteReducer from './creditNoteDucks';
import {ICreditNotesInfoSuccess, ICreditNotesSuccess} from 'src/services/CreditNotesService';
import {IPurchaseOrder} from 'src/models/FinanceModels/IPurchaseOrders';
import {purchaseOrdersInfoReducer, purchaseOrdersListReducer} from './purchaseOrdersDucks';
import purchaseOrderReducer from './purchaseOrderDucks';
import financeReducer, {IFinanceState} from './financeDucks';
import forwardPaymentsReducer, {InvoicePaymentsStateType} from './forwardPaymentsDucks';
import {forwardedPaymentsInfoReducer, forwardedPaymentsReducer} from './forwardPaymentsReceivedDucks';
import receivePaymentsReducer, {ReceivePaymentsStateType} from './receivePaymentsDucks';
import {IReturnType} from './reduxWrap';
import {IAccountTransactionsListSuccess} from 'src/services/AccountTransactionService';
import accountTransactionReducer from './accountTransactionDucks';
import {IRun} from 'src/models/IRun';
import {searchRunsListReducer} from 'src/redux/operationsDucks';
import constantsReducer, {IConstants} from 'src/redux/contacts/constantsDucks';
import {IMaterial, IMaterialInfo, IMeasureUnit} from 'src/models/UsageAndActualsModels/IMaterial';
import materialsReducer from 'src/redux/materialsDucks';
import measureUnitsReducer from 'src/redux/measureUnitsDucks';
import {IContactAssignment} from 'src/models/IJob';
import contactsStatusesReducer, {IContactStatusesRedux} from 'src/redux/contacts/contactsStatusesDucks';
import {IInvoicePaymentSuccess} from 'src/services/InvoicePaymentService';
import invoicePaymentReducer from './invoicePaymentDucks';
import {IEquipmentInfo, IEquipment} from 'src/models/UsageAndActualsModels/IEquipment';
import eqipmentsReducer from 'src/redux/equipmentDucks';
import {FinReportReducer, IFinanceReportState} from './financialReportsDucks';
import {IInvoicesListInfo} from 'src/models/FinanceModels/IInvoices';
import countriesReducer, {CountriesStateType} from './contacts/countriesReducer';
import statesReducer, {StatesStateType} from './contacts/statesReducer';
import {ITrialBalanceSuccess} from 'src/services/TrialBalanceService';
import trialBalanceReducer from './trialBalanceDucks';
import {IGstSummarySuccess} from 'src/services/GstSummaryService';
import gstSummaryReducer from './gstSummaryDucks';
import jobTagsReducer, {JobTagsState} from './jobTagsDucks';
import assessmentReportsDucks, {IAssessmentReportsStore} from 'src/redux/assessmentReports/assessmentReportsDucks';
import currentJobUsageAndActualsReducer, {IUsageAndActualsState} from 'src/redux/currentJob/currentJobUsageAndActuals';
import {IUserRole} from 'src/models/IUser';
import {userRolesReducer} from 'src/redux/userRolesDucks';

export interface IAppState {
  readonly form: unknown;
  readonly user: IUserState;
  readonly contacts: IContacts;
  readonly jobsInfo: IJobsInfo;
  readonly notesAndReplies: INotesAndRepliesState;
  readonly editedReply: IEditedReplyState;
  readonly currentJob: ICurrentJob;
  readonly currentJobPhotos: ICurrentJobPhotos;
  readonly currentJobSurvey: ISurveyState;
  readonly currentJobContacts: IReturnType<IContactAssignment[]>;
  readonly invoices: IReturnType<IInvoicesSuccess>;
  readonly invoice: IInvoiceState;
  readonly invoicesInfo: IReturnType<IInvoicesListInfo>;
  readonly purchaseOrdersInfo: IReturnType<IPurchaseOrdersInfoSuccess>;
  readonly purchaseOrders: IReturnType<IPurchaseOrdersSuccess>;
  readonly purchaseOrder: IReturnType<IPurchaseOrder>;
  readonly creditNotesInfo: IReturnType<ICreditNotesInfoSuccess>;
  readonly creditNotes: IReturnType<ICreditNotesSuccess>;
  readonly creditNote: IReturnType<ICreditNote>;
  readonly modal: IReduxModal;
  readonly finance: IFinanceState;
  readonly accountTransactions: IReturnType<IAccountTransactionsListSuccess>;
  readonly forwardPayments: InvoicePaymentsStateType;
  readonly forwardPaymentsReceived: IReturnType<any>;
  readonly forwardPaymentsReceivedInfo: IReturnType<any>;
  readonly receivePayments: ReceivePaymentsStateType;
  readonly runsFromLocation: IReturnType<IRun[]>;
  readonly constants: IConstants;
  readonly currentJobMaterials: IReturnType<IMaterialInfo[]>;
  readonly materials: IReturnType<IMaterial[]>;
  readonly measureUnits: IReturnType<IMeasureUnit[]>;
  readonly contactStatuses: IContactStatusesRedux;
  readonly invoicePayments: IReturnType<IInvoicePaymentSuccess>;
  readonly financialReport: IFinanceReportState;
  readonly currentJobEquipments: IReturnType<IEquipmentInfo[]>;
  readonly equipments: IReturnType<IEquipment[]>;
  readonly allCountries: CountriesStateType;
  readonly allStates: StatesStateType;
  readonly trialBalance: IReturnType<ITrialBalanceSuccess>;
  readonly gstSummary: IReturnType<IGstSummarySuccess>;
  readonly jobTags: JobTagsState;
  readonly assessmentReports: IAssessmentReportsStore;
  readonly currentJobUsageAndActuals: IUsageAndActualsState;
  readonly userRoles: IReturnType<IUserRole[]>;
}

export default combineReducers({
  form: formReducer,
  user: userReducer,
  jobsInfo: jobsInfoReducer,
  contacts: contactsReducer,
  notesAndReplies: jobNotesAndRepliesReducer,
  editedReply: editedReplyReducer,
  currentJob: currentJobReducer,
  currentJobPhotos: currentJobPhotosReducer,
  currentJobSurvey: currentJobSurveyReducer,
  currentJobContacts: currentJobContactsReducer,
  invoices: invoicesReducer,
  invoice: invoiceReducer,
  invoicesInfo: invoicesInfoReducer,
  purchaseOrdersInfo: purchaseOrdersInfoReducer,
  purchaseOrders: purchaseOrdersListReducer,
  purchaseOrder: purchaseOrderReducer,
  creditNotesInfo: creditNotesInfoReducer,
  creditNotes: creditNotesListReducer,
  creditNote: creditNoteReducer,
  modal: modalReducer,
  forwardPayments: forwardPaymentsReducer,
  forwardPaymentsReceived: forwardedPaymentsReducer,
  forwardPaymentsReceivedInfo: forwardedPaymentsInfoReducer,
  receivePayments: receivePaymentsReducer,
  finance: financeReducer,
  accountTransactions: accountTransactionReducer,
  runsFromLocation: searchRunsListReducer,
  constants: constantsReducer,
  invoicePayments: invoicePaymentReducer,
  materials: materialsReducer,
  measureUnits: measureUnitsReducer,
  contactStatuses: contactsStatusesReducer,
  financialReport: FinReportReducer,
  eqipments: eqipmentsReducer,
  allCountries: countriesReducer,
  allStates: statesReducer,
  trialBalance: trialBalanceReducer,
  gstSummary: gstSummaryReducer,
  jobTags: jobTagsReducer,
  assessmentReports: assessmentReportsDucks,
  currentJobUsageAndActuals: currentJobUsageAndActualsReducer,
  userRoles: userRolesReducer
});

import 'react-toastify/dist/ReactToastify.css';

import {compact} from 'lodash';
import * as React from 'react';
import {matchPath, Redirect, RouteComponentProps, Switch, withRouter} from 'react-router-dom';
import JobsLayout from './JobsLayout/JobsListLayout/JobsLayout';
import ContactsLayout from './ContactsLayout/ContactsLayout';
import styled from 'styled-components';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import AppRoute, {IAppRouteProps} from '../AppRoute';
import JobLayout from './JobsLayout/JobLayout/JobLayout';
import {Route} from 'react-router';
import TopNavbar, {IRoute} from './TopNavbar/TopNavbar';
import {Slide, ToastContainer} from 'react-toastify';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {closeModal, IReduxModal} from 'src/redux/modalDucks';
import Confirm from '../Modal/Common/Confirm';
import {ThunkDispatch} from 'redux-thunk';
import ReactTooltip from 'react-tooltip';
import {IUserState, loadLocations} from 'src/redux/userDucks';
import {ConnectToUserPrivateChannel} from 'src/utility/BrowserNotification';
import Icon, {IconName} from 'src/components/Icon/Icon';
import Permission, {PermissionsGroupManage} from 'src/constants/Permission';
import UserContext, {IUserContext} from './UserContext';
import UnauthorizedPage from '../UnauthorizedPage/UnauthorizedPage';
import InvoicesPage from './FinanceLayout/Invoices/InvoicesPage';
import InvoiceDetailsPage from './FinanceLayout/Invoices/InvoiceDetailsPage';
import PurchaseOrdersPage from './FinanceLayout/PurchaseOrders/PurchaseOrdersPage';
import PurchaseOrderDetailsPage from './FinanceLayout/PurchaseOrders/PurchaseOrderDetailsPage';
import CreditNotesPage from './FinanceLayout/CreditNotes/CreditNotesPage';
import CreditNoteDetailsPage from './FinanceLayout/CreditNotes/CreditNoteDetailsPage';
import ReceivePaymentPage from './FinanceLayout/PaymentPages/ReceivePaymentPage';
import ForwardPaymentsNewPage from './FinanceLayout/PaymentPages/ForwardPaymentsNewPage';
import ForwardPaymentsReceivedPage from './FinanceLayout/PaymentPages/ForwardPaymentsReceivedPage';
import ReimbursementsPage from './FinanceLayout/ReimbursementsPage';
import TimesheetPayrollPage from './FinanceLayout/TimesheetPayrollPage';
import AccountTransactionsPage from './ReportsLayout/AccountTransactions/AccountTransactionsPage';
import AgedReceivablesSummaryPage from './ReportsLayout/AgedReceivablesSummaryPage';
import AgedReceivablesDetailedPage from './ReportsLayout/AgedReceivablesDetailedPage';
import IncomeByAccountSummaryPage from './ReportsLayout/IncomeByAccountSummaryPage';
import IncomeByAccountDetailedPage from './ReportsLayout/IncomeByAccountDetailedPage';
import GSTSummaryPage from './ReportsLayout/GSTSummary/GSTSummaryPage';
import StatementByContactSummaryPage from './ReportsLayout/StatementByContactSummaryPage';
import InvoicePaymentsPage from './ReportsLayout/InvoicePayment/InvoicePaymentsPage';
import {loadFinanceEnums} from 'src/redux/financeDucks';
import {loadJobTags} from 'src/redux/jobTagsDucks';
import SchedulePage from 'src/components/AppLayout/OperationsLayout/Schedule/SchedulePage';
import {loadConstants} from 'src/redux/contacts/constantsDucks';
import {loadContactStatuses} from 'src/redux/contacts/contactsStatusesDucks';
import {loadAllCountries} from 'src/redux/contacts/countriesReducer';
import {loadAllStates} from 'src/redux/contacts/statesReducer';
import UsageAndActualsRouting from './UsageAndActualsLayout/UsageAndActualsRouting';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ManageLayout from './ManageLayout';
import TrialBalancePage from './ReportsLayout/TrialBalance/TrialBalancePage';
import {FinanceReport} from './ReportsLayout/FinancialReports';
import {SidebarContextWrap} from './SidebarContextWrap';

interface IConnectProps {
  modal: IReduxModal;
  user: IUserState;
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = RouteComponentProps<{}> & IAppRouteProps & IConnectProps;

const Body = styled.div`
  padding-top: 55px;
  height: 100%;
  width: 100%;
`;

class AppLayout extends React.PureComponent<IProps> {
  private readonly userContext: IUserContext;

  constructor(props: IProps) {
    super(props);

    this.userContext = {
      has: this.has
    };
  }

  public componentDidMount() {
    const {user, dispatch, history} = this.props;
    dispatch(loadConstants());
    dispatch(loadFinanceEnums());
    dispatch(loadLocations());
    dispatch(loadContactStatuses());
    dispatch(loadAllCountries());
    dispatch(loadAllStates());
    dispatch(loadJobTags());

    if (user && user.me) {
      ConnectToUserPrivateChannel(user.me.id, history);
    }
  }

  private has = (permission: Permission) => {
    const {user} = this.props;
    return !!(user.me && user.me.permissions.has(permission));
  };

  private computeManagePermission = (allowFn: (a: Permission) => boolean): boolean => {
    return PermissionsGroupManage.some(permission => allowFn(permission));
  };

  private getRoutes(): IRoute[] {
    const financeItems = [
      [
        {path: '/finance/invoices/draft', name: 'Invoices'},
        {path: '/finance/purchase-orders/draft', name: 'Purchase Orders'},
        {path: '/finance/credit-notes/draft', name: 'Credit Notes'}
      ],
      [
        {path: '/finance/receive-payment', name: 'Receive a Payment'},
        {path: '/finance/forward-invoice-payments/new', name: 'Forward Invoice Payments'}
      ],
      [
        {path: '/finance/reimbursements', name: 'Reimbursements'},
        {path: '/finance/timesheet-payroll', name: 'Timesheet Payroll'}
      ]
    ];
    const operationsItems = [
      [{path: '/operations/schedule/jobs', name: 'Schedule'}],
      [{path: '/operations/warehouse/incoming', name: 'Warehouse'}]
    ];
    const reportsItems = [
      [{path: '/reports/account-transactions', name: 'Account Transactions'}],
      [
        {path: '/reports/aged-receivables-summary', name: 'Aged Receivables Summary'},
        {path: '/reports/aged-receivables-detailed', name: 'Aged Receivables Detailed'}
      ],
      [
        {path: '/reports/income-by-account-summary', name: 'Income by Account Summary'},
        {path: '/reports/income-by-account-detailed', name: 'Income by Account Detailed'}
      ],
      [{path: '/reports/gst-summary', name: 'GST Summary'}],
      [{path: '/reports/statement-by-contact-summary', name: 'Statement by Contact Summary'}],
      [{path: '/reports/invoice-payments', name: 'Invoice Payments'}],
      [{path: '/reports/financial-report/volume', name: 'Financial Report'}],
      [{path: '/reports/trial-balance', name: 'Trial Balance'}]
    ];
    return compact([
      this.has(Permission.JOBS_VIEW) && {path: '/jobs', name: 'Jobs', isActive: this.isJobsActive},
      this.has(Permission.CONTACTS_VIEW) && {path: '/contacts', name: 'Contacts'},
      {path: '/finance', name: 'Finance', items: financeItems},
      {path: '/operations', name: 'Operations', items: operationsItems},
      {path: '/reports', name: 'Reports', items: reportsItems},
      this.computeManagePermission(this.has) && {path: '/manage', name: 'Manage'}
    ]);
  }

  private isJobsActive = () => {
    return ['/jobs', '/job/:id', '/usage-and-actuals/:id'].some(
      path => !!matchPath(this.props.location.pathname, {path})
    );
  };

  public render() {
    const {
      modal: {
        confirm: {active, hash, title, body}
      },
      dispatch
    } = this.props;

    return (
      <UserContext.Provider value={this.userContext}>
        <div className="h-100">
          <ReactTooltip className="overlapping" effect="solid" html={true} />
          {active && (
            <Confirm
              isOpen={active}
              hash={hash}
              title={title}
              body={body}
              onClose={() => {
                dispatch(closeModal('Confirm'));
              }}
            />
          )}
          <ToastContainer
            closeButton={<Icon name={IconName.Remove} size={18} />}
            newestOnTop={true}
            transition={Slide}
          />
          <TopNavbar routes={this.getRoutes()} />
          <Body>
            <Switch>
              <AppRoute path="/job/:id" component={JobLayout} permission={Permission.JOBS_VIEW} />
              <AppRoute path="/jobs" component={JobsLayout} permission={Permission.JOBS_VIEW} />
              <AppRoute
                path="/usage-and-actuals/:id"
                component={UsageAndActualsRouting}
                permission={Permission.JOBS_USAGE_VIEW}
              />

              <AppRoute path="/contacts" component={ContactsLayout} permission={Permission.CONTACTS_VIEW} />

              <AppRoute
                path="/finance/invoices/create"
                component={InvoiceDetailsPage}
                permission={Permission.INVOICES_MANAGE}
              />
              <AppRoute
                path="/finance/invoices/details/:id"
                component={InvoiceDetailsPage}
                permission={Permission.INVOICES_VIEW}
              />
              <AppRoute path="/finance/invoices/:type" component={InvoicesPage} permission={Permission.INVOICES_VIEW} />
              <AppRoute
                path="/finance/purchase-orders/create"
                component={PurchaseOrderDetailsPage}
                permission={Permission.PURCHASE_ORDERS_MANAGE}
              />
              <AppRoute
                path="/finance/purchase-orders/details/:id"
                component={PurchaseOrderDetailsPage}
                permission={Permission.PURCHASE_ORDERS_VIEW}
              />
              <AppRoute
                path="/finance/purchase-orders/:type"
                component={PurchaseOrdersPage}
                permission={Permission.PURCHASE_ORDERS_VIEW}
              />
              <AppRoute
                path="/finance/credit-notes/create"
                component={CreditNoteDetailsPage}
                permission={Permission.CREDIT_NOTES_MANAGE}
              />
              <AppRoute
                path="/finance/credit-notes/details/:id"
                component={CreditNoteDetailsPage}
                permission={Permission.CREDIT_NOTES_MANAGE}
              />
              <AppRoute
                path="/finance/credit-notes/:type"
                component={CreditNotesPage}
                permission={Permission.CREDIT_NOTES_VIEW}
              />
              <AppRoute
                path="/finance/receive-payment"
                component={ReceivePaymentPage}
                permission={Permission.INVOICES_VIEW}
              />
              <AppRoute
                path="/finance/forward-invoice-payments/new"
                component={ForwardPaymentsNewPage}
                permission={Permission.PAYMENTS_FORWARD}
              />
              <AppRoute
                path="/finance/forward-invoice-payments/received"
                component={ForwardPaymentsReceivedPage}
                permission={Permission.PAYMENTS_FORWARD}
              />
              <AppRoute
                path="/finance/reimbursements"
                component={ReimbursementsPage}
                permission={Permission.INVOICES_VIEW}
              />
              <AppRoute
                path="/finance/timesheet-payroll"
                component={TimesheetPayrollPage}
                permission={Permission.INVOICES_VIEW}
              />

              <AppRoute
                path="/operations/schedule/:section"
                component={SchedulePage}
                permission={Permission.OPERATIONS_RUNS_VIEW}
              />

              <AppRoute
                path="/reports/account-transactions"
                component={AccountTransactionsPage}
                permission={Permission.INVOICES_VIEW}
              />
              <AppRoute
                path="/reports/aged-receivables-summary"
                component={AgedReceivablesSummaryPage}
                permission={Permission.INVOICES_VIEW}
              />
              <AppRoute
                path="/reports/aged-receivables-detailed"
                component={AgedReceivablesDetailedPage}
                permission={Permission.INVOICES_VIEW}
              />
              <AppRoute
                path="/reports/income-by-account-summary"
                component={IncomeByAccountSummaryPage}
                permission={Permission.INVOICES_VIEW}
              />
              <AppRoute
                path="/reports/income-by-account-detailed"
                component={IncomeByAccountDetailedPage}
                permission={Permission.INVOICES_VIEW}
              />
              <AppRoute
                path="/reports/gst-summary"
                component={GSTSummaryPage}
                permission={Permission.FINANCIALS_REPORTS_VIEW}
              />
              <AppRoute
                path="/reports/statement-by-contact-summary"
                component={StatementByContactSummaryPage}
                permission={Permission.INVOICES_VIEW}
              />
              <AppRoute
                path="/reports/invoice-payments"
                component={InvoicePaymentsPage}
                permission={Permission.INVOICES_VIEW}
              />
              <AppRoute
                path="/reports/financial-report/:type"
                component={FinanceReport}
                permission={Permission.FINANCIALS_REPORTS_VIEW}
              />
              <AppRoute
                path="/reports/trial-balance"
                component={TrialBalancePage}
                permission={Permission.FINANCIALS_REPORTS_VIEW}
              />
              <AppRoute path="/manage" permission={this.computeManagePermission} component={ManageLayout} />
              <Route path="/not-found" component={NotFoundPage} />
              <Route path="/unauthorized" component={UnauthorizedPage} />
              <Redirect to="/jobs" />
            </Switch>
          </Body>
        </div>
      </UserContext.Provider>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  modal: state.modal,
  user: state.user
});

export default compose<React.ComponentClass<{}>>(
  withRouter,
  connect(mapStateToProps),
  DragDropContext(HTML5Backend),
  SidebarContextWrap
)(AppLayout);

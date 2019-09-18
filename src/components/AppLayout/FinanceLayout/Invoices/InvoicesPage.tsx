import React, {SyntheticEvent} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import {IAppState} from 'src/redux';
import {matchPath, RouteComponentProps, withRouter} from 'react-router-dom';
import styled from 'styled-components';
import Moment from 'react-moment';
import {debounce} from 'lodash';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';
import {getInvoices, InvoicesStateType, searchInvoices} from 'src/redux/invoicesDucks';
import {getInvoicesInfo} from 'src/redux/invoicesInfo';
import {IconName} from 'src/components/Icon/Icon';
import FinanceSidebarMenu from 'src/components/SidebarMenu/FinanceSidebarMenu';
import FullSidebarMenuItem, {IMenuItem} from 'src/components/SidebarMenu/FullSidebarMenuItem';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {IInvoice, IInvoiceListItem, IInvoicesListInfo} from 'src/models/FinanceModels/IInvoices';
import Tag from 'src/components/Tag/Tag';
import PageContent from 'src/components/Layout/PageContent';
import Permission from 'src/constants/Permission';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';
import {formatPrice, getFinanceItemStatusesColor, getFinanceItemStatusList, IStatusesEntity} from 'src/utility/Helpers';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import Pagination from 'src/components/Tables/Pagination';
import JobInfo from '../FinanceComponents/JobInfo';
import {FRONTEND_DATE} from 'src/constants/Date';
import {ITag} from 'src/models/ITag';
import {
  FinanceEntityStatus,
  financeEntityStatusName,
  FinanceEntityVirtualStatus
} from 'src/constants/FinanceEntityStatus';
import {IReturnType} from 'src/redux/reduxWrap';
import {Link as StyledLink} from 'src/components/Layout/Common/StyledComponents';
import AddPaymentModal from 'src/components/AppLayout/FinanceLayout/Invoices/AddPaymentModal';
import InvoicesService from 'src/services/InvoicesService';
import {LinkTr, TBody, Td, Th, THead, Tr} from 'src/components/Tables/PseudoTableItems';
import {FinancePseudoTable} from 'src/components/Tables/FinanceListTable';

const StatusTag = styled(Tag)`
  margin-right: 8px;
  font-size: ${Typography.size.normal};
  vertical-align: top;
`;

const RecipientCol = styled.span`
  margin-right: 8px;
`;

interface IConnectProps {
  invoices: InvoicesStateType;
  invoicesInfo: IReturnType<IInvoicesListInfo>;
  dispatch: (params?: any) => Promise<any> | void;
}

interface IParams {
  type: string;
}

interface IState {
  searchLoading: boolean;
  invoiceForPayment: IInvoice | null;
  invoiceLoading: boolean;
}

type IProps = RouteComponentProps<IParams>;

class InvoicesPage extends React.PureComponent<IProps & IConnectProps, IState> {
  public state = {
    searchLoading: false,
    invoiceForPayment: null,
    invoiceLoading: false
  };

  private getMenuItems(): IMenuItem[] {
    const {invoicesInfo} = this.props;
    const getBalance = (type?: FinanceEntityVirtualStatus) => {
      const amount = type && invoicesInfo.data && invoicesInfo.data[type].count > 0 && invoicesInfo.data[type].amount;
      return amount && formatPrice(amount);
    };
    return [
      {
        path: '/finance/invoices/draft',
        label: 'Drafts',
        icon: IconName.FileEdit,
        isActive: this.isActive('/finance/invoices/draft'),
        type: FinanceEntityVirtualStatus.draft,
        value: getBalance(FinanceEntityVirtualStatus.draft)
      },
      {
        path: '/finance/invoices/unpaid',
        label: 'Unpaid',
        icon: IconName.FileCheck,
        isActive: this.isActive('/finance/invoices/unpaid'),
        type: FinanceEntityVirtualStatus.unpaid,
        value: getBalance(FinanceEntityVirtualStatus.unpaid)
      },
      {
        path: '/finance/invoices/overdue',
        label: 'Overdue',
        icon: IconName.FileCash,
        isActive: this.isActive('/finance/invoices/overdue'),
        type: FinanceEntityVirtualStatus.overdue,
        value: getBalance(FinanceEntityVirtualStatus.overdue)
      },
      {
        path: '/finance/invoices/all',
        label: 'All Invoices',
        icon: IconName.File,
        isActive: this.isActive('/finance/invoices/all')
      }
    ];
  }

  public componentDidMount() {
    this.getInvoices();
  }

  public componentDidUpdate(prevProps: IProps & IConnectProps) {
    const type = this.props.match.params.type as FinanceEntityVirtualStatus;
    if (prevProps.match.params.type !== type) {
      this.getInvoices(this.searchString);
    }
  }

  private searchString: string = '';

  private debouncedSearch = debounce(
    (term: string) => {
      this.getInvoices(term);
    },
    1000,
    {trailing: true}
  );

  private handleSearch = (term: string) => {
    this.searchString = term;

    if (term) {
      this.debouncedSearch(term);
    } else {
      this.debouncedSearch.cancel();
      this.getInvoices();
    }
  };

  private handlePagination = (page: number) => {
    return this.getInvoices(this.searchString, page);
  };

  private getInvoices = async (term?: string, page?: number) => {
    const type = this.props.match.params.type as FinanceEntityVirtualStatus & FinanceEntityStatus;
    if (term) {
      this.setState({searchLoading: true});
      await this.props.dispatch(searchInvoices({term, type, page}));
      this.setState({searchLoading: false});
    } else {
      this.props.dispatch(getInvoices(type, {page}));
      this.props.dispatch(getInvoicesInfo());
    }
  };

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  private createInvoice = () => {
    this.props.history.push('/finance/invoices/create');
  };

  private openPaymentModal = (item: IInvoiceListItem) => async (e: SyntheticEvent) => {
    e.preventDefault();
    this.setState({invoiceLoading: true});
    try {
      const invoice = await InvoicesService.findById(item.id);
      this.setState({invoiceForPayment: invoice.data, invoiceLoading: false});
    } catch {
      this.setState({invoiceLoading: false});
    }
  };

  private closePaymentModal = () => {
    this.setState({invoiceForPayment: null});
  };

  private isPayColumnShown = (context: IUserContext) => {
    const {type} = this.props.match.params;
    return context.has(Permission.PAYMENTS_RECEIVE) && type !== FinanceEntityVirtualStatus.draft;
  };

  private renderTags(invoice: IInvoiceListItem) {
    return getFinanceItemStatusList(invoice as IStatusesEntity).map(status => (
      <StatusTag
        tag={
          {
            name: financeEntityStatusName[status],
            color: getFinanceItemStatusesColor(status as FinanceEntityStatus & FinanceEntityVirtualStatus)
          } as ITag
        }
        key={status}
      />
    ));
  }

  private renderInvoicesRows(context: IUserContext) {
    const invoices = this.props.invoices.data!.data;
    if (!invoices) {
      return null;
    }
    return invoices.map((invoice: IInvoiceListItem) => (
      <LinkTr to={`/finance/invoices/details/${invoice.id}`} key={invoice.id}>
        <Td>#{invoice.id}</Td>
        <Td>
          <RecipientCol>{invoice.recipient_name}</RecipientCol>
          {this.renderTags(invoice)}
        </Td>
        <Td>
          <JobInfo job={invoice.job} locationOnly={true} />
        </Td>
        <Td>
          <Moment format={FRONTEND_DATE}>{invoice.due_at}</Moment>
        </Td>
        <Td>{formatPrice(invoice.total_amount)}</Td>
        <Td>{formatPrice(invoice.balance_due)}</Td>
        {this.isPayColumnShown(context) && (
          <Td>
            {invoice.latest_status.status === FinanceEntityStatus.approved &&
              invoice.virtual_status === FinanceEntityVirtualStatus.unpaid && (
                <StyledLink fontSize={Typography.size.normal} onClick={this.openPaymentModal(invoice)}>
                  Pay Now
                </StyledLink>
              )}
          </Td>
        )}
      </LinkTr>
    ));
  }

  private renderNoInvoices(context: IUserContext) {
    return (
      <Tr>
        <div className="no-items">No Invoices...</div>
      </Tr>
    );
  }

  public render() {
    const {
      invoices: {ready, loading},
      invoicesInfo: {loading: ld}
    } = this.props;
    const {searchLoading, invoiceForPayment, invoiceLoading} = this.state;
    const invoicesData = this.props.invoices.data;
    const data = invoicesData && invoicesData.data;
    const hasInvoices = !!(ready && data && data.length > 0);

    return (
      <UserContext.Consumer>
        {context => (
          <div className="d-flex h-100 flex-row align-items-stretch">
            <ReactTooltip className="overlapping" effect="solid" place="right" id="invoices-sidebar-tooltip" />
            <FinanceSidebarMenu
              disableActions={!context.has(Permission.INVOICES_MANAGE)}
              onAddAction={this.createInvoice}
              searchPlaceholder="Search invoice..."
              searchLoading={searchLoading}
              onSearch={this.handleSearch}
              loading={ld}
              hint="Create new invoice"
            >
              {this.getMenuItems().map((item: IMenuItem) => (
                <FullSidebarMenuItem key={item.label} item={item} />
              ))}
            </FinanceSidebarMenu>
            <div className="flex-grow-1 position-relative">
              {(loading || invoiceLoading) && <BlockLoading size={40} color={ColorPalette.white} />}
              <ScrollableContainer className="h-100">
                <PageContent>
                  <FinancePseudoTable className="table">
                    <THead>
                      <Tr>
                        <Th>Invoice</Th>
                        <Th />
                        <Th>Job No.</Th>
                        <Th>Due Date</Th>
                        <Th>Total Amount</Th>
                        <Th>Balance Due</Th>
                        {this.isPayColumnShown(context) && <Th />}
                      </Tr>
                    </THead>
                    <TBody>{hasInvoices ? this.renderInvoicesRows(context) : this.renderNoInvoices(context)}</TBody>
                  </FinancePseudoTable>
                  {invoicesData && invoicesData.pagination && (
                    <Pagination pagination={invoicesData.pagination} onChange={this.handlePagination} />
                  )}
                </PageContent>
              </ScrollableContainer>
            </div>
            {invoiceForPayment && (
              <AddPaymentModal
                invoice={invoiceForPayment!}
                onPaymentReceive={this.getInvoices}
                onClose={this.closePaymentModal}
              />
            )}
          </div>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  invoices: state.invoices,
  invoicesInfo: state.invoicesInfo
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(InvoicesPage);

export const InternalInvoicesPage = InvoicesPage;

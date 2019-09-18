import * as React from 'react';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {default as FullSidebarMenuItem, IMenuItem} from 'src/components/SidebarMenu/FullSidebarMenuItem';
import FinanceSidebarMenu from 'src/components/SidebarMenu/FinanceSidebarMenu';
import {IconName} from 'src/components/Icon/Icon';
import {matchPath, RouteComponentProps} from 'react-router-dom';
import {Action, compose} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {IReturnType} from 'src/redux/reduxWrap';
import {withRouter} from 'react-router';
import {IPurchaseOrdersInfoSuccess, IPurchaseOrdersSuccess} from 'src/services/PurchaseOrdersService';
import {getPurchaseOrders, loadPurchaseOrdersInfo, searchPurchaseOrders} from 'src/redux/purchaseOrdersDucks';
import PageContent from 'src/components/Layout/PageContent';
import {FinancePseudoTable} from 'src/components/Tables/FinanceListTable';
import JobInfo from '../FinanceComponents/JobInfo';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import {formatPrice, getFinanceItemStatusesColor, getFinanceItemStatusList, IStatusesEntity} from 'src/utility/Helpers';
import Moment from 'react-moment';
import Typography from 'src/constants/Typography';
import Tag from 'src/components/Tag/Tag';
import styled from 'styled-components';
import {IPurchaseOrderListItem} from 'src/models/FinanceModels/IPurchaseOrders';
import {debounce} from 'lodash';
import Pagination from 'src/components/Tables/Pagination';
import {FRONTEND_DATE} from 'src/constants/Date';
import PageSizes from 'src/constants/PageSizes';
import {ITag} from 'src/models/ITag';
import {
  FinanceEntityStatus,
  financeEntityStatusName,
  FinanceEntityVirtualStatus
} from 'src/constants/FinanceEntityStatus';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import {getValidStatuses, StatusType} from 'src/redux/invoicesDucks';
import {LinkTr, Td, Th, THead, Tr, TBody} from 'src/components/Tables/PseudoTableItems';

interface IParams {
  type: string;
}

interface IConnectProps {
  info: IReturnType<IPurchaseOrdersInfoSuccess>;
  purchaseOrders: IReturnType<IPurchaseOrdersSuccess>;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  type: StatusType;
  search: string;
  searchLoading: boolean;
}

type IProps = RouteComponentProps<IParams> & IConnectProps;

const StatusTag = styled(Tag)`
  margin-left: 8px;
  font-size: ${Typography.size.normal};
  vertical-align: top;
`;

class PurchaseOrdersPage extends React.PureComponent<IProps, IState> {
  public state = {
    type: FinanceEntityStatus.draft as StatusType,
    search: '',
    searchLoading: false
  };

  public componentDidMount() {
    const {dispatch, match} = this.props;
    const {type} = match.params;

    dispatch(loadPurchaseOrdersInfo());
    this.loadPurchaseOrders(type as StatusType);
  }

  public componentDidUpdate(prevProps: IProps) {
    const {type} = this.props.match.params;

    if (prevProps.match.params.type !== type) {
      this.loadOrCancelPO(undefined, true);
    }
  }

  private loadOrCancelPO = (page?: number, immediately?: boolean) => {
    const {type} = this.props.match.params;
    const {search} = this.state;

    if (search) {
      const statuses = getValidStatuses(type as StatusType);
      const config = {id: search, virtual_status: statuses.virtualStatus, status: statuses.status};

      if (immediately) {
        this.searcher(config);
      } else {
        this.debouncedSearch(config);
      }
    } else {
      this.debouncedSearch.cancel();
      this.loadPurchaseOrders(type as StatusType, page);
    }
  };

  private loadPurchaseOrders = async (type: StatusType, page?: number) => {
    const {dispatch} = this.props;
    await dispatch(getPurchaseOrders(type, {page, per_page: 20}));
    this.setState({type});
  };

  private getMenuItems(): IMenuItem[] {
    const {
      info: {data}
    } = this.props;

    return [
      {
        path: '/finance/purchase-orders/draft',
        label: 'Drafts',
        icon: IconName.FileEdit,
        isActive: this.isActive('/finance/purchase-orders/draft'),
        type: FinanceEntityVirtualStatus.draft,
        value: 0
      },
      {
        path: '/finance/purchase-orders/all',
        label: 'All Purchase Orders',
        icon: IconName.FileQuestion,
        isActive: this.isActive('/finance/purchase-orders/all'),
        value: 0
      }
    ].map((el: IMenuItem) => {
      if (data && el.type && data.data[el.type]) {
        el.value = formatPrice(data.data[el.type].amount);
      }
      return el;
    });
  }

  private isActive(path: string) {
    return !!matchPath(this.props.location.pathname, {path});
  }

  private renderTags(po: IPurchaseOrderListItem) {
    return getFinanceItemStatusList(po as IStatusesEntity, [FinanceEntityStatus.approved]).map(status => (
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

  private renderPurchaseOrdersRows(list: IPurchaseOrderListItem[]) {
    if (!list) {
      return null;
    }
    return list.map((order: IPurchaseOrderListItem) => (
      <LinkTr to={`/finance/purchase-orders/details/${order.id}`} key={`po-tr-${order.id}`}>
        <Td>PO #{order.id}</Td>
        <Td>
          <span>{order.recipient_name}</span>
          {this.renderTags(order)}
        </Td>
        <Td>
          <JobInfo job={order.job} locationOnly={true} />
        </Td>
        <Td>
          <Moment format={FRONTEND_DATE}>{order.date}</Moment>
        </Td>
        <Td>{formatPrice(order.total_amount)}</Td>
      </LinkTr>
    ));
  }

  private renderNoPurchaseOrders() {
    return (
      <Tr>
        <div className="no-items">No Purchase Orders...</div>
      </Tr>
    );
  }

  private onSearch = (search: string) => {
    this.setState({search});

    setTimeout(() => {
      this.loadOrCancelPO();
    });
  };

  private searcher = async (config: any) => {
    this.setState({searchLoading: true});
    try {
      await this.props.dispatch(searchPurchaseOrders(Object.assign({per_page: PageSizes.Standard}, config)));
    } finally {
      this.setState({searchLoading: false});
    }
  };

  private debouncedSearch = debounce(this.searcher, 1000);

  private getRows = (): IPurchaseOrderListItem[] => {
    const {
      purchaseOrders: {data}
    } = this.props;

    return (data && data.data) || [];
  };

  private createPurchaseOrder = () => {
    this.props.history.push('/finance/purchase-orders/create');
  };

  private handlePagination = (page: number) => {
    this.loadOrCancelPO(page);
  };

  public render() {
    const {
      info: {loading},
      purchaseOrders: {loading: loadingOrders},
      purchaseOrders: PO
    } = this.props;
    const purchaseOrders = this.getRows();
    const hasOrders = purchaseOrders.length > 0;
    const {searchLoading} = this.state;

    return (
      <UserContext.Consumer>
        {context => {
          const canPurchaseOrdersView = context.has(Permission.PURCHASE_ORDERS_VIEW);

          return (
            <div className="d-flex h-100 flex-row align-items-stretch">
              <FinanceSidebarMenu
                disableActions={!context.has(Permission.PURCHASE_ORDERS_MANAGE)}
                onAddAction={this.createPurchaseOrder}
                onSearch={this.onSearch}
                loading={loading}
                searchLoading={searchLoading}
                searchPlaceholder="Search purchase orders..."
                hint="Create new purchase order"
              >
                {canPurchaseOrdersView &&
                  this.getMenuItems().map((item: IMenuItem, index) => (
                    <FullSidebarMenuItem key={`${index}-${item.type}`} item={item} />
                  ))}
              </FinanceSidebarMenu>
              <div className="flex-grow-1 position-relative">
                {(loadingOrders || searchLoading) && <BlockLoading size={40} color={ColorPalette.white} />}
                <ScrollableContainer className="h-100">
                  <PageContent>
                    {canPurchaseOrdersView && (
                      <FinancePseudoTable className="table">
                        <THead>
                          <Tr>
                            <Th style={{width: '135px'}}>Purchase Order</Th>
                            <Th />
                            <Th>Job No.</Th>
                            <Th>Date</Th>
                            <Th>Total Amount</Th>
                          </Tr>
                        </THead>
                        <TBody>
                          {hasOrders ? this.renderPurchaseOrdersRows(purchaseOrders) : this.renderNoPurchaseOrders()}
                        </TBody>
                      </FinancePseudoTable>
                    )}
                    {PO.data && PO.data.pagination && hasOrders && (
                      <Pagination pagination={PO.data.pagination} onChange={this.handlePagination} />
                    )}
                  </PageContent>
                </ScrollableContainer>
              </div>
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  info: state.purchaseOrdersInfo,
  purchaseOrders: state.purchaseOrders
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(PurchaseOrdersPage);

export const InternalPurchaseOrdersPage = PurchaseOrdersPage;

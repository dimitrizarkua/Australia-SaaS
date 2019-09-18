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
import {ICreditNotesInfoSuccess, ICreditNotesSuccess} from 'src/services/CreditNotesService';
import {getCreditNotes, searchCreditNotes} from 'src/redux/creditNotesDucks';
import {getCreditNotesInfo} from 'src/redux/creditNotesInfo';
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
import {ICreditNoteListItem} from 'src/models/FinanceModels/ICreditNotes';
import {debounce} from 'lodash';
import {FRONTEND_DATE} from 'src/constants/Date';
import {ITag} from 'src/models/ITag';
import {
  FinanceEntityStatus,
  financeEntityStatusName,
  FinanceEntityVirtualStatus
} from 'src/constants/FinanceEntityStatus';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import {getValidStatuses, StatusType} from 'src/redux/invoicesDucks';
import PageSizes from 'src/constants/PageSizes';
import {Td, THead, Tr, LinkTr, Th, TBody} from 'src/components/Tables/PseudoTableItems';

interface IParams {
  type: string;
}

interface IConnectProps {
  info: IReturnType<ICreditNotesInfoSuccess>;
  creditNotes: IReturnType<ICreditNotesSuccess>;
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

class CreditNotesPage extends React.PureComponent<IProps, IState> {
  public state = {
    type: FinanceEntityStatus.draft as StatusType,
    search: '',
    searchLoading: false
  };

  public componentDidMount() {
    const {dispatch, match} = this.props;
    const {type} = match.params;

    dispatch(getCreditNotesInfo());

    this.loadCreditNotes(type as StatusType);
  }

  public componentDidUpdate(prevProps: IProps) {
    const {type} = this.props.match.params;

    if (prevProps.match.params.type !== type) {
      this.loadOrCancelCN();
    }
  }

  private loadCreditNotes = (type: StatusType) => {
    const {dispatch} = this.props;
    dispatch(getCreditNotes(type, {per_page: PageSizes.Standard})).then(() => this.setState({type}));
  };

  private getMenuItems(): IMenuItem[] {
    const {
      info: {data}
    } = this.props;
    return [
      {
        path: '/finance/credit-notes/draft',
        label: 'Drafts',
        icon: IconName.FileEdit,
        isActive: this.isActive('/finance/credit-notes/draft'),
        type: FinanceEntityStatus.draft,
        value: 0
      },
      {
        path: '/finance/credit-notes/all',
        label: 'All Credit Notes',
        icon: IconName.FileQuestion,
        isActive: this.isActive('/finance/credit-notes/all'),
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

  private renderTags(cnote: ICreditNoteListItem) {
    return getFinanceItemStatusList(cnote as IStatusesEntity, [FinanceEntityStatus.approved]).map(status => (
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

  private renderCreditNotesRows(list: ICreditNoteListItem[]) {
    if (!list) {
      return null;
    }
    return list.map((cnote: ICreditNoteListItem) => (
      <LinkTr to={`/finance/credit-notes/details/${cnote.id}`} key={`cn-tr-${cnote.id}`}>
        <Td>CN #{cnote.id}</Td>
        <Td>
          <span>{cnote.recipient_name}</span>
          {this.renderTags(cnote)}
        </Td>
        <Td>
          <JobInfo job={cnote.job} locationOnly={true} />
        </Td>
        <Td>
          <Moment format={FRONTEND_DATE}>{cnote.date}</Moment>
        </Td>
        <Td>{formatPrice(cnote.total_amount)}</Td>
      </LinkTr>
    ));
  }

  private renderNoCreditNotes() {
    return (
      <Tr>
        <div className="no-items">No Credit Notes...</div>
      </Tr>
    );
  }

  private onSearch = (search: string) => {
    this.setState({search});

    setTimeout(() => {
      this.loadOrCancelCN();
    });
  };

  private loadOrCancelCN = () => {
    const {type} = this.props.match.params;
    const {search} = this.state;

    if (search) {
      const statuses = getValidStatuses(type as StatusType);
      const config = {
        id: search,
        virtual_status: statuses.virtualStatus,
        status: statuses.status,
        per_page: PageSizes.Standard
      };
      this.debouncedSearch(config);
    } else {
      this.debouncedSearch.cancel();
      this.loadCreditNotes(type as StatusType);
    }
  };

  private searcher = async (config: any) => {
    this.setState({searchLoading: true});
    try {
      await this.props.dispatch(searchCreditNotes(config));
    } finally {
      this.setState({searchLoading: false});
    }
  };

  private debouncedSearch = debounce(this.searcher, 1000);

  private getRows = (): ICreditNoteListItem[] => {
    const {
      creditNotes: {data}
    } = this.props;

    return (data && data.data) || [];
  };

  private createCreditNotes = () => {
    this.props.history.push('/finance/credit-notes/create');
  };

  public render() {
    const {
      creditNotes: {loading},
      info: {loading: ld}
    } = this.props;
    const creditNotes = this.getRows();
    const hasCreditNotes = creditNotes.length > 0;
    const {searchLoading} = this.state;

    return (
      <UserContext.Consumer>
        {context => {
          const available = context.has(Permission.PURCHASE_ORDERS_VIEW);
          return (
            <div className="d-flex h-100 flex-row align-items-stretch">
              <FinanceSidebarMenu
                disableActions={!context.has(Permission.PURCHASE_ORDERS_MANAGE)}
                onAddAction={this.createCreditNotes}
                onSearch={this.onSearch}
                searchLoading={searchLoading}
                loading={ld}
                searchPlaceholder="Search credit notes..."
                hint="Create new credit note"
              >
                {available &&
                  this.getMenuItems().map((item: IMenuItem, index) => (
                    <FullSidebarMenuItem key={`${index}-${item.type}`} item={item} />
                  ))}
              </FinanceSidebarMenu>
              <div className="flex-grow-1 position-relative">
                {(loading || searchLoading) && <BlockLoading size={40} color={ColorPalette.white} />}
                <ScrollableContainer className="h-100">
                  <PageContent>
                    {available && (
                      <FinancePseudoTable className="table">
                        <THead>
                          <Tr>
                            <Th>Credit Note</Th>
                            <Th />
                            <Th>Job No.</Th>
                            <Th>Date</Th>
                            <Th>Total Amount</Th>
                          </Tr>
                        </THead>
                        <TBody>
                          {hasCreditNotes ? this.renderCreditNotesRows(creditNotes) : this.renderNoCreditNotes()}
                        </TBody>
                      </FinancePseudoTable>
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
  info: state.creditNotesInfo,
  creditNotes: state.creditNotes
});

export default compose<React.ComponentClass<{}>>(
  connect(mapStateToProps),
  withRouter
)(CreditNotesPage);

export const InternalCreditNotesPage = CreditNotesPage;

import * as React from 'react';
import {ThunkDispatch} from 'redux-thunk';
import {Action, compose} from 'redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import {IPurchaseOrderListItem} from 'src/models/FinanceModels/IPurchaseOrders';
import {Link} from 'react-router-dom';
import Moment from 'react-moment';
import {FRONTEND_DATE} from 'src/constants/Date';
import {formatPrice} from 'src/utility/Helpers';
import Permission from 'src/constants/Permission';
import UserContext, {IUserContext} from '../../UserContext';
import UsageTableLayout from '../UsageTableLayout';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import {IReturnType} from 'src/redux/reduxWrap';
import {IPurchaseOrdersSuccess} from 'src/services/PurchaseOrdersService';
import {getPurchaseOrders, loadPurchaseOrdersInfo} from 'src/redux/purchaseOrdersDucks';
import {StatusType} from 'src/redux/invoicesDucks';

interface IOwnProps {
  jobIsClosed: boolean;
}

interface IParams {
  id: number;
}

interface IConnectProps {
  purchaseOrders: IReturnType<IPurchaseOrdersSuccess>;
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = RouteComponentProps<IParams> & IConnectProps & IOwnProps;

class PurchaseOrderTableLayout extends React.PureComponent<IProps> {
  public componentDidMount() {
    const {dispatch} = this.props;

    dispatch(loadPurchaseOrdersInfo());
    this.loadPurchaseOrders();
  }

  private loadPurchaseOrders = (type?: StatusType) => {
    const {dispatch} = this.props;
    dispatch(getPurchaseOrders(type, {job_id: this.props.match.params.id}));
  };

  // TODO: Add implementation of Mark as used
  // private orderMenuItems = (
  //   context: IUserContext,
  //   order: IPurchaseOrderListItem,
  //   jobIsClosed: boolean
  // ): IMenuItem[] => {
  //   const allowEdit =
  //     context.has(Permission.JOBS_USAGE_MATERIALS_UPDATE) && context.has(Permission.JOBS_USAGE_MATERIALS_MANAGE);

  //   return [
  //     {
  //       name: 'Mark as used',
  //       disabled: !allowEdit || jobIsClosed,
  //       onClick: () => this.markAsUsed(order)
  //     }
  //   ];
  // };

  // TODO: Add here sending 'Mark as used' status to Service
  // private markAsUsed(order: IPurchaseOrderListItem) {
  //   Notify(NotifyType.Success, 'Marked as used');
  // }

  private renderNodata() {
    return (
      <tr>
        <td className="no-items" colSpan={7}>
          No items found
        </td>
      </tr>
    );
  }

  private renderRows(context: IUserContext) {
    const {
      purchaseOrders: {data}
      // jobIsClosed
    } = this.props;

    if (!data) {
      return null;
    }
    return data.data.map((item: IPurchaseOrderListItem) => (
      <tr key={item.id}>
        <td style={{whiteSpace: 'nowrap'}}>
          <Moment format={FRONTEND_DATE}>{item.date ? item.date.toString() : ''}</Moment>
        </td>
        <td style={{width: '100%'}}>{item.reference}</td>
        <td style={{whiteSpace: 'nowrap'}}>
          <Link to={`/finance/purchase-orders/details/${item.id}`} target="_blank">
            PO #{item.id}
          </Link>
        </td>
        <td />
        <td style={{whiteSpace: 'nowrap'}}>{formatPrice(item.total_amount)}</td>
        <td>
          {/* TODO: Add correct Mark as Used handling.*/}
          {/* <ColoredIcon
            name={IconName.Check}
            color={ColorPalette.green0}
            style={{visibility: item.latest_status.status === 'approved' ? 'visible' : 'hidden'}}
          /> */}
        </td>
        <td>
          {/* TODO: Add implementation of Mark as used */}
          {/* <DropdownMenuControl
            noMargin={true}
            iconName={IconName.MenuVertical}
            items={this.orderMenuItems(context, item, jobIsClosed)}
            direction="right"
          /> */}
        </td>
      </tr>
    ));
  }

  public render() {
    const {
      purchaseOrders: {data, loading}
    } = this.props;

    const hasOrders = data && data.data && data.data.length > 0;

    return (
      <UserContext.Consumer>
        {context => {
          const allowRenderView = context.has(Permission.JOBS_USAGE_VIEW);

          return allowRenderView ? (
            <>
              {loading && <BlockLoading size={40} color={ColorPalette.white} />}
              <UsageTableLayout>
                <thead>
                  <tr>
                    <th colSpan={7}>Purchase Orders</th>
                  </tr>
                </thead>
                <tbody>{hasOrders ? this.renderRows(context) : this.renderNodata()}</tbody>
              </UsageTableLayout>
            </>
          ) : null;
        }}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  purchaseOrders: state.purchaseOrders
});

export default compose<React.ComponentClass<IOwnProps>>(
  withRouter,
  connect(mapStateToProps)
)(PurchaseOrderTableLayout);

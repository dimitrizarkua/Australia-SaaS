import * as React from 'react';
import {ThunkDispatch} from 'redux-thunk';
import {Action, compose} from 'redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import {IPurchaseOrder} from 'src/models/FinanceModels/IPurchaseOrders';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import {IconName} from 'src/components/Icon/Icon';
import Permission from 'src/constants/Permission';
import UserContext, {IUserContext} from '../../UserContext';
import UsageTableLayout from '../UsageTableLayout';

interface IOwnProps {
  jobIsClosed: boolean;
}

interface IParams {
  id: number;
}

interface IConnectProps {
  storages: IPurchaseOrder[];
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = RouteComponentProps<IParams> & IConnectProps & IOwnProps;

class StorageTableLayout extends React.PureComponent<IProps> {
  private storageMenuItems = (context: IUserContext, order: IPurchaseOrder, jobIsClosed: boolean): IMenuItem[] => {
    const allowEdit =
      context.has(Permission.JOBS_USAGE_MATERIALS_UPDATE) && context.has(Permission.JOBS_USAGE_MATERIALS_MANAGE);

    return [
      {
        name: 'Mark as used',
        disabled: !allowEdit || jobIsClosed,
        onClick: () => this.markAsUsed(order)
      }
    ];
  };

  private markAsUsed(storage: any) {
    return storage;
  }

  private renderNodata() {
    return (
      <tr>
        <td className="no-items" colSpan={1}>
          No items found
        </td>
      </tr>
    );
  }

  private renderRows(context: IUserContext) {
    const {storages, jobIsClosed} = this.props;

    if (!storages) {
      return null;
    }
    return storages.map((item: any) => (
      <tr key={item.id}>
        <td>
          {/* TODO: Add Storage fields here */}
          Add Storage fields here
        </td>
        <td>
          <DropdownMenuControl
            noMargin={true}
            iconName={IconName.MenuVertical}
            items={this.storageMenuItems(context, item, jobIsClosed)}
            direction="right"
          />
        </td>
      </tr>
    ));
  }

  public render() {
    return (
      <UserContext.Consumer>
        {context => {
          const allowRenderView = context.has(Permission.JOBS_USAGE_VIEW);

          return allowRenderView ? (
            <>
              <UsageTableLayout>
                <thead>
                  <tr>
                    <th>Storage</th>
                  </tr>
                </thead>
                <tbody>{false ? this.renderRows(context) : this.renderNodata()}</tbody>
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
)(StorageTableLayout);

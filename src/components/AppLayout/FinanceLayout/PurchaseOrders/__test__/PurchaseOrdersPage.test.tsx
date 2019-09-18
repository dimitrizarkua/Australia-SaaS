import * as React from 'react';
import {IUserContext} from 'src/components/AppLayout/UserContext';
import {IReturnType} from 'src/redux/reduxWrap';
import {IPurchaseOrdersInfoSuccess, IPurchaseOrdersSuccess} from 'src/services/PurchaseOrdersService';
import {shallow} from 'enzyme';
import {InternalPurchaseOrdersPage as PurchaseOrdersPage} from '../PurchaseOrdersPage';
import UserContext from 'src/components/AppLayout/UserContext';
import {getFakeInvoices} from 'src/services/helpers/TestHelpers';

let purchaseOrders: IReturnType<IPurchaseOrdersSuccess>;
let props: any;
let context: IUserContext;
let info: IReturnType<IPurchaseOrdersInfoSuccess>;

describe('PurchaseOrdersPage', () => {
  beforeEach(() => {
    purchaseOrders = {
      data: null,
      error: null,
      loading: false,
      ready: false
    };
    info = {
      data: {
        data: {
          draft: {},
          pending_approval: {},
          approved: {}
        }
      } as any,
      error: null,
      loading: false,
      ready: false
    };
    props = {
      location: {},
      dispatch: () => Promise.resolve(),
      match: {
        params: {
          type: 'draft'
        }
      },
      purchaseOrdersSearch: {
        fetch: jest.fn,
        loading: false
      }
    };
    context = {has: () => true};
  });

  const renderComponent = () => {
    const component = shallow(<PurchaseOrdersPage info={info} purchaseOrders={purchaseOrders} {...props} />);
    return (component.find(UserContext.Consumer) as any).renderProp('children')(context);
  };

  it('should always render PurchaseOrders table', () => {
    if (!purchaseOrders.data) {
      purchaseOrders.data = {data: []} as any;
    }
    let page = renderComponent();
    expect(page.find('.no-items')).toHaveLength(1);
    ////////
    purchaseOrders.data!.data = getFakeInvoices({min: 2, max: 6}) as any;
    page = renderComponent();
    expect(page.find('.no-items')).toHaveLength(0);
  });
});

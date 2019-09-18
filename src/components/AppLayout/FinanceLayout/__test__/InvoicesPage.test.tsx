import * as React from 'react';
import {shallow} from 'enzyme';
import {InternalInvoicesPage as InvoicesPage} from '../Invoices/InvoicesPage';
import {getFakeInvoices} from 'src/services/helpers/TestHelpers';
import UserContext, {IUserContext} from 'src/components/AppLayout/UserContext';

let invoicesState: any;
let props: any;
let context: IUserContext;

describe('InvoicesPage', () => {
  beforeEach(() => {
    invoicesState = {
      data: null,
      error: null,
      loading: false,
      ready: false
    };
    props = {
      location: {},
      invoicesInfo: {loading: false},
      dispatch: jest.fn,
      match: {
        params: {
          type: 'all'
        }
      }
    };
    context = {has: () => true};
  });

  const renderComponent = () => {
    const component = shallow(<InvoicesPage invoices={invoicesState} {...props} />);
    return (component.find(UserContext.Consumer) as any).renderProp('children')(context);
  };

  it('should render Invoices table if data is ready', () => {
    invoicesState.data = {
      data: getFakeInvoices({min: 2, max: 6})
    };
    invoicesState.ready = true;
    const page = renderComponent();
    expect(page.find('.table')).toHaveLength(1);
  });

  it('should render rows for all invoices', () => {
    invoicesState.data = {
      data: getFakeInvoices({min: 2, max: 6})
    };
    invoicesState.ready = true;
    // const page = renderComponent();
    // const invoices = invoicesState.data.data;
    // expect(page.find('.table tbody tr')).toHaveLength(invoices.length);
    // invoices.forEach((inv: any, index: number) => {
    //   const link = page
    //     .find('.table tbody tr')
    //     .at(index)
    //     .find(Link);
    //   expect((link.props().children as any).join('')).toEqual(`Inv #${inv.id}`);
    // });
  });
});

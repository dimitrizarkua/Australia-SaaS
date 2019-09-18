import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import invoicesDucks, {InvoiceListingType, IInvoicesState, getInvoices} from '../invoicesDucks';

const properInitialState = {
  data: null,
  error: null,
  loading: false,
  ready: false
};

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const mockRequests = {
  draft: jest.fn(),
  unpaid: jest.fn(),
  overdue: jest.fn(),
  all: jest.fn()
};

jest.mock('src/services/InvoicesService', () => ({
  getDraft: () => {
    mockRequests.draft();
    return Promise.resolve({data: []});
  },
  getOverdue: () => {
    mockRequests.overdue();
    return Promise.resolve({data: []});
  },
  getUnpaid: () => {
    mockRequests.unpaid();
    return Promise.resolve({data: []});
  },
  getAll: () => {
    mockRequests.all();
    return Promise.resolve({data: []});
  }
}));

describe('invoicesDucks', () => {
  let state: IInvoicesState;

  beforeEach(() => {
    state = invoicesDucks(undefined, undefined);
  });

  it('should return proper initial state', () => {
    expect(state).toStrictEqual(properInitialState);
  });

  it('should call proper InvoicesService function within getInvoices', () => {
    const store = mockStore(state);
    ['all', 'draft', 'overdue', 'unpaid'].forEach((type: InvoiceListingType) => {
      const action = store.dispatch(getInvoices(type)).then(() => {
        expect(mockRequests[type]).toBeCalled();
      });
    });
  });
});

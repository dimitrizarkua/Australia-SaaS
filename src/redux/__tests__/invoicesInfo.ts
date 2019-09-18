import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import invoicesInfo, {setInvoicesInfo, resetInvoicesInfo, getInvoicesInfo} from '../invoicesInfo';
import {IReturnType} from 'src/redux/reduxWrap';
import {IInvoicesListInfo} from 'src/models/FinanceModels/IInvoices';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const mockRequest = jest.fn();

const fakeInfo = {
  draft: {amount: 0, count: 0},
  unpaid: {amount: 1000, count: 1},
  overdue: {amount: -999.43, count: 2}
};

jest.mock('src/services/InvoicesService', () => ({
  getInfo: () => {
    mockRequest();
    return Promise.resolve({data: {}});
  }
}));

describe('invoicesInfo reduser', () => {
  let state: IReturnType<IInvoicesListInfo>;

  beforeEach(() => {
    state = invoicesInfo(undefined, undefined);
  });

  it('should return null as initial state', () => {
    expect(state.data).toEqual(null);
  });

  it('should dispatch set invoises info', () => {
    state = invoicesInfo(state, setInvoicesInfo(fakeInfo));
    expect(state.data).toStrictEqual(fakeInfo);
  });

  it('should dispatch reset invoises info', () => {
    state = invoicesInfo(state, setInvoicesInfo(fakeInfo));
    state = invoicesInfo(state, resetInvoicesInfo());
    expect(state.data).toEqual(null);
  });

  it('should call InvoicesService.getInfo within getInvoicesInfo action', () => {
    const store = mockStore(state);
    const action = store.dispatch(getInvoicesInfo()).then(() => {
      expect(mockRequest).toBeCalled();
    });
  });

  it('should dispatch setInvoicesInfo within getInvoicesInfo action', () => {
    const store = mockStore(state);
    const action = store.dispatch(getInvoicesInfo()).then(() => {
      const actions = store.getActions();
      expect(actions[actions.length - 1].type).toEqual(setInvoicesInfo(fakeInfo).type);
    });
  });
});

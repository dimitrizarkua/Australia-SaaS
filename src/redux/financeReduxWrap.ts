import {Reducer} from 'redux';
import {reduxWrap, IReduxWrapConfig} from './reduxWrap';

interface IDataReducerConfig extends IReduxWrapConfig {
  createItem: string;
  updateItem: string;
  removeItem: string;
  updateTotals: string;
}

export function createFinanceDataReducer<T extends {items?: any[]}>(initialState: T, config: IDataReducerConfig) {
  const dataReducer: Reducer<T> = (state: T = initialState, action = {type: null}) => {
    switch (action.type) {
      case config.loadComplete:
        return action.payload;
      case config.reset:
        return Object.assign({}, initialState);

      case config.createItem:
        if (!state.items) {
          return Object.assign({}, state, {items: [action.payload]});
        }
        return Object.assign({}, state, {items: [...state.items, action.payload]});

      case config.updateItem:
        if (!state.items) {
          return state;
        }
        return Object.assign({}, state, {
          items: state.items.map(item => {
            if (item.id === action.payload.id) {
              return {...item, ...action.payload.data};
            }
            return item;
          })
        });

      case config.removeItem:
        if (!state.items) {
          return state;
        }
        return Object.assign({}, state, {
          items: state.items.filter(item => item.id !== action.payload.id)
        });

      case config.updateTotals:
        return Object.assign({}, state, {
          sub_total: action.payload.sub_total,
          taxes: action.payload.taxes,
          amount_due: action.payload.amount_due,
          total_amount: action.payload.total_amount
        });

      default:
        return state;
    }
  };
  return dataReducer;
}

export function createFinanceReducer<T, T1 extends {items?: any[]}>(config: IDataReducerConfig, blankData: T1) {
  const dataReducer = createFinanceDataReducer<T1>(blankData as T1, config);
  return reduxWrap<T>({
    load: config.load,
    loadComplete: config.loadComplete,
    reset: config.reset,
    error: config.error,
    customReducers: {
      data: dataReducer
    }
  });
}

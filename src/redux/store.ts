import {ThunkMiddleware} from 'redux-thunk';
import {AnyAction, applyMiddleware, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import {IAppState} from './index';
import reducers from './index';
import {createLogger} from 'redux-logger';

const middlewares = [thunk as ThunkMiddleware<IAppState, AnyAction>];

if (process.env.NODE_ENV === `development`) {
  const loggerMiddleware = createLogger({
    level: 'info',
    collapsed: true
  });
  middlewares.push(loggerMiddleware);
}

export const store = createStore(reducers, composeWithDevTools(applyMiddleware(...middlewares)));

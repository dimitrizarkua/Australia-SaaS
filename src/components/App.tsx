import * as React from 'react';
import {connect} from 'react-redux';
import AppLayout from './AppLayout/AppLayout';
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom';
import LoginPage from './LoginPage/LoginPage';
import {IAppState} from 'src/redux';
import {IUser} from 'src/models/IUser';
import {updateCurrentUser} from 'src/redux/userDucks';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import Office365SuccessPage from './LoginPage/Office365SuccessPage';
import {initEcho} from 'src/utility/Echo';
import SessionStorageService, {Key} from 'src/services/SessionStorageService';
import {setUpStorage} from 'src/services/StorageService';

export interface IProps {
  user: IUser | null;
  dispatch: ThunkDispatch<unknown, unknown, Action>;
}

interface IState {
  isLoading: boolean;
}

class App extends React.Component<IProps, IState> {
  public state = {isLoading: true};

  public componentDidMount() {
    this.setState({isLoading: true});
    setUpStorage().then(() => {
      if (!SessionStorageService.getItem(Key.access_token)) {
        return this.handleUserLoad();
      }
      initEcho();
      this.props
        .dispatch(updateCurrentUser())
        .then(this.handleUserLoad)
        .catch(this.handleUserLoad);
    });
  }

  private handleUserLoad = () => {
    this.setState({isLoading: false});
  };

  public render() {
    const {user} = this.props;
    if (this.state.isLoading) {
      return 'Loading...';
    }

    return (
      <BrowserRouter>
        <Switch>
          {user ? <Route path="/" component={AppLayout} /> : <Route exact={true} path="/login" component={LoginPage} />}
          <Route path="/office365-success" component={Office365SuccessPage} />
          <Redirect to="/login" />
        </Switch>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({user: state.user.me});

export default connect(mapStateToProps)(App);

export const InternalApp = App;

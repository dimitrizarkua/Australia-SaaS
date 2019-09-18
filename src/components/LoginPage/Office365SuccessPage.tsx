import * as React from 'react';
import {RouteComponentProps, RouteProps, withRouter} from 'react-router-dom';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import * as qs from 'qs';
import AuthService from 'src/services/AuthService';
import {updateCurrentUser} from 'src/redux/userDucks';
import {ThunkDispatch} from 'redux-thunk';
import {ToastContainer} from 'react-toastify';

interface IProps {
  dispatch: ThunkDispatch<unknown, unknown, Action>;
}

class Office365SuccessPage extends React.PureComponent<RouteComponentProps<{}> & IProps> {
  public async componentDidMount() {
    const responseParams = qs.parse(this.props.location.hash.slice(1));
    try {
      await AuthService.loginWithOffice365(responseParams.access_token);
      this.props.dispatch(updateCurrentUser());
    } catch (err) {
      setTimeout(() => this.props.history.push('/login'), 1000);
    }
  }

  public render() {
    return (
      <div>
        <ToastContainer />
        Wait...
      </div>
    );
  }
}

export default compose<React.ComponentClass<RouteProps>>(
  connect(),
  withRouter
)(Office365SuccessPage);

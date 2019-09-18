import * as React from 'react';
import {RouteComponentProps, RouteProps, withRouter} from 'react-router-dom';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import LoginForm, {ILoginFormValues} from './LoginForm';
import Typography from 'src/constants/Typography';
import AuthService from 'src/services/AuthService';
import {updateCurrentUser} from 'src/redux/userDucks';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';

interface IProps {
  dispatch: ThunkDispatch<unknown, unknown, Action>;
}

interface IState {
  error: boolean;
  loading: boolean;
}

const Layout = styled.div`
  background: ${ColorPalette.gray1};
  height: 100%;
`;
const FormContainer = styled.div`
  background: ${ColorPalette.white};
  border: 1px solid ${ColorPalette.gray2};
  border-radius: 4px;
  padding: 33px 0;
`;
const HeaderH1 = styled.h1`
  font-size: 22px;
  text-align: center;
  padding: 55px;
  font-weight: normal;
`;
const ErrorMessage = styled.div`
  color: ${ColorPalette.red1};
  font-weight: ${Typography.weight.bold};
  height: 1rem;
`;

class LoginPage extends React.PureComponent<RouteComponentProps<{}> & IProps, IState> {
  public state = {
    error: false,
    loading: false
  };

  private handleSubmit = async (values: ILoginFormValues) => {
    let response;

    this.setState({loading: true});

    try {
      response = await AuthService.login(values.login, values.password);
      if (response.access_token) {
        await this.props.dispatch(updateCurrentUser());
      } else {
        this.setState({loading: false});
        throw response;
      }
    } catch (e) {
      console.warn(e);
      this.setState({
        error: true,
        loading: false
      });
    }
    return response;
  };

  public render() {
    const {loading} = this.state;

    return (
      <Layout>
        <div className="container h-100">
          <div className="row justify-content-center h-100">
            <div className="col col-lg-8">
              <HeaderH1>
                <strong>Steamatic</strong> NIS
              </HeaderH1>
              <FormContainer className="row">
                <div className="col border-right p-4" />
                <div className="col p-4">
                  {loading && <BlockLoading size={40} color={ColorPalette.white} />}
                  <LoginForm onSubmit={this.handleSubmit} />
                  <ErrorMessage>{this.state.error ? 'Invalid login or password' : ''}</ErrorMessage>
                </div>
              </FormContainer>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

export default compose<React.ComponentClass<RouteProps>>(
  connect(),
  withRouter
)(LoginPage);

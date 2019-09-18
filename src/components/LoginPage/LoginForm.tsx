import * as React from 'react';
import {reduxForm, InjectedFormProps, Field} from 'redux-form';
import Input from 'src/components/Form/Input';
import Password from 'src/components/Form/Password';
import styled from 'styled-components';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import Typography from 'src/constants/Typography';
import {required} from 'src/services/ValidationService';
import * as qs from 'qs';
import ColorPalette from 'src/constants/ColorPalette';

const LoginHeader = styled.div`
  font-size: ${Typography.size.medium};
`;

const Or = styled.div`
  margin: 30px 0 20px;
  text-align: center;
  color: ${ColorPalette.gray3};
`;

const Office365Link = styled.a`
  border-color: ${ColorPalette.blue2};
  color: ${ColorPalette.blue2};

  :hover {
    border-color: ${ColorPalette.blue3};
    background: ${ColorPalette.blue3};
  }
`;

export interface ILoginFormValues {
  login: string;
  password: string;
}

class LoginForm extends React.PureComponent<InjectedFormProps<ILoginFormValues>> {
  private getOffice365Link() {
    const params = {
      client_id: process.env.REACT_APP_OFFICE_365_CLIENT_ID,
      response_type: 'token',
      redirect_uri: encodeURI(window.location.href.replace('login', 'office365-success')),
      scope: 'user.read',
      response_mode: 'fragment'
    };
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${qs.stringify(params)}`;
  }

  public render() {
    const {submitting} = this.props;
    return (
      <div className="row login-form-wrapper mb-5">
        <div className="col">
          <div className="row mb-3">
            <LoginHeader className="col">Log in</LoginHeader>
          </div>
          <form onSubmit={this.props.handleSubmit}>
            <div>
              <Field
                name="login"
                placeholder="Email address"
                component={Input}
                disabled={submitting}
                validate={required}
              />
              <Field
                name="password"
                placeholder="Password"
                component={Password}
                disabled={submitting}
                validate={required}
              />
            </div>
            <div className="row d-flex h-100">
              <div className="col-lg-3 justify-content-center align-self-center">
                <PrimaryButton type="submit" className="btn py-2 px-3" disabled={submitting}>
                  Log in
                </PrimaryButton>
              </div>
              <div className="col-lg-9 justify-content-center align-self-center">
                <a href="#">Forgot your password?</a>
              </div>
            </div>
            <div className="text-center">
              <Or>OR</Or>
              <Office365Link className="btn btn-outline-primary" href={this.getOffice365Link()}>
                Sign-in with Office 365
              </Office365Link>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default reduxForm<ILoginFormValues>({
  form: 'LoginForm'
})(LoginForm);

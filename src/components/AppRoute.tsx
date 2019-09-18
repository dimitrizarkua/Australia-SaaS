import * as React from 'react';
import {Redirect, Route, RouteComponentProps, RouteProps} from 'react-router';
import {IUser} from 'src/models/IUser';
import Permission from 'src/constants/Permission';
import UserContext, {IUserContext} from './AppLayout/UserContext';

type IAbstractFunction = (...arg: any[]) => boolean;
type PermissionFunction = (fn: IAbstractFunction) => boolean;

interface IProps extends RouteProps {
  permission: Permission | PermissionFunction;
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
}

export interface IAppRouteProps {
  user: IUser | null;
}

class AppRoute extends React.PureComponent<IProps, {}, IUserContext> {
  public static contextType = UserContext;

  private get isAllowAccess(): boolean {
    const {permission} = this.props;
    switch (typeof permission) {
      case 'function':
        return (permission as PermissionFunction)(this.context.has);
      default:
        return this.context.has(permission);
    }
  }

  public render() {
    const {component, exact, path} = this.props;

    if (this.isAllowAccess) {
      return <Route exact={exact} path={path} component={component} />;
    }
    return <Redirect to="/unauthorized" />;
  }
}

export default AppRoute;

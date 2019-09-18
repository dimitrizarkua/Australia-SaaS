import React from 'react';
import {Redirect, RouteComponentProps, Switch, withRouter} from 'react-router';
import styled from 'styled-components';
import ManageSidebar from './ManageSidebar';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import AppRoute from 'src/components/AppRoute';
import TagPage from './Tag/TagPage';
import UsersPage from './User/UsersPage';
import LocationPage from './Location/LocationPage';
import ContractPage from './Contract/ContractPage';
import UserDetailPage from './User/UserDetailPage';
import Permission, {
  ContractsPermission,
  LocationsPermissions,
  TagsPermission,
  UsersPermission
} from 'src/constants/Permission';

interface IParams {
  section: string;
}

const ManageHeader = styled.div`
  border-bottom: 1px solid ${ColorPalette.gray2};
  padding: 10px 20px;
  font-weight: ${Typography.weight.bold};
  font-size: ${Typography.size.medium};
  color: ${ColorPalette.blue6};
`;

const ScrollableContainer = styled.div`
  overflow-y: auto;
  min-height: 100%;
`;

const PageContent = styled.div`
  padding: 30px;
  position: relative;
  min-height: 100%;
`;

class ManageLayout extends React.PureComponent<RouteComponentProps<IParams>> {
  private isAllowAccess = (permissionsGroup: Permission[]) => (allowFn: (a: Permission) => boolean): boolean => {
    return permissionsGroup.some(perm => allowFn(perm));
  };

  public render() {
    const currentSection = this.props.match.path;
    const currentSubSection = this.props.location.pathname.split('/')[2];
    return (
      <div className="h-100 d-flex flex-column">
        <ManageHeader>Manage</ManageHeader>
        <div className="d-flex h-100">
          <ManageSidebar activeLink={currentSubSection} />
          <ScrollableContainer className="h-100 w-100">
            <PageContent className="d-flex">
              <Switch>
                <AppRoute
                  exact={true}
                  path={`${currentSection}/user`}
                  permission={this.isAllowAccess([Permission.USERS_VIEW])}
                  component={UsersPage}
                />
                <AppRoute
                  path={`${currentSection}/user/:id`}
                  permission={this.isAllowAccess(UsersPermission)}
                  component={UserDetailPage}
                />
                <AppRoute
                  path={`${currentSection}/tag`}
                  permission={this.isAllowAccess(TagsPermission)}
                  component={TagPage}
                />
                <AppRoute
                  path={`${currentSection}/location`}
                  permission={this.isAllowAccess(LocationsPermissions)}
                  component={LocationPage}
                />
                <AppRoute
                  path={`${currentSection}/contract`}
                  permission={this.isAllowAccess(ContractsPermission)}
                  component={ContractPage}
                />
                <Redirect to={`${currentSection}/user`} />
              </Switch>
            </PageContent>
          </ScrollableContainer>
        </div>
      </div>
    );
  }
}

export default withRouter(ManageLayout);

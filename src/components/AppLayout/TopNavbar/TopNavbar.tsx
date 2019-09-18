import * as React from 'react';
import Icon, {IconName} from 'src/components/Icon/Icon';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {Link, matchPath, RouteComponentProps, withRouter} from 'react-router-dom';
import classnames from 'classnames';
import UserAvatar from './UserAvatar';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {IUserState, updateCurrentUserNotifications} from 'src/redux/userDucks';
import {ThunkDispatch} from 'redux-thunk';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ReactTooltip from 'react-tooltip';
import {css} from 'glamor';
import NotificationsDropdown from './NotificationsDropdown';
import {IUserNotification} from 'src/models/INotification';
import DropdownMenuControl from 'src/components/Layout/MenuItems/DropdownMenuControl';
import Dropdown, {IMenuProps, ITriggerProps} from 'src/components/Dropdown/Dropdown';
import withoutProps from 'src/components/withoutProps/withoutProps';

export interface IRouteItem {
  name: string;
  path: string;
  isActive?: () => boolean;
}

export interface IRoute extends IRouteItem {
  name: string;
  path: string;
  items?: IRouteItem[][];
}

interface IProps {
  routes: IRoute[];
}

interface IConnectProps {
  user: IUserState;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  loading: boolean;
  showNotifications: boolean;
}

const Navbar = styled.nav`
  background: ${ColorPalette.menu};
  height: 55px;
  padding: 0 15px;
`;

const UserIcon = styled(Icon)`
  cursor: pointer;

  path,
  circle,
  line {
    stroke: ${ColorPalette.white};
    fill: none;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
`;

const NotificationIndicator = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  right: 1px;
  top: 1px;
  border-radius: 9px;
  border: 1.1px solid ${ColorPalette.white};
  background: ${ColorPalette.red1};
`;

const whiteDropdown = css({
  '& .dropdown-menu': {
    border: `0`,
    background: 'transparent',
    padding: '0'
  }
});

const ColoredLink = styled(withoutProps(['active'])(Link))<{
  active: boolean;
}>`
  color: ${props => (props.active ? ColorPalette.white : ColorPalette.gray2)};
  :hover {
    color: ${ColorPalette.white};
  }
`;

class TopNavbar extends React.PureComponent<RouteComponentProps<{}> & IProps & IConnectProps, IState> {
  public state = {
    loading: false,
    showNotifications: false
  };

  public componentDidMount() {
    const {dispatch} = this.props;

    dispatch(updateCurrentUserNotifications());
  }

  private isRouteItemActive = (route: IRouteItem) => {
    return route.isActive ? route.isActive() : matchPath(this.props.location.pathname, {path: route.path});
  };

  private renderNotificationMenu = (props: IMenuProps) => (
    <NotificationsDropdown closeDropDown={props.close} notifications={this.props.user.userNotifications.data.data} />
  );

  private getUnreadNotifications = (): IUserNotification[] => {
    const {
      user: {
        userNotifications: {data}
      }
    } = this.props;

    return data.data.filter((n: IUserNotification) => !n.deleted_at);
  };

  private renderDropdownTrigger = (route: IRoute) => (props: ITriggerProps) => {
    return (
      <ColoredLink
        to="#"
        active={!!this.isRouteItemActive(route)}
        className="nav-link"
        onClick={props.toggle}
        style={{cursor: 'pointer'}}
      >
        {route.name}
      </ColoredLink>
    );
  };

  private renderDropdownItems = (route: IRoute) => (props: IMenuProps) => {
    return (
      <>
        {route.items!.map((group, index) => (
          <React.Fragment key={index}>
            {index !== 0 && <div className="dropdown-divider" />}
            {group.map(item => {
              const className = classnames('dropdown-item', {active: this.isRouteItemActive(item)});
              return (
                <Link key={item.path} to={item.path} className={className} onClick={props.close}>
                  {item.name}
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </>
    );
  };

  public render() {
    const {
      routes,
      user: {
        userNotifications: {data, loading}
      }
    } = this.props;
    const unreadNotificationsLength = this.getUnreadNotifications().length;

    return (
      <Navbar className="navbar navbar-expand-lg navbar-dark fixed-top justify-content-between flex-nowrap">
        <div className="h-100 d-flex align-items-center flex-nowrap">
          {routes.map(route => (
            <div key={route.path}>
              {route.items ? (
                <Dropdown trigger={this.renderDropdownTrigger(route)} menu={this.renderDropdownItems(route)} />
              ) : (
                <ColoredLink active={!!this.isRouteItemActive(route)} to={route.path} className="nav-link">
                  {route.name}
                </ColoredLink>
              )}
            </div>
          ))}
        </div>
        <div className="d-flex align-items-center h-100">
          <DropdownMenuControl
            direction="right"
            className={`${whiteDropdown}`}
            trigger={() => (
              <IconWrapper>
                {loading && <BlockLoading size={30} color={ColorPalette.menu} />}
                {data.data.length > 0 && (
                  <ReactTooltip className="overlapping" id="user-notifications" place="left" effect="solid" />
                )}
                {unreadNotificationsLength > 0 && <NotificationIndicator />}
                <UserIcon
                  name={IconName.Notification}
                  data-tip={
                    data.data &&
                    (unreadNotificationsLength > 0
                      ? `You have ${
                          unreadNotificationsLength > 9 ? 'more than ' : ''
                        }${unreadNotificationsLength} unread notification${unreadNotificationsLength > 1 ? 's' : ''}`
                      : '')
                  }
                  data-for="user-notifications"
                  size={20}
                />
              </IconWrapper>
            )}
            renderInternal={this.renderNotificationMenu}
          />
          <IconWrapper>
            <UserIcon name={IconName.Search} size={20} />
          </IconWrapper>
          <UserAvatar />
        </div>
      </Navbar>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  user: state.user
});

export default compose<React.ComponentClass<IProps>>(
  withRouter,
  connect(mapStateToProps)
)(TopNavbar);

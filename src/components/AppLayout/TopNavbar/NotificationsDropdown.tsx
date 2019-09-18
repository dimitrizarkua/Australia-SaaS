import * as React from 'react';
import {IUserNotification} from 'src/models/INotification';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import UserService from 'src/services/UserService';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {IUserState, updateCurrentUserNotifications} from 'src/redux/userDucks';
import {Action, compose} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import moment from 'moment';
import {BrowserNotification, onNotificationClickSwitcher} from 'src/utility/BrowserNotification';
import {getUserNames} from 'src/utility/Helpers';
import {FRONTEND_DATE_TIME} from 'src/constants/Date';
import {withRouter} from 'react-router';
import {RouteComponentProps} from 'react-router-dom';
import NotificationTransformer from 'src/transformers/NotificationTransformer';

interface IProps {
  notifications: IUserNotification[];
  closeDropDown: () => any;
}

interface IConnectProps {
  user: IUserState;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  loading: boolean;
}

const NotificationDropdownHolder = styled.div`
  width: 100%;
  position: relative;
  top: 0px;

  :before {
    content: '';
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 8px 8px 8px;
    border-color: transparent transparent ${ColorPalette.white} transparent;
    z-index: 99;
  }
`;

const NotificationDropdown = styled.div`
  width: 420px;
  position: absolute;
  overflow: hidden;
  right: -30px;
  top: 0;
  background: ${ColorPalette.white};
  color: ${ColorPalette.black0};
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
`;

const Upper = styled.div`
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid ${ColorPalette.gray2};

  & > .title {
    font-size: ${Typography.size.medium};
  }
`;

const Notification = styled.div`
  padding: 10px 20px;
  border-bottom: 1px solid ${ColorPalette.gray2};
  cursor: pointer;

  :hover {
    background: ${ColorPalette.gray0};
  }

  :last-child {
    border: 0;
  }
`;

const NotificationScroller = styled.div`
  overflow-y: auto;
  max-height: calc(100vh - 160px);
`;

const {Link, AvatarSquare, ColoredDiv} = StyledComponents;

class NotificationsDropdown extends React.PureComponent<RouteComponentProps<{}> & IProps & IConnectProps, IState> {
  public state = {
    loading: false
  };

  private showNotification = async (notification: IUserNotification) => {
    const parsedNotification = NotificationTransformer.hydrate(notification);
    const {dispatch, closeDropDown, history} = this.props;

    this.setState({loading: true});
    onNotificationClickSwitcher(parsedNotification, history)();
    closeDropDown();

    if (!notification.deleted_at) {
      await UserService.removeNotification(notification.id);
      await dispatch(updateCurrentUserNotifications());
    }

    this.setState({loading: false});
  };

  private showTheseAll = async () => {
    const {notifications} = this.props;

    notifications.forEach((notification: IUserNotification) => {
      const {
        body: {text: body}
      } = NotificationTransformer.hydrate(notification);

      BrowserNotification({
        body
      });
    });

    this.markAllAsRead();
  };

  private markAllAsRead = async () => {
    const {dispatch} = this.props;
    const promises: any[] = this.getUnreadNotifications().map((notification: IUserNotification) =>
      UserService.removeNotification(notification.id)
    );

    if (promises.length > 0) {
      this.setState({loading: true});
      await Promise.all(promises);
      await dispatch(updateCurrentUserNotifications());
      this.setState({loading: false});
    }
  };

  private getUnreadNotifications = (): IUserNotification[] => {
    const {notifications} = this.props;

    return notifications.filter((n: IUserNotification) => !n.deleted_at);
  };

  public render() {
    const {
      notifications,
      user: {
        userNotifications: {loading}
      }
    } = this.props;
    const {loading: ld} = this.state;
    const unreadNotificationsLength = this.getUnreadNotifications().length;

    return (
      <NotificationDropdownHolder className="d-flex justify-content-center">
        <NotificationDropdown>
          <Upper className="d-flex align-items-center justify-content-between">
            <div className="title">Notifications</div>
            <div className="d-flex align-items-center">
              <Link onClick={this.showTheseAll} margin="0 15px 0 0">
                Show all
              </Link>
              {unreadNotificationsLength > 0 && <Link onClick={this.markAllAsRead}>Mark all as read</Link>}
            </div>
          </Upper>
          <NotificationScroller>
            {notifications &&
              notifications.map((notification: IUserNotification) => {
                const {
                  body: {text, sender}
                } = NotificationTransformer.hydrate(notification);
                const userNames = getUserNames(sender);

                return (
                  <Notification
                    className="d-flex align-items-center"
                    onClick={() => this.showNotification(notification)}
                    key={notification.id}
                  >
                    <AvatarSquare
                      wh={35}
                      margin="0 20px 0 0"
                      backgroundColor={!sender ? 'transparent' : undefined}
                      backgroundUrl={sender && sender.avatar && sender.avatar.url}
                      fontSize={Typography.size.medium}
                    >
                      {!userNames.invalid && userNames.initials}
                    </AvatarSquare>
                    <div>
                      <ColoredDiv
                        weight={!notification.deleted_at ? Typography.weight.bold : Typography.weight.normal}
                        textOverflow="ellipsis"
                      >
                        {text}
                      </ColoredDiv>
                      <ColoredDiv color={ColorPalette.gray5} textOverflow="ellipsis">
                        {!userNames.invalid && `${userNames.full_name}, `}
                        {moment(notification.created_at).format(FRONTEND_DATE_TIME)}
                      </ColoredDiv>
                    </div>
                  </Notification>
                );
              })}
          </NotificationScroller>
          {(loading || ld) && <BlockLoading size={40} color={ColorPalette.white} />}
        </NotificationDropdown>
      </NotificationDropdownHolder>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  user: state.user
});

export default compose<React.ComponentClass<IProps>>(
  withRouter,
  connect(mapStateToProps)
)(NotificationsDropdown);

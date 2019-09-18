import * as React from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {IPushUser} from 'src/models/INotification';
import Typography from 'src/constants/Typography';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {ICurrentUser} from 'src/models/IUser';
import {compose} from 'redux';
import {getEcho} from 'src/utility/Echo';

interface IProps {
  channel: string;
}

interface IConnectProps {
  user: ICurrentUser;
}

interface IState {
  onlineUsers: IPushUser[];
}

const OnlineUsersHolder = styled.div`
  height: 0;
`;

const OnlineUser = styled.div<{avatar?: string}>`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: ${ColorPalette.gray1};
  background-image: url(${props => props.avatar || '***'});
  background-position: center;
  background-size: cover;
  color: ${props => (props.avatar ? 'transparent' : ColorPalette.gray5)};
  font-size: ${Typography.size.medium};
  font-weight: ${Typography.weight.bold};
  margin-left: 10px;
`;

class OnlineUsers extends React.PureComponent<IProps & IConnectProps, IState> {
  public state = {
    onlineUsers: []
  };

  public componentDidMount() {
    this.joinChannel();
  }

  public componentDidUpdate(prevProps: IProps) {
    const {channel} = this.props;

    if (channel !== prevProps.channel) {
      this.leaveChannel(prevProps.channel);
      this.joinChannel();
    }
  }

  public componentWillUnmount() {
    this.leaveChannel();
  }

  private joinChannel = () => {
    getEcho()
      .join(this.props.channel)
      .here((onlineUsers: IPushUser[]) => {
        this.setState({onlineUsers});
      })
      .joining((user: IPushUser) => {
        this.setState({onlineUsers: [...this.state.onlineUsers, user]});
        ReactTooltip.rebuild();
      })
      .leaving((user: IPushUser) => {
        const newUserList: IPushUser[] = this.state.onlineUsers.filter(
          (userOnline: IPushUser) => userOnline.id !== user.id
        );
        this.setState({onlineUsers: newUserList});
      });
  };

  private leaveChannel = (channel = this.props.channel) => {
    getEcho().leave(channel);
  };

  public render() {
    const {channel, user: userInfo} = this.props;
    const {onlineUsers} = this.state;
    const tooltipId = `tooltip-${channel}`;
    return (
      <>
        {onlineUsers.length > 0 && <ReactTooltip className="overlapping" id={tooltipId} place="left" effect="solid" />}
        <OnlineUsersHolder className="d-flex align-items-center">
          {onlineUsers
            .filter((user: IPushUser) => user.id !== userInfo.id)
            .map((user: IPushUser) => (
              <OnlineUser
                key={user.id}
                data-for={tooltipId}
                data-tip={user.full_name}
                avatar={user.avatar}
                className="d-flex align-items-center justify-content-center"
              >
                {user.full_name && user.full_name.split(' ')[0][0]}
                {user.full_name && user.full_name.split(' ')[1][0]}
              </OnlineUser>
            ))}
        </OnlineUsersHolder>
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({user: state.user.me});

export default compose<React.ComponentClass<IProps>>(connect(mapStateToProps))(OnlineUsers);

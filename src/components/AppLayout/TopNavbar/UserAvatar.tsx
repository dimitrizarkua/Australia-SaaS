import * as React from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import styled from 'styled-components';
import {IUserState} from 'src/redux/userDucks';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import {Action, compose} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {withRouter, RouteComponentProps} from 'react-router';

interface IConnectProps {
  user: IUserState;
  dispatch: ThunkDispatch<any, any, Action>;
}

const Avatar = styled.label<{
  backgroundImage: string | null | undefined;
  active: boolean;
}>`
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background-color: ${ColorPalette.green0};
  background-image: url(${props => props.backgroundImage});
  background-size: cover;
  background-position: center;
  margin: 0 0 0 10px;
  text-transform: uppercase;
  justify-content: center;
  display: flex;
  align-items: center;
  color: ${ColorPalette.white};
  overflow: hidden;
  position: relative;
  cursor: ${props => (props.active ? 'pointer' : 'unset')};

  > input {
    opacity: 0;
    cursor: pointer;
    position: absolute;
    width: 100%;
    height: 100%;
  }
`;

class UserAvatar extends React.PureComponent<RouteComponentProps<{}> & IConnectProps> {
  private onClick = () => {
    const {history, user} = this.props;

    if (user.me) {
      history.push(`/manage/user/${user.me.id}`);
    }
  };

  public render() {
    const {user} = this.props;

    return (
      <UserContext.Consumer>
        {context => {
          const allow = context.has(Permission.USERS_VIEW);
          return (
            <Avatar
              backgroundImage={user.me && user.me.avatar && user.me.avatar.url}
              active={allow}
              onClick={allow ? this.onClick : undefined}
            >
              {user.me && !user.me.avatar && `${(user.me.first_name || ' ')[0]}${(user.me.last_name || ' ')[0]}`}
            </Avatar>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  user: state.user
});

export default compose<React.ComponentClass>(
  connect(mapStateToProps),
  withRouter
)(UserAvatar);

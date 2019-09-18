import React from 'react';
import styled from 'styled-components';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import UserProfileBox from 'src/components/AppLayout/ManageLayout/User/UserProfileBox';
import {getUserNames} from 'src/utility/Helpers';
import qs from 'qs';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import {debounce, omit} from 'lodash';
import {isEqual} from 'lodash';
import UserService from 'src/services/UserService';
import {RouteComponentProps, withRouter} from 'react-router';
import {IUser} from 'src/models/IUser';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';
import {Link} from 'react-router-dom';
import PageSizes from 'src/constants/PageSizes';
import Notify, {NotifyType} from 'src/utility/Notify';
import LoadingLayout from './LoadingLayout';
import {IControlledRequest} from 'src/services/HttpService';

interface IUsersPageState {
  currentUserList: IUser[];
  isLoading: boolean;
}

type IUsersPageProps = RouteComponentProps<{}>;

const horizontalOffset = '15px';

const UsersPageTools = styled.div`
  margin-left: ${horizontalOffset}
  margin-right: ${horizontalOffset}
  margin-bottom: 40px;
  z-index: 3;
`;

const UserWrap = styled.div`
  margin-left: ${horizontalOffset}
  margin-right: ${horizontalOffset}
  align-content: flex-start;
`;

const UserWrapItem = styled(ScrollableContainer)`
  margin-bottom: 20px;
`;

const NotResult = styled.div`
  font-size: ${Typography.size.medium}
  color: ${ColorPalette.blue6}
  margin: 0 ${horizontalOffset}
`;

const LinkBox = styled(Link)`
  text-decoration: none !important;
`;

const defaultUserListConfig = {per_page: PageSizes.Huge};

class UsersPage extends React.PureComponent<IUsersPageProps, IUsersPageState> {
  public state: IUsersPageState = {
    currentUserList: [],
    isLoading: false
  };
  private inputRef = React.createRef<HTMLInputElement>();
  private currentRequest: AbortController | undefined;
  public componentDidMount() {
    this.setInitialSearchValue();
  }

  public componentDidUpdate({location: {search: prevSearch}}: IUsersPageProps) {
    const {
      location: {search: currentSearch}
    } = this.props;
    if (isEqual(currentSearch, prevSearch)) {
      return;
    }

    const {user} = qs.parse(currentSearch, {ignoreQueryPrefix: true});
    this.searchUsers(user);
  }

  public componentWillUnmount() {
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
  }

  private setInitialSearchValue() {
    const {user} = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});
    this.inputRef.current!.value = user || null;
    this.searchUsers(user);
  }

  private searchUsers = async (searchRequest: string | null) => {
    let userReq: IControlledRequest;
    const correctSearchRequest = searchRequest && searchRequest.trim();
    try {
      if (this.currentRequest) {
        this.currentRequest.abort();
      }
      this.setState({isLoading: true});
      if (searchRequest) {
        userReq = UserService.getSearchedUsers({name: correctSearchRequest as string}, defaultUserListConfig);
      } else {
        userReq = UserService.getUsersWithControl(defaultUserListConfig);
      }
      this.currentRequest = userReq.controller;
      const userResp = await userReq.promise;
      const userList = userResp.data;
      this.setState({isLoading: false, currentUserList: userList});
    } catch (e) {
      if (e.name === 'AbortError') {
        return;
      }
      this.setState({isLoading: false, currentUserList: []});
      Notify(NotifyType.Warning, 'Users can not be loaded');
    }
  };

  private redirectToSearch = (searchReq: string) => {
    const {history, location} = this.props;
    const pureString = searchReq.trim();
    const clearQueryString = location.search.slice(1);
    const oldestParams = qs.parse(clearQueryString, {ignoreQueryPrefix: true});
    if (!pureString) {
      // Get new search string without  user value
      const newUrl = clearQueryString.replace(/\b(user)=\b\w*\b(&?)/g, '');
      return history.push(`/manage/user?${newUrl}`);
    }
    const newParams = qs.stringify({...omit(oldestParams, ['user']), user: pureString});
    history.push(`/manage/user?${newParams}`);
  };

  private debouncedSearch = debounce(this.redirectToSearch, 500);

  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    this.debouncedSearch(e.target.value);
  };

  private renderUserWrap() {
    const {currentUserList} = this.state;

    if (!currentUserList.length) {
      return <NotResult>Users not found</NotResult>;
    }

    return currentUserList!.map((user: IUser) => (
      <UserWrapItem className="col-md-6 col-xl-3" key={user.id}>
        <LinkBox to={`/manage/user/${user.id}`}>
          <UserProfileBox photo={user.avatar_url as string} names={getUserNames(user)} />
        </LinkBox>
      </UserWrapItem>
    ));
  }

  public render() {
    return (
      <div className="d-flex flex-column flex-grow-1">
        <UsersPageTools className="d-flex">
          <div className="col-md-4 col-xl-3">
            <input
              type="text"
              className="form-control"
              ref={this.inputRef}
              onChange={this.handleChange}
              placeholder="Search..."
            />
          </div>
          <div className="col-md-4 col-xl-3">
            <PrimaryButton className="btn">New User</PrimaryButton>
          </div>
        </UsersPageTools>
        <UserWrap className="d-flex flex-wrap flex-grow-1">
          {this.state.isLoading && <LoadingLayout />}
          {this.renderUserWrap()}
        </UserWrap>
      </div>
    );
  }
}

export default withRouter(UsersPage);

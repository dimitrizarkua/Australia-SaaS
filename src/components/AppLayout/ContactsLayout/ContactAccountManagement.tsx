import * as React from 'react';
import styled from 'styled-components';
import ReferenceBarItem from 'src/components/ReferenceBar/ReferenceBarItem';
import {IUser} from 'src/models/IUser';
import {compose} from 'redux';
import UserService, {IMentionsUsersSuccess} from 'src/services/UserService';
import withData, {IResource} from 'src/components/withData/withData';
import {debounce} from 'lodash';
import ContactUserSearchControl from './ContactUserSearchControl';
import ContactService from 'src/services/ContactService';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import Notify, {NotifyType} from 'src/utility/Notify';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';

const AccountItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

const AddStaffItem = styled.div`
  margin-top: -15px;
  padding-bottom: 15px;
`;

const ActionLink = styled.div`
  cursor: pointer;
  color: ${ColorPalette.blue4};
  font-size: ${Typography.size.smaller};
`;

type IManageAccounts = IUser[] | undefined;

interface IProps {
  contactId: number;
  onUpdate: () => Promise<any>;
  managedAccounts: IManageAccounts;
  contactLoading: boolean;
}

interface IState {
  loading: boolean;
  value: IManageAccounts;
}

interface IWithDataProps {
  users: IResource<IMentionsUsersSuccess>;
}

enum AccountManagementActions {
  addUser = 'add',
  deleteUser = 'delete'
}

class ContactAccountManagement extends React.PureComponent<IProps & IWithDataProps, IState> {
  public state: IState = {
    loading: false,
    value: this.props.managedAccounts
  };

  private fetchDebounced = debounce(async name => await this.props.users.fetch(name), 350, {leading: true});

  private getSuggestions = async (name: string) => {
    await this.fetchDebounced(name);
    const mentions = this.props.users.data;
    return (
      (mentions &&
        mentions.data.map(mention => ({
          ...mention,
          name: `${mention.full_name}`
        }))) ||
      []
    );
  };

  private onClearUserSearch = () => {
    this.props.users.reset();
  };

  private addManageAcc = (user: IUser): Promise<IManageAccounts> => {
    const {value} = this.state;
    return ContactService.createManagedAccount(this.props.contactId, user.id).then(() => value && [...value, user]);
  };

  private deleteManageAcc(user: IUser): Promise<IManageAccounts> {
    const {value} = this.state;
    return ContactService.deleteManagedAccount(this.props.contactId, user.id).then(
      () => value && value.filter(el => el.id !== user.id)
    );
  }

  private handleChange = (actionType: AccountManagementActions) => (user: IUser) => {
    this.setState({loading: true});
    let action: Promise<IManageAccounts> = Promise.resolve(this.state.value);
    switch (actionType) {
      case AccountManagementActions.addUser:
        action = this.addManageAcc(user);
        break;
      case AccountManagementActions.deleteUser:
        action = this.deleteManageAcc(user);
        break;
    }
    action
      .then((newValue: IManageAccounts) => this.setState({value: newValue}))
      .catch(err => {
        Notify(NotifyType.Danger, err.error_message);
      })
      .finally(() => {
        this.props.onUpdate().then(() => this.setState({loading: false}));
      });
  };

  private handleDelete = this.handleChange(AccountManagementActions.deleteUser);

  private handleAdd = this.handleChange(AccountManagementActions.addUser);

  public render() {
    const {value: managedAccounts} = this.state;
    const {loading} = this.state;
    const mentionUsers = this.props.users.data && this.props.users.data.data;

    return (
      <ReferenceBarItem caption="Account Management" collapsable={false} overflow={'visible'}>
        {loading ? (
          <BlockLoading size={40} color={ColorPalette.white} />
        ) : (
          <>
            <AddStaffItem>
              <ContactUserSearchControl
                loading={this.props.users.loading}
                onSelect={this.handleAdd}
                onChangeSearch={this.getSuggestions}
                onClearSearch={this.onClearUserSearch}
                users={mentionUsers}
              />
            </AddStaffItem>
            {managedAccounts && managedAccounts.length > 0
              ? managedAccounts.map(a => (
                  <AccountItem key={a.id}>
                    <span>{a.full_name}</span>
                    <ActionLink onClick={() => this.handleDelete(a)}>remove</ActionLink>
                  </AccountItem>
                ))
              : ''}
          </>
        )}
      </ReferenceBarItem>
    );
  }
}

export default compose<React.ComponentClass<IProps>>(
  withData<IProps>({
    users: {
      fetch: (name: string) => UserService.searchUsers({name})
    }
  })
)(ContactAccountManagement);

export const InternalContactAccountManagement = ContactAccountManagement;

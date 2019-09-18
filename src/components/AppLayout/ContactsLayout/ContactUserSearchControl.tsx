import * as React from 'react';
import Dropdown, {ITriggerProps, IMenuProps} from 'src/components/Dropdown/Dropdown';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import {IMentionsUser} from 'src/models/IUser';
import UsersSearchControl from 'src/components/UsersSearchControl/UsersSearchControl';
import styled from 'styled-components';

const ActionLink = styled.div`
  cursor: pointer;
  color: ${ColorPalette.blue4};
  font-size: ${Typography.size.smaller};
`;

interface IProps {
  onSelect: (user: IMentionsUser) => any;
  onChangeSearch: (name: string) => any;
  onClearSearch: () => void;
  users?: IMentionsUser[];
  loading?: boolean;
}

class ContactUserSearchControl extends React.PureComponent<IProps> {
  private menuProps?: IMenuProps;

  private clearAndToggle = (props: ITriggerProps) => {
    if (!props.isExpanded) {
      this.props.onClearSearch();
    }
    props.toggle();
  };

  private onSelect = (user: IMentionsUser) => {
    this.props.onSelect(user);
    if (this.menuProps) {
      this.menuProps.close();
    }
    return Promise.resolve();
  };

  private renderUsersMenu = (menuProps: IMenuProps) => {
    this.menuProps = menuProps;
    const {loading, users} = this.props;

    return (
      <UsersSearchControl
        loading={loading}
        mentionsUsers={users}
        onSelectMentionsUser={this.onSelect}
        onChangeSearch={this.props.onChangeSearch}
        onClearSearch={this.props.onClearSearch}
      />
    );
  };

  private renderTrigger = (props: ITriggerProps) => {
    return <ActionLink onClick={() => this.clearAndToggle(props)}>Add staff</ActionLink>;
  };

  public render() {
    return <Dropdown trigger={this.renderTrigger} menu={this.renderUsersMenu} />;
  }
}

export default ContactUserSearchControl;

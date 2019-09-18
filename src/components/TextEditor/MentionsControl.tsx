import * as React from 'react';
import {IconName} from 'src/components/Icon/Icon';
import Dropdown, {IMenuProps, ITriggerProps} from 'src/components/Dropdown/Dropdown';
import UsersSearchControl from '../UsersSearchControl/UsersSearchControl';
import {IMentionsUser} from 'src/models/IUser';
import EditorControl from './EditorControl';

interface IProps {
  onSelect: (user: IMentionsUser) => any;
  onChangeSearch: (name: string) => any;
  onClearSearch: () => void;
  users?: IMentionsUser[];
  loading?: boolean;
}

class MentionsControl extends React.PureComponent<IProps> {
  private menuProps?: IMenuProps;

  private clearAndToggle = (props: ITriggerProps) => {
    if (!props.isExpanded) {
      this.props.onClearSearch();
    }
    props.toggle();
  };

  private renderTrigger = (props: ITriggerProps) => {
    return <EditorControl isActive={false} name={IconName.Mention} onClick={() => this.clearAndToggle(props)} />;
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

  public render() {
    return <Dropdown trigger={this.renderTrigger} menu={this.renderUsersMenu} />;
  }
}

export default MentionsControl;

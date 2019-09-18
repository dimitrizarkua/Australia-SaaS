import * as React from 'react';
import PageMenu, {ActionIcon} from 'src/components/Layout/PageMenu';
import TagsControl from 'src/components/Layout/MenuItems/TagsControl';
import {ITag, TagTypes} from 'src/models/ITag';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import ReactTooltip from 'react-tooltip';
import OnlineUsers from 'src/components/OnlineUsers/OnlineUsers';
import {default as Icon, IconName} from 'src/components/Icon/Icon';

export enum FinanceItemTypes {
  credit_note = 'credit_note',
  purchase_order = 'purchase_order',
  invoice = 'invoice'
}

interface IProps {
  type: FinanceItemTypes;
  channelName: string;
  otherActions: IMenuItem[];
  onTagClick: (tag: ITag) => any;
  onNoteAdd: (data?: any) => any;
  viewTagsPermission: boolean;
  addNotePermission: boolean;
}

interface IState {
  showApproveModal: boolean;
}

class FinanceItemTopMenu extends React.PureComponent<IProps, IState> {
  public state = {
    showApproveModal: false
  };

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public render() {
    const {channelName, otherActions, type, onTagClick, viewTagsPermission, addNotePermission, onNoteAdd} = this.props;

    return (
      <PageMenu className="d-flex align-items-center justify-content-between">
        <div>
          <ReactTooltip className="overlapping" id={`${TagTypes[type]}-menu-tooltip`} effect="solid" />
          <ActionIcon data-tip="Add note" data-for={`${TagTypes[type]}-menu-tooltip`} disabled={!addNotePermission}>
            <Icon name={IconName.AddNote} onClick={!addNotePermission ? undefined : onNoteAdd} />
          </ActionIcon>
          <TagsControl type={TagTypes[type]} onTagClick={onTagClick} disabled={!viewTagsPermission} />
          <DropdownMenuControl items={otherActions} disabled={!otherActions.length} />
        </div>
        <OnlineUsers channel={channelName} />
      </PageMenu>
    );
  }
}

export default FinanceItemTopMenu;

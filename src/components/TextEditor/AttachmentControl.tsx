import * as React from 'react';
import {IconName} from 'src/components/Icon/Icon';
import EditorControl from './EditorControl';
import DropdownMenuControl, {IMenuItem as IMItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';

enum MenuItemValues {
  uploadFromComputer
}

export interface IMenuItem {
  name: string;
  value: MenuItemValues;
}

interface IProps {
  onSelect: () => void;
}

class AttachmentControl extends React.PureComponent<IProps> {
  private renderTemplatesTrigger() {
    return <EditorControl isActive={false} name={IconName.Attachment} />;
  }

  private uploadingMenuItems: IMItem[] = [
    {
      name: 'Invoice',
      disabled: true
    },
    {
      name: 'Purchase Order',
      disabled: true
    },
    {
      type: 'divider'
    },
    {
      name: 'Assessment Reports',
      disabled: true
    },
    {
      name: 'Photos',
      disabled: true
    },
    {
      type: 'divider'
    },
    {
      name: 'From computer',
      onClick: this.props.onSelect
    }
  ];

  public render() {
    return <DropdownMenuControl trigger={this.renderTemplatesTrigger} items={this.uploadingMenuItems} />;
  }
}

export default AttachmentControl;

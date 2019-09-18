import * as React from 'react';
import {IconName} from 'src/components/Icon/Icon';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';

export interface IStatusMenuItem {
  id: number;
  name: string;
  disabled?: boolean;
  onClick?: () => any;
}

interface IProps {
  loading: boolean;
  statuses: IStatusMenuItem[];
  selectedStatus?: string;
  onStatusClick: (status: any) => any;
  type: 'job' | 'contact';
  disabled?: boolean;
}

class StatusControl extends React.PureComponent<IProps> {
  private handleStatusClick = async (el: any) => {
    if (!this.props.disabled) {
      await this.props.onStatusClick(el);
    }
  };

  private renderMenuItems = (): IMenuItem[] => {
    const {statuses, selectedStatus} = this.props;

    return statuses.map(
      (el: IStatusMenuItem) =>
        ({
          onClick: el.onClick ? el.onClick : () => this.handleStatusClick(el),
          name: el.name,
          classNames: el.name === selectedStatus ? 'active' : ''
        } as IMenuItem)
    );
  };

  public render() {
    const {disabled, statuses} = this.props;

    return (
      <DropdownMenuControl
        disabled={disabled || statuses.length === 0}
        iconName={IconName.Flag}
        tooltipId={`${this.props.type}-menu-tooltip`}
        tooltipHint="Status"
        items={this.renderMenuItems()}
      />
    );
  }
}

export default StatusControl;

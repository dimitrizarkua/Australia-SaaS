import * as React from 'react';
import Icon, {IconName} from 'src/components/Icon/Icon';
import {ActionIcon} from '../PageMenu';
import Dropdown, {IMenuProps, ITriggerProps} from 'src/components/Dropdown/Dropdown';
import DropdownMenuItem from './DropdownMenuItem';
import classnames from 'classnames';

interface IProps {
  className?: string;
  items?: IMenuItem[];
  iconName?: IconName;
  direction?: 'right' | 'left';
  noMargin?: boolean;
  disabled?: boolean;
  trigger?: () => React.ReactElement<unknown>;
  renderInternal?: (menuProps: IMenuProps) => React.ReactElement<unknown>;
  transparentDropdown?: boolean;
  tooltipId?: string;
  tooltipHint?: string;
}

export interface IMenuItem {
  name?: string;
  onClick?: (data?: any) => void | any;
  type?: 'divider' | 'header';
  disabled?: boolean;
  noClose?: boolean;
  customElements?: (menuProps: IMenuProps) => React.ReactElement<unknown>;
  classNames?: string;
  onOutsideClick?: () => any;
}

class DropdownMenuControl extends React.PureComponent<IProps> {
  private renderMenu = (menuProps: IMenuProps) => {
    const {items} = this.props;

    return (
      <>
        {items &&
          items.map((el, index) => {
            if (el.type === 'header') {
              return (
                <div key={index} className="dropdown-header">
                  {el.name}
                </div>
              );
            } else if (el.type === 'divider') {
              return <div key={index} className="dropdown-divider" />;
            } else {
              return (
                <DropdownMenuItem
                  key={index}
                  classNames={classnames(el.classNames, {disabled: el.disabled})}
                  onClick={
                    el.disabled
                      ? () => Promise.resolve()
                      : () => {
                          const promise = (el.onClick && el.onClick()) || Promise.resolve(true);

                          promise
                            .then(() => {
                              if (!el.noClose) {
                                menuProps.close();
                              }
                            })
                            .catch(() => {
                              menuProps.close();
                            });

                          return promise;
                        }
                  }
                >
                  {el.name || (el.customElements && el.customElements(menuProps)) || ''}
                </DropdownMenuItem>
              );
            }
            return null;
          })}
      </>
    );
  };

  private renderTrigger = (name: IconName) => {
    const {noMargin, trigger, disabled, tooltipId, tooltipHint} = this.props;
    const style = {
      marginRight: noMargin ? '0px' : '---',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'unset' : 'pointer'
    };

    return (triggerProps: ITriggerProps) => (
      <>
        {trigger ? (
          <div
            style={style}
            data-tip={tooltipHint}
            data-for={tooltipId}
            onClick={
              disabled
                ? undefined
                : e => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    e.nativeEvent.preventDefault();

                    triggerProps.toggle();
                  }
            }
          >
            {trigger()}
          </div>
        ) : (
          <ActionIcon
            style={style}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              e.nativeEvent.preventDefault();
              if (!disabled) {
                triggerProps.toggle();
              }
            }}
            data-tip={tooltipHint}
            data-for={tooltipId}
            disabled={disabled}
          >
            <Icon name={name} />
          </ActionIcon>
        )}
      </>
    );
  };

  private onOutsideClick = () => {
    const {items} = this.props;

    if (items) {
      items.forEach((item: IMenuItem) => {
        if (item.onOutsideClick) {
          item.onOutsideClick();
        }
      });
    }
  };

  public render() {
    const {iconName, direction, renderInternal, className, transparentDropdown} = this.props;

    return (
      <Dropdown
        onOutside={this.onOutsideClick}
        direction={direction}
        className={className}
        transparentDropdown={transparentDropdown}
        trigger={this.renderTrigger(iconName !== undefined ? iconName : IconName.MenuHorizontal)}
        menu={renderInternal || this.renderMenu}
      />
    );
  }
}

export default DropdownMenuControl;

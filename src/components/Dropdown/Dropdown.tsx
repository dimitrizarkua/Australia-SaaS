import * as React from 'react';
import classnames from 'classnames';
import onClickOutside, {HandleClickOutside, InjectedOnClickOutProps} from 'react-onclickoutside';
import styled from 'styled-components';

export interface ITriggerProps {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isExpanded: boolean;
}

export interface IMenuProps {
  close: () => void;
}

interface IProps {
  className?: string;
  trigger: (props: ITriggerProps) => React.ReactElement<unknown>;
  menu: (props: IMenuProps) => React.ReactElement<unknown> | string;
  onOutside?: () => void;
  direction?: 'right' | 'left';
  transparentDropdown?: boolean;
}

interface IState {
  isExpanded: boolean;
  isTooLong: boolean;
}

const DropdownMenu = styled.div<{
  direction: 'right' | 'left';
  transparent?: boolean;
  applyOverflow: boolean;
}>`
  position: absolute;
  min-width: 100%;
  padding: 0;
  overflow: ${props => (props.applyOverflow ? 'hidden' : 'visible')};
  ${props => (props.direction === 'right' ? 'right: 0px; left: inherit;' : '')};
  ${props =>
    props.transparent &&
    `
    background: transparent !important;
    border: 0 !important;
  `}
`;

const InnerWrapper = styled.div<{applyOverflow: boolean}>`
  ${props =>
    props.applyOverflow
      ? `
  max-height: 60vh;
  overflow: auto;
  `
      : ''}
  padding: 0.5rem 0;
`;

class Dropdown extends React.Component<IProps & InjectedOnClickOutProps, IState>
  implements HandleClickOutside<unknown> {
  public state = {
    isExpanded: false,
    isTooLong: false
  };

  public componentDidMount() {
    this.measureHeight();
  }

  public componentDidUpdate() {
    this.measureHeight();
  }

  private innerHeight: number = 0;

  private measureHeight = () => {
    if (this.refInner.current && this.state.isExpanded) {
      if (this.refInner.current.clientHeight !== this.innerHeight) {
        this.innerHeight = this.refInner.current.clientHeight;
        this.setState({isTooLong: this.refInner.current.clientHeight > window.innerHeight * 0.6});
      }
    }
  };

  private open = () => {
    this.setState({isExpanded: true});
  };

  private close = () => {
    this.setState({isExpanded: false});
  };

  private toggle = () => {
    this.state.isExpanded ? this.close() : this.open();
  };

  private handleClick = (e: any) => {
    e.stopPropagation();
  };

  public handleClickOutside = () => {
    if (this.state.isExpanded) {
      if (this.props.onOutside) {
        this.props.onOutside();
      }

      this.close();
    }
  };

  private refInner: React.RefObject<HTMLDivElement> = React.createRef();

  public render() {
    const {isExpanded, isTooLong} = this.state;
    const {direction, transparentDropdown} = this.props;

    return (
      <div
        className={classnames('dropdown d-inline-block', this.props.className, {show: isExpanded})}
        onClick={this.handleClick}
      >
        {this.props.trigger({isExpanded, open: this.open, close: this.close, toggle: this.toggle})}
        <DropdownMenu
          applyOverflow={isTooLong}
          transparent={transparentDropdown}
          direction={direction || 'left'}
          className={classnames('dropdown-menu', {show: isExpanded})}
        >
          <InnerWrapper applyOverflow={isTooLong}>
            <div ref={this.refInner}>{this.props.menu({close: this.close})}</div>
          </InnerWrapper>
        </DropdownMenu>
      </div>
    );
  }
}

export default onClickOutside<IProps>(Dropdown);

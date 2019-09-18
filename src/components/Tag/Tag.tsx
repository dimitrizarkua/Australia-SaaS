import * as React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';
import {HTMLAttributes} from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import withoutProps from 'src/components/withoutProps/withoutProps';
import {ITag} from 'src/models/ITag';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {colorTransformer} from 'src/utility/Helpers';
import cancelablePromiseHandler from 'src/utility/CancelablePromiseHandler';

interface IProps extends HTMLAttributes<unknown> {
  tag: ITag;
  onRemove?: (tag: ITag) => any;
  mode?: string; // 'outlined'
  onTagClick?: (tag: ITag) => any;
  notStatic?: boolean;
}

const StyledTag = styled(withoutProps(['color', 'mode', 'notStatic'])('span'))<{
  color: string;
  mode: string | undefined;
  notStatic?: boolean;
}>`
  font-size: ${Typography.size.smaller};
  font-weight: ${Typography.weight.normal};
  position: relative;
  padding: 0 5px;
  line-height: 20px;
  height: 20px;
  text-transform: uppercase;
  background: ${props => {
    if (!!props.color) {
      if (props.mode === 'outlined') {
        return ColorPalette.white;
      } else {
        return props.color;
      }
    } else {
      return ColorPalette.gray0;
    }
  }};
  color: ${props => {
    if (!!props.color) {
      if (props.mode === 'outlined') {
        return props.color;
      } else {
        return ColorPalette.white;
      }
    } else {
      return ColorPalette.black0;
    }
  }};
  box-shadow: ${props => (props.mode === 'outlined' ? `0 0 0 1px ${props.color} inset` : 'unset')};
  ${props => props.notStatic && 'cursor: pointer;'}
`;

const CloseButton = styled.span`
  cursor: pointer;
  color: ${ColorPalette.white};
  margin-left: ${Typography.size.small};
  font-size: 0.8em;
  vertical-align: top;
  height: 100%;
  display: inline-block;
`;

interface IState {
  loading: boolean;
}

class Tag extends React.PureComponent<IProps, IState> {
  public state = {
    loading: false
  };

  public componentWillUnmount() {
    this.asyncPromiseHandler.doCancel();
  }

  private asyncPromiseHandler = cancelablePromiseHandler();

  private convertColorValue = (): string => {
    const {tag} = this.props;
    const type = typeof tag.color;

    switch (type) {
      case 'number':
        return colorTransformer(tag.color as number);
      case 'string':
        return tag.color as string;
      default:
        return '';
    }
  };

  private asyncHandler = (func: () => any) => async () => {
    this.setState({loading: true});

    try {
      await this.asyncPromiseHandler.asyncHandler(func);
    } finally {
      if (!this.asyncPromiseHandler.isCancelled()) {
        this.setState({loading: false});
      }
    }
  };

  public render() {
    const {children, tag, className, color, onRemove, mode, notStatic, onTagClick, ...rest} = this.props;
    const {loading} = this.state;

    return (
      <StyledTag
        className={classnames('badge', className)}
        mode={mode}
        color={color || this.convertColorValue() || ColorPalette.black0}
        notStatic={notStatic}
        {...rest}
        onClick={onTagClick && this.asyncHandler(() => onTagClick(tag))}
      >
        {loading && <BlockLoading size={20} color={ColorPalette.white} />}
        {tag.name}
        {children}
        {onRemove && <CloseButton onClick={this.asyncHandler(() => onRemove(tag))}>&#x2715;</CloseButton>}
      </StyledTag>
    );
  }
}

export default Tag;

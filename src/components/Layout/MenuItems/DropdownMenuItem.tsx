import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import classnames from 'classnames';

interface IProps {
  onClick?: (data?: any) => Promise<any>;
  classNames?: string;
}

interface IState {
  loading: boolean;
}

const Link = styled.div`
  cursor: pointer;
  position: relative;
`;

const Item = styled.div`
  &.disabled {
    color: ${ColorPalette.gray2};
  }
`;

class DropdownMenuItem extends React.PureComponent<IProps, IState> {
  public state = {
    loading: false
  };

  public render() {
    const {loading} = this.state;
    const {onClick, children, classNames} = this.props;

    return (
      <Link>
        <Item
          className={classnames(classNames, 'dropdown-item')}
          onClick={e => {
            if (onClick) {
              this.setState({loading: true});

              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              e.nativeEvent.preventDefault();

              onClick()
                .then(() => {
                  this.setState({loading: false});
                })
                .catch(() => {
                  this.setState({loading: false});
                });
            }
          }}
        >
          {children}
        </Item>
        {loading && (
          <BlockLoading
            size={20}
            color={ColorPalette.white}
            onClick={e => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              e.nativeEvent.preventDefault();
            }}
          />
        )}
      </Link>
    );
  }
}

export default DropdownMenuItem;

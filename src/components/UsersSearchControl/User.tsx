import * as React from 'react';
import classnames from 'classnames';
import styled from 'styled-components';
import {HTMLAttributes} from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';

const Locations = styled.div`
  display: inline-block;
  padding-left: 5px;
  font-weight: ${Typography.weight.normal};
  color: ${ColorPalette.gray4};
`;

const UserName = styled.div`
  display: inline-block;
  margin-left: -15px;
  min-width: 120px;
`;

const Link = styled.div`
  cursor: pointer;
  position: relative;
`;

interface IProps extends HTMLAttributes<unknown> {
  firstName: string | null;
  lastName: string | null;
  locations?: string;
  onClick?: () => Promise<any>;
}

interface IState {
  loading: boolean;
}

class User extends React.PureComponent<IProps, IState> {
  public state = {
    loading: false
  };

  private handleClick = () => {
    if (this.props.onClick) {
      this.setState({loading: true});
      this.props.onClick().finally(() => this.setState({loading: false}));
    }
  };

  public render() {
    const {firstName, lastName, className, locations, ...rest} = this.props;
    const {loading} = this.state;

    return (
      <Link>
        <div className={classnames('dropdown-item', className)} onClick={this.handleClick} {...rest}>
          <UserName>
            <strong>{firstName}</strong> {lastName}
          </UserName>
          {locations && <Locations>{locations}</Locations>}
        </div>
        {loading && <BlockLoading size={20} color={ColorPalette.white} />}
      </Link>
    );
  }
}

export default User;

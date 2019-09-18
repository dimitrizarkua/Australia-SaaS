import * as React from 'react';
import classnames from 'classnames';
import styled from 'styled-components';
import {HTMLAttributes} from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import withoutProps from 'src/components/withoutProps/withoutProps';
import Typography from 'src/constants/Typography';

const Name = styled(withoutProps(['bold'])('div'))<{bold?: boolean}>`
  display: inline-block;
  margin-left: -15px;
  font-weight: ${props => props.bold && Typography.weight.bold};
`;

const Container = styled.div`
  cursor: pointer;
  position: relative;
`;

const LocationCode = styled.div`
  display: inline-block;
  margin-left: 12px;
  text-transform: uppercase;
  color: ${ColorPalette.gray4};
`;

interface IProps extends HTMLAttributes<unknown> {
  name: string;
  onItemClick?: () => Promise<any>;
  bold?: boolean;
  locationCode?: string;
}

interface IState {
  loading: boolean;
}

class UserOrTeam extends React.PureComponent<IProps, IState> {
  public state = {
    loading: false
  };

  private handleClick = async () => {
    if (this.props.onItemClick) {
      this.setState({loading: true});
      await this.props.onItemClick();
      this.setState({loading: false});
    }
  };

  public render() {
    const {name, className, bold, locationCode} = this.props;

    const {loading} = this.state;

    return (
      <Container>
        <div className={classnames('dropdown-item', className)} onClick={this.handleClick}>
          <Name bold={bold}>{name}</Name>
          {locationCode && <LocationCode>{locationCode}</LocationCode>}
        </div>
        {loading && <BlockLoading size={20} color={ColorPalette.white} />}
      </Container>
    );
  }
}

export default UserOrTeam;

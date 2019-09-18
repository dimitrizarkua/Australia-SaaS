import * as React from 'react';
import DropdownMenuControl from '../MenuItems/DropdownMenuControl';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import {IconName} from 'src/components/Icon/Icon';

const PlaceHolder = styled.span`
  color: ${ColorPalette.gray2};
`;

interface IProps {
  placeHolder?: string;
  items: any[];
  onChange: (data?: any) => void | any;
  nameRender: (name: any) => string;
  defaultValueById?: any;
  selectItemById?: any;
}

interface IState {
  selectedItem: any | null;
}

class ReportFilterDropdown extends React.PureComponent<IProps, IState> {
  public state: IState = {
    selectedItem: null
  };

  public componentDidMount() {
    const {defaultValueById, items} = this.props;
    if (defaultValueById) {
      const findItem = items.find(x => x.id === defaultValueById);
      if (findItem) {
        this.setState({selectedItem: findItem});
        this.props.onChange(findItem);
      }
    }
  }

  public componentDidUpdate(prevProps: IProps) {
    const {selectItemById, items} = this.props;

    if (prevProps.selectItemById !== selectItemById) {
      const findItem = items.find(x => x.id === selectItemById);
      if (findItem) {
        this.setState({selectedItem: findItem});
      }
    }
  }

  private triggerRender = () => {
    const {placeHolder, nameRender} = this.props;
    const {selectedItem} = this.state;

    return (
      <div style={{cursor: 'pointer'}}>
        {selectedItem ? nameRender(selectedItem) : <PlaceHolder>{placeHolder}</PlaceHolder>}
        <ColoredIcon style={{marginLeft: '20px'}} color={ColorPalette.white} name={IconName.ArrowDown} />
      </div>
    );
  };

  private dataSource = () => {
    const {items, onChange, nameRender} = this.props;

    return items.map((el: any) => ({
      name: nameRender(el),
      onClick: () => {
        this.setState({selectedItem: el});
        onChange(el);
      }
    }));
  };

  public render() {
    return <DropdownMenuControl direction="right" trigger={() => this.triggerRender()} items={this.dataSource()} />;
  }
}

export default ReportFilterDropdown;

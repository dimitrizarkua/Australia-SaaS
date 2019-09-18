import * as React from 'react';
import styled from 'styled-components';
import InlineSpinner from '../Placeholder/InlineSpinner';
import ColorPalette from 'src/constants/ColorPalette';
import Icon, {IconName} from 'src/components/Icon/Icon';
import withoutProps from 'src/components/withoutProps/withoutProps';

interface IProps {
  loading: boolean;
  onSearchValueChange(str: string): void;
  placeholder: string;
  focusOnMount?: boolean;
  mode?: 'typeGray';
  searchIcon?: boolean | undefined;
  disabled?: boolean;
  value?: string;
}

const SearchBox = styled.div`
  position: relative;

  input {
    padding-right: 30px;
  }
`;

const SearchSpinner = styled(InlineSpinner)`
  position: absolute;
  right: 7px;
  top: 8px;
`;

const SearchIcon = styled(Icon)`
  position: absolute;
  left: 12px;
  top: 8px;

  path,
  circle,
  line {
    stroke: ${ColorPalette.gray4};
  }
`;

const InputContainer = styled(withoutProps(['mode', 'searchIcon'])('div'))<{
  mode: string | undefined;
  searchIcon: boolean | undefined;
}>`
  input {
    background: ${props => (props.mode === 'typeGray' ? ColorPalette.gray1 : undefined)};
    border: ${props => (props.mode === 'typeGray' ? '0' : undefined)};
    padding-left: ${props => (props.searchIcon ? '42px' : undefined)};
  }
`;

class SearchInput extends React.PureComponent<IProps> {
  public state = {
    search: ''
  };

  public componentDidMount() {
    const {focusOnMount, value} = this.props;

    if (focusOnMount && this.input.current) {
      this.input.current.focus();
    }

    if (value) {
      this.setState({search: value});
    }
  }

  private input: React.RefObject<HTMLInputElement> = React.createRef();

  private handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    this.setState({search});
    this.props.onSearchValueChange(search);
  };

  public render() {
    const {loading, placeholder, mode, searchIcon, disabled} = this.props;
    return (
      <SearchBox>
        {searchIcon && <SearchIcon name={IconName.Search} size={18} />}
        <InputContainer mode={mode} searchIcon={searchIcon}>
          <input
            type="text"
            value={this.state.search}
            onChange={this.handleSearch}
            className="form-control"
            placeholder={placeholder}
            ref={this.input}
            disabled={disabled}
          />
        </InputContainer>
        {loading && <SearchSpinner size={18} />}
      </SearchBox>
    );
  }
}

export default SearchInput;

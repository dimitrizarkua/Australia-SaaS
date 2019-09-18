import * as React from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import commonSelectStyles from './commonSelectStyles';
import Select from 'react-select';

export interface IProps {
  value?: any;
  defaultValue?: any;
  options?: any[];
  onChange?: (option: any) => any;
  onBlur?: (e: any) => any;
  onFocus?: (e: any) => any;
  placeholder?: string;
  getOptionLabel?: (option: any) => string;
  getOptionValue?: (option: any) => string;
  isDisabled?: boolean;
  customStyles?: object;
  additionalStyles?: object;
  components?: object;
  isMulti?: boolean;
  isClearable?: boolean;
  className?: string;
}

class InlineSelect extends React.PureComponent<IProps> {
  private selectStyles = this.props.customStyles
    ? {
        ...commonSelectStyles,
        ...this.props.customStyles
      }
    : {
        ...commonSelectStyles,
        control: (base: React.CSSProperties, state: any) => ({
          ...base,
          minHeight: 'auto',
          maxHeight: this.props.isMulti ? 'inherit' : 33.5,
          background: ColorPalette.white,
          boxShadow: state.isFocused ? `0 0 0 0.2rem ${ColorPalette.bootstrap.boxShadow}` : 'none',
          borderColor: state.isFocused ? 'transparent' : ColorPalette.gray2,
          ':hover': {
            borderColor: state.isFocused ? 'transparent' : ColorPalette.gray2
          }
        }),
        dropdownIndicator: (base: React.CSSProperties) => ({
          ...base,
          padding: 3,
          display: this.props.isDisabled ? 'none' : base.display
        }),
        ...this.props.additionalStyles
      };

  public render() {
    return <Select {...this.props} styles={this.selectStyles} />;
  }
}

export default InlineSelect;

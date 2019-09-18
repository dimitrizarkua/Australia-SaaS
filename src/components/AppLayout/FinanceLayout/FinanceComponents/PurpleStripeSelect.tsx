import * as React from 'react';
import InlineSelect, {IProps as IInlineSelectProps} from 'src/components/Form/InlineSelect';
import ColorPalette from 'src/constants/ColorPalette';
interface IProps {
  withBorder?: boolean;
  transformValueById?: boolean;
}

export default React.memo((props: IInlineSelectProps & IProps) => {
  const {withBorder, transformValueById, value, options} = props;
  const purpleStripeSelectStyles = {
    container: (base: React.CSSProperties) => ({
      ...base,
      flexBasis: '200px',
      height: '50px',
      border: withBorder ? `1px solid ${ColorPalette.white}` : 'none',
      borderTop: 'none',
      borderBottom: 'none',
      paddingTop: '5px'
    }),
    singleValue: (base: React.CSSProperties) => ({
      ...base,
      background: 'transparent',
      color: ColorPalette.white
    }),
    control: (base: React.CSSProperties) => ({
      ...base,
      border: 'none',
      boxShadow: 'none',
      background: 'transparent',
      color: ColorPalette.white
    }),
    placeholder: (base: React.CSSProperties) => ({
      ...base,
      color: ColorPalette.gray2
    }),
    dropdownIndicator: (base: React.CSSProperties) => ({
      ...base,
      color: ColorPalette.gray2
    })
  };
  const resultValue = (transformValueById && options && options.find(el => el.id === value)) || value;
  return <InlineSelect {...props} value={resultValue} customStyles={purpleStripeSelectStyles} />;
});

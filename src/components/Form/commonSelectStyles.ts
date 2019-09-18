import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';

function setBgColor(state: any) {
  if (state.isFocused) {
    return ColorPalette.white;
  }

  if (state.isDisabled) {
    return ColorPalette.gray0;
  }

  return ColorPalette.gray1;
}

export default {
  container: (base: React.CSSProperties) => ({
    ...base,
    border: 'none',
    padding: 0
  }),
  menuList: (base: React.CSSProperties) => ({
    ...base,
    zIndex: 3
  }),
  control: (base: React.CSSProperties, state: any) => ({
    ...base,
    border: 'none',
    minHeight: 'auto',
    maxHeight: 33.5,
    background: setBgColor(state),
    boxShadow: state.isFocused ? `0 0 0 0.2rem ${ColorPalette.bootstrap.boxShadow}` : 'none'
  }),
  indicatorSeparator: (base: React.CSSProperties) => ({
    ...base,
    visibility: 'hidden'
  }),
  valueContainer: (base: React.CSSProperties) => ({
    ...base,
    border: 'none'
  }),
  input: (base: React.CSSProperties) => ({
    ...base,
    border: 'none'
  }),
  indicatorsContainer: (base: React.CSSProperties) => ({
    ...base,
    border: 'none'
  }),
  dropdownIndicator: (base: React.CSSProperties) => ({
    ...base,
    padding: 6
  }),
  clearIndicator: (base: React.CSSProperties) => ({
    ...base,
    padding: 6
  }),
  loadingIndicator: (base: React.CSSProperties) => ({
    ...base,
    padding: 6
  }),
  singleValue: (base: React.CSSProperties) => ({
    ...base,
    color: ColorPalette.gray5
  }),
  placeholder: (base: React.CSSProperties) => ({
    ...base,
    color: ColorPalette.gray4,
    fontWeight: Typography.weight.light
  })
} as any;

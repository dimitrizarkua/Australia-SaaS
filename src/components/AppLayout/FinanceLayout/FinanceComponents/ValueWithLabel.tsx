import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';

const delimiterBorderStyle = `1px solid ${ColorPalette.gray2}`;

const ValueLabelBlock = styled.div<{hasDelimiter?: boolean}>`
  label {
    font-size: ${Typography.size.normal};
    color: ${ColorPalette.gray5};
    text-transform: capitalize;
    line-height: 1.5;
  }
  max-width: 230px;
  min-height: 80px;
  min-width: 180px;
  font-size: ${Typography.size.big};
  line-height: 1;
  color: ${ColorPalette.black0};
  margin: 5px 60px 5px 0;
  padding: 5px 0 20px 0;
  border-bottom: ${props => (props.hasDelimiter ? delimiterBorderStyle : 'none')};
`;

const Arrow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
`;

const ArrowUp = styled(Arrow)`
  top: -10px;
  border: 5px solid transparent;
  border-bottom: 5px solid ${ColorPalette.green2};
`;

const ArrowDown = styled(Arrow)`
  top: -5px;
  border: 5px solid transparent;
  border-top: 5px solid ${ColorPalette.red1};
`;

const DeltaPercents = styled.div`
  display: inline-block;
  position: relative;
  line-height: 20px;
  margin-left: 10px;
  color: ${ColorPalette.gray4};
  font-size: ${Typography.size.smaller};
`;

interface IProps {
  value?: string | number;
  label?: string;
  hasDelimiter?: boolean;
  color?: string;
  delta?: number;
  reactTipProps?: any;
}

const ValueLabel: React.SFC<IProps> = (props: IProps) => {
  return (
    <ValueLabelBlock hasDelimiter={props.hasDelimiter}>
      <label {...props.reactTipProps}>{props.label || ''}</label>
      <div>
        <span style={{color: props.color || 'inherit'}}>{props.value}</span>
        {!!props.delta && (
          <DeltaPercents>
            {props.delta > 0 && <ArrowUp />}
            {props.delta < 0 && <ArrowDown />}
            {props.delta} %
          </DeltaPercents>
        )}
      </div>
    </ValueLabelBlock>
  );
};

export default React.memo(ValueLabel);

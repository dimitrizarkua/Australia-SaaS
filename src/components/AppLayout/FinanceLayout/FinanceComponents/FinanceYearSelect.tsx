import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import ColorPalette from 'src/constants/ColorPalette';
import Icon, {IconName} from 'src/components/Icon/Icon';
import PurpleStripeSelect from './PurpleStripeSelect';

const FINANCIAL_YEAR_START_MONTH = 6;
const FINANCE_YEARS_COUNT = 7;

const DropdownSelector = styled.div`
  padding-right: 10px;
  margin-top: -3px;
  path {
    stroke: ${ColorPalette.white};
  }
`;

interface IProps {
  onChange: (data: any) => void | Promise<any>;
}

const customDropdownIndicator = ({innerProps}: {innerProps: any}) => (
  <DropdownSelector>
    <Icon name={IconName.Calendar} />
  </DropdownSelector>
);

export default class FinanceYearSelect extends React.PureComponent<IProps> {
  private options: Array<{value: string; label: string}> = [];

  constructor(props: IProps) {
    super(props);
    const nextYearStarted = moment().month() >= FINANCIAL_YEAR_START_MONTH;
    const currentYear = moment().year() + (nextYearStarted ? 1 : 0);
    const options = [];
    for (let fy = currentYear; fy > currentYear - FINANCE_YEARS_COUNT; fy--) {
      options.push({
        label: `FY ${fy - 1} - ${fy}`,
        value: fy.toString()
      });
    }
    this.options = options;
  }

  public render() {
    return (
      <PurpleStripeSelect
        defaultValue={this.options[0]}
        options={this.options}
        onChange={this.props.onChange}
        components={{DropdownIndicator: customDropdownIndicator}}
      />
    );
  }
}

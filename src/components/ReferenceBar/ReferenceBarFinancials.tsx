import * as React from 'react';
import ReferenceBarItem from './ReferenceBarItem';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import styled from 'styled-components';
import {formatPrice} from 'src/utility/Helpers';

const SUCCESS_PROFIT_TRESHOLD = 55;

const FinancialsRow = styled.div`
  display: flex;
  .financiels-reference-label {
    flex-basis: 100%;
  }
`;

const TotalRow = styled(FinancialsRow)`
  margin: 8px 0;
  font-weight: ${Typography.weight.bold};
`;

const CaptionRow = styled(FinancialsRow)`
  line-height: 1.5;
  font-weight: ${Typography.weight.bold};
`;

const ProfitBar = styled(FinancialsRow)<{profit: number}>`
  display: flex;
  margin-top: 20px;
  padding: 5px 8px;
  border-radius: 5px;
  border: 2px solid ${props => (props.profit >= SUCCESS_PROFIT_TRESHOLD ? ColorPalette.green1 : ColorPalette.orange1)};
  background: ${props => (props.profit >= SUCCESS_PROFIT_TRESHOLD ? ColorPalette.green0 : ColorPalette.orange0)};
  font-weight: ${Typography.weight.bold};
`;

const Divider = styled.div`
  width: 100%;
  margin: 15px 0 10px;
  height: 1px;
  border-top: 1px solid ${ColorPalette.gray2};
`;

interface IProps {
  financials: any;
  loading?: boolean;
}

enum FinancialsFields {
  Labour = 'Labour',
  Equipment = 'Equipment',
  Materials = 'Materials',
  PO = 'PO',
  Required = 'Required',
  Budget = 'Budget',
  Used = 'Used',
  Remaining = 'Remaining',
  GrossProfit = 'GrossProfit'
}

class ReferenceBarFinancials extends React.PureComponent<IProps> {
  private static fields = {
    [FinancialsFields.Labour]: {label: 'Labour', key: 'labour', percents: true},
    [FinancialsFields.Equipment]: {label: 'Equipment', key: 'equipment', percents: true},
    [FinancialsFields.Materials]: {label: 'Materials', key: 'materials', percents: true},
    [FinancialsFields.PO]: {label: 'PO and Others', key: 'purchase_orders', percents: true},
    [FinancialsFields.Required]: {label: 'Required to meet GP', key: 'required', percents: false},
    [FinancialsFields.Budget]: {label: 'Budget', key: 'budget', percents: false},
    [FinancialsFields.Used]: {label: 'Used', key: 'used', percents: false},
    [FinancialsFields.Remaining]: {label: 'Remaining', key: 'remaining', percents: false},
    [FinancialsFields.GrossProfit]: {label: 'Gross Profit', key: 'used', percents: false}
  };

  private topValues = [
    FinancialsFields.Labour,
    FinancialsFields.Equipment,
    FinancialsFields.Materials,
    FinancialsFields.PO
  ];
  private budgetValues = [FinancialsFields.Used, FinancialsFields.Remaining];

  private renderLabelAndValue(field: FinancialsFields) {
    const {label, key, percents} = ReferenceBarFinancials.fields[field];
    const value = this.props.financials[key];
    return (
      <>
        <div className="financiels-reference-label">{label}</div>
        {value && <div className="financiels-reference-value">{this.formatValue(value, percents)}</div>}
      </>
    );
  }

  private formatValue(value: number, percents: boolean) {
    return percents ? `${value}%` : formatPrice(value);
  }

  private renderRows(fields: FinancialsFields[]) {
    return fields.map(field => <FinancialsRow key={`fnc-${field}`}>{this.renderLabelAndValue(field)}</FinancialsRow>);
  }

  public render() {
    const {grossProfit} = this.props.financials;
    return (
      <ReferenceBarItem caption="Financials" collapsable={true} defaultCollapsed={true}>
        {this.renderRows(this.topValues)}
        <TotalRow>{this.renderLabelAndValue(FinancialsFields.Required)}</TotalRow>
        <Divider />
        <CaptionRow>{this.renderLabelAndValue(FinancialsFields.Budget)}</CaptionRow>
        {this.renderRows(this.budgetValues)}
        <ProfitBar profit={grossProfit}>{this.renderLabelAndValue(FinancialsFields.GrossProfit)}</ProfitBar>
      </ReferenceBarItem>
    );
  }
}

export default ReferenceBarFinancials;

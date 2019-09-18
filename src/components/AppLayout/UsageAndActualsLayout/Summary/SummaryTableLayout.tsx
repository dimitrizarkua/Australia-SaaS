import * as React from 'react';
import {formatPrice} from 'src/utility/Helpers';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {IJobUsageSummary} from 'src/models/UsageAndActualsModels/IJobSummary';
import SummaryValueItem from './SummaryValueItem';
import UsageValueItem from './UsageValueItem';

const SummaryPanel = styled.div`
  background-color: ${ColorPalette.gray1};
  border: 1px solid ${ColorPalette.gray2};
  height: 100px;
`;

interface IProps {
  summary: IJobUsageSummary;
}

class SummaryTableLayout extends React.PureComponent<IProps> {
  public render() {
    const {
      summary: {remaining, gross_profit, labour_used, equipment_used, materials_used, po_and_other_used}
    } = this.props;

    return (
      <SummaryPanel className="d-flex flex-row">
        <div className="d-flex flex-row">
          <SummaryValueItem label="Total Costed" value={formatPrice(this.props.summary.total_costed, false)} />
          <SummaryValueItem label="Remaining" value={formatPrice(remaining, false)} showLeftBorder={true} />
          <SummaryValueItem
            label="Gross Profit"
            value={`${gross_profit ? Math.round(gross_profit) : '0'}%`}
            showLeftBorder={true}
          />
        </div>
        <div className="d-flex ml-auto">
          <UsageValueItem label="Labour" value={formatPrice(labour_used, false)} />
          <UsageValueItem label="Equipment" value={formatPrice(equipment_used, false)} />
          <UsageValueItem label="Materials" value={formatPrice(materials_used, false)} />
          <UsageValueItem label="PO, Other" value={formatPrice(po_and_other_used, false)} />
        </div>
      </SummaryPanel>
    );
  }
}

export default SummaryTableLayout;

import * as React from 'react';
import styled from 'styled-components';
import ReferenceBarItem from 'src/components/ReferenceBar/ReferenceBarItem';
import Typography from 'src/constants/Typography';

const Table = styled.table`
  width: 100%;
  table-layout: fixed;
`;

const Name = styled.td`
  text-align: left;
`;

const Value = styled.td`
  text-align: right;
`;

const Total = styled.tr`
  font-weight: ${Typography.weight.bold};
  td {
    padding-top: 20px;
  }
`;

interface IProps {
  receivables: any[];
  total: string;
  caption: string;
}

class ContactReceivables extends React.PureComponent<IProps> {
  public render() {
    return (
      <ReferenceBarItem caption={this.props.caption} collapsable={true}>
        <Table>
          <tbody>
            {this.props.receivables &&
              this.props.receivables.map(r => (
                <tr key={r.name}>
                  <Name>{r.name}</Name>
                  <Value>{r.value}</Value>
                </tr>
              ))}
            <Total>
              <Name>Total:</Name>
              <Value>{this.props.total}</Value>
            </Total>
          </tbody>
        </Table>
      </ReferenceBarItem>
    );
  }
}

export default ContactReceivables;

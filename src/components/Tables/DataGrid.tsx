import * as React from 'react';
import {IColumn} from 'src/components/Tables/IColumn';
import {DataGridCell} from './DataGridCell';
import {DataGridHeader} from './DataGridHeader';

interface IProps {
  columnsDefinition: Array<IColumn<any>>;
  dataSource: any[];
  useCustomStyle?: boolean;
}

class DataGrid extends React.PureComponent<IProps> {
  private renderBodyRows() {
    const {columnsDefinition, dataSource} = this.props;

    return dataSource.map((item: any) => (
      <tr key={item.id}>
        {columnsDefinition.map(c => (
          <DataGridCell key={c.id} width={c.width} hidden={c.hidden} align={c.type}>
            {c.cell(item)}
          </DataGridCell>
        ))}
      </tr>
    ));
  }

  private renderNodata() {
    const {columnsDefinition} = this.props;
    return (
      <tr>
        <td className="no-items" colSpan={columnsDefinition.length}>
          No items found
        </td>
      </tr>
    );
  }

  private renderTHead() {
    const {columnsDefinition} = this.props;
    return (
      <thead>
        <tr>
          {columnsDefinition.map(c => (
            <DataGridHeader key={c.id} width={c.width} hidden={c.hidden} align={c.type}>
              {c.header}
            </DataGridHeader>
          ))}
        </tr>
      </thead>
    );
  }

  private renderTBody() {
    const {dataSource} = this.props;
    return <tbody>{dataSource && dataSource.length > 0 ? this.renderBodyRows() : this.renderNodata()}</tbody>;
  }

  public render() {
    const {useCustomStyle} = this.props;
    return (
      <>
        {useCustomStyle ? (
          <>
            {this.renderTHead()}
            {this.renderTBody()}
          </>
        ) : (
          <table className="table">
            {this.renderTHead()}
            {this.renderTBody()}
          </table>
        )}
      </>
    );
  }
}

export default DataGrid;

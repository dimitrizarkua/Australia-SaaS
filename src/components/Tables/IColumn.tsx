export enum ColumnType {
  Text = 'left',
  Numeric = 'right'
}

export interface IColumn<T> {
  id: string;
  header?: string | React.ReactElement<any>;
  width?: string;
  type?: ColumnType;
  className?: string;
  hidden?: boolean;
  cell: (item: T) => React.ReactElement<any>;
}

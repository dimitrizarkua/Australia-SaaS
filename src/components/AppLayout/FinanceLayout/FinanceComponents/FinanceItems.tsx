import * as React from 'react';
import {IFinanceEntityItem} from 'src/models/FinanceModels/ICommonFinance';
import Icon, {IconName} from 'src/components/Icon/Icon';
import InputTable from 'src/components/Tables/InputTable';
import styles from './FinanceItems.module.css';
import InlineSelect from 'src/components/Form/InlineSelect';
import FinanceSummary from 'src/components/AppLayout/FinanceLayout/FinanceComponents/FinanceSummary';
import {IAppState} from 'src/redux';
import {connect} from 'react-redux';
import {formatPrice} from 'src/utility/Helpers';
import {IGLAccount, IGSCode, ITaxRate} from 'src/models/IFinance';
import {loadGLAccounts, selectGlAccounts} from 'src/redux/financeDucks';
import {debounce} from 'lodash';
import FinanceService from 'src/services/FinanceService';
import {normalizePositeveInt, normalizeReal, normalizePercents} from 'src/utility/Normalizers';

export enum FinanceEntity {
  invoice = 'invoice',
  purchaseOrder = 'purchase_order',
  creditNote = 'credit_note'
}

interface IOwnProps {
  entity: any;
  entityType?: FinanceEntity;
  disabled: boolean;
  onCreate: () => any;
  onRemove: (id: number | string) => any;
  onChange: (id: number | string, data: any) => any;
  onSubmit: (id: number | string) => any;
}

interface IConnectProps {
  glAccounts: IGLAccount[];
  taxRates: ITaxRate[];
  gsCodes: IGSCode[];
  dispatch: (params?: any) => Promise<any> | void;
}

interface IColumn {
  id: string;
  className?: string;
  header: string;
  cell: (item: IFinanceEntityItem) => React.ReactElement<any>;
}

type IProps = IOwnProps & IConnectProps;

const getId = (o: any) => o.id;
const getName = (o: any) => o.name;

class FinanceItems extends React.PureComponent<IProps> {
  private get glFilter() {
    return this.props.entityType === FinanceEntity.invoice
      ? (glAcc: IGLAccount) => !glAcc.account_type.increase_action_is_debit
      : (i: IGLAccount) => i;
  }
  private allColumns: IColumn[] = [
    {
      id: 'code',
      className: styles.sm,
      header: 'Code',
      cell: item => (
        <InlineSelect
          value={item.gs_code}
          options={
            this.props.entityType === FinanceEntity.purchaseOrder
              ? this.props.gsCodes.filter(c => c.is_buy)
              : this.props.gsCodes.filter(code => code.is_sell)
          }
          onChange={this.handleGsCodeChange(item)}
          getOptionValue={getId}
          getOptionLabel={getName}
          isDisabled={this.props.disabled}
        />
      )
    },
    {
      id: 'description',
      className: styles.md,
      header: 'Description',
      cell: item => this.renderInlineInput(item, 'description', 'Description...')
    },
    {
      id: 'quantity',
      className: styles.xs,
      header: 'Qty',
      cell: item => this.renderInlineInput(item, 'quantity', '0', normalizePositeveInt)
    },
    {
      id: 'unit_cost',
      className: styles.sm,
      header: 'Unit Ex.',
      cell: item => this.renderInlineInput(item, 'unit_cost', '0', normalizeReal)
    },
    {
      id: 'discount',
      className: styles.sm,
      header: 'Discount %',
      cell: item => this.renderInlineInput(item, 'discount', '0', normalizePercents)
    },
    {
      id: 'markup',
      className: styles.sm,
      header: 'Markup %',
      cell: item => this.renderInlineInput(item, 'markup', '0', normalizePercents)
    },
    {
      id: 'account_code',
      className: styles.md,
      header: 'Account Code',
      cell: item => (
        <InlineSelect
          value={item.gl_account}
          options={this.props.glAccounts.filter(this.glFilter)}
          onChange={this.handleGlAccountChange(item)}
          getOptionValue={getId}
          getOptionLabel={FinanceService.getGLAccountLabel}
          isDisabled={this.props.disabled}
        />
      )
    },
    {
      id: 'tax_code',
      className: styles.md,
      header: 'Tax Code',
      cell: item => (
        <InlineSelect
          value={item.tax_rate}
          options={this.props.taxRates}
          onChange={this.handleSelectChange(item, 'tax_rate')}
          getOptionValue={getId}
          getOptionLabel={getName}
          isDisabled={this.props.disabled}
        />
      )
    },
    {
      id: 'amount_ex',
      className: styles.total,
      header: 'Amount Ex.',
      cell: item => <strong>{formatPrice(item.total_amount)}</strong>
    },
    {
      id: 'delete',
      className: styles.remove,
      header: '',
      cell: item =>
        this.props.disabled ? <></> : <Icon name={IconName.Remove} onClick={() => this.props.onRemove(item.id)} />
    }
  ];

  private get columns(): IColumn[] {
    switch (this.props.entityType) {
      case FinanceEntity.invoice:
        return this.allColumns.filter(col => col.id !== 'markup');
      case FinanceEntity.purchaseOrder:
        return this.allColumns.filter(col => col.id !== 'discount');
      default:
        return this.allColumns.filter(col => col.id !== 'markup' && col.id !== 'discount');
    }
  }

  private handleGlAccountChange = (item: any) => (option: any) => {
    this.handleSelectChange(item, 'gl_account')(option);
    if (option.tax_rate) {
      this.handleSelectChange(item, 'tax_rate')(option.tax_rate);
    }
  };

  private handleGsCodeChange = (item: any) => (option: any) => {
    this.handleSelectChange(item, 'gs_code')(option);
    if (option.description) {
      this.handleSelectChange(item, 'description')(option.description);
    }
  };

  public componentDidMount() {
    this.props.dispatch(loadGLAccounts(this.props.entity.accounting_organization_id));
  }

  private handleSelectChange = (item: any, field: string) => (option: any) => {
    this.props.onChange(item.id, {[field]: option});
    this.debounceSubmit(item.id);
  };

  private debounceSubmit = debounce(this.props.onSubmit, 500);

  private handleInputChange = ({id}: {id: number | string}, field: string, normalizer?: (value: string) => string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const processed = normalizer ? normalizer(e.target.value) : e.target.value;
    this.props.onChange(id, {[field]: processed});
  };

  private handleInputBlur = (item: any) => () => {
    if (item.dirty) {
      this.props.onSubmit(item.id);
    }
  };

  private renderInlineInput = (
    item: any,
    field: string,
    placeholder?: string,
    normalizer?: (value: string) => string
  ) => {
    return (
      <input
        type="text"
        placeholder={placeholder}
        value={item[field]}
        onChange={this.handleInputChange(item, field, normalizer)}
        onBlur={this.handleInputBlur(item)}
        disabled={this.props.disabled}
        className="form-control"
      />
    );
  };

  public render() {
    const {entity, entityType} = this.props;
    const items = entity.items || [];

    return (
      <div>
        <InputTable>
          <thead>
            <tr>
              {this.columns.map(c => (
                <th key={c.id} className={c.className}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.id}>
                {this.columns.map(c => (
                  <td key={c.id} className={c.className}>
                    {c.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={this.columns.length}>No items</td>
              </tr>
            )}
          </tbody>
        </InputTable>
        <div className="row">
          <div className="col-4 pl-2">
            {!this.props.disabled && (
              <button type="button" className="btn btn-link" onClick={this.props.onCreate}>
                Add Item
              </button>
            )}
          </div>
          <div className="col-8 text-right">
            <FinanceSummary
              entityType={entityType}
              subTotal={entity.sub_total}
              taxes={entity.taxes}
              total={entity.total_amount}
              balanceDue={entity.amount_due}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  glAccounts: selectGlAccounts(state),
  taxRates: state.finance.taxRates,
  gsCodes: state.finance.gsCodes
});

export default connect(mapStateToProps)(FinanceItems);

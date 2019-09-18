import * as React from 'react';
import {Field, InjectedFormProps, reduxForm, formValues} from 'redux-form';
import Input from 'src/components/Form/Input';
import {Action, compose} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {required, isGreaterThanZero} from 'src/services/ValidationService';
import SelectAsync from 'src/components/Form/SelectAsync';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';
import {Moment} from 'moment';
import DateTime from 'src/components/Form/DateTime';
import {IEquipment} from 'src/models/UsageAndActualsModels/IEquipment';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import {formatPrice} from 'src/utility/Helpers';
import debounce from 'debounce-promise';
import moment from 'moment';

const BarcodeOption = styled.span`
  border: 1px ${ColorPalette.blue1} solid;
  border-radius: 4px;
  color: ${ColorPalette.blue1};
  background-color: ${ColorPalette.white};
  padding: 5px 7px 3px 7px;
  font-size: ${Typography.size.smaller};
  font-weight: ${Typography.weight.medium};
`;

const ModelOption = styled.span`
  margin-left: 10px;
  padding-top: 3px;
`;

interface IProps {
  onSubmit: (data: IFormValues) => Promise<any>;
  edit: boolean;
  jobId: number;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

export interface IFormValues {
  equipment: IEquipment;
  name: string;
  unit_cost_to_me: number;
  unit_price_to_charge: number;
  total_amount: number;
  started_at: Moment;
  ended_at: Moment;
  intervals_count_override: number;
}

interface IFormProps {
  endedAt: Moment;
}

interface IState {
  endDateDisabled: boolean;
}

export const formName = 'EquipmentCustomForm';

class EquipmentCustomForm extends React.PureComponent<
  InjectedFormProps<IFormValues, IProps> & IProps & IConnectProps & IFormProps,
  IState
> {
  public state: IState = {
    endDateDisabled: false
  };

  public componentDidMount() {
    const {edit, endedAt, change} = this.props;
    if (edit && endedAt && endedAt.isValid()) {
      this.setState({endDateDisabled: true});
    }

    if (!edit) {
      change('started_at', moment().startOf('day'));
    }
  }
  private loadOptions = async (search: string) => {
    const params = {
      term: search,
      job_id: this.props.jobId
    };

    const res = await UsageAndActualsService.searchEquipment(params);
    return res;
  };

  private debouncedLoadOptions = debounce(this.loadOptions, 500);

  private formatTotalAmount(value: number | string, isEdit: boolean) {
    if (isEdit) {
      return formatPrice(value);
    } else {
      return '--';
    }
  }

  private formatFormPrice(value: number) {
    return formatPrice(value);
  }

  private onSelectEquipment = (selectedEquipment: any) => {
    const {change} = this.props;

    change('unit_cost_to_me', selectedEquipment.category.default_buy_cost_per_interval);
    change('unit_price_to_charge', selectedEquipment.charging_interval.charging_rate_per_interval);
  };

  private renderEquipmentOption(option: Partial<IEquipment>) {
    return (
      <div className="d-flex flex-row">
        <BarcodeOption>
          {option.barcode}-{option.location ? option.location.code : ''}
        </BarcodeOption>
        <ModelOption>{option.model}</ModelOption>
      </div>
    );
  }

  public render() {
    const {handleSubmit, edit, endedAt} = this.props;

    return (
      <form onSubmit={handleSubmit} autoComplete="off" id={formName}>
        <div className="row">
          <div className="col">
            <Field
              name="equipment"
              validate={required}
              component={SelectAsync}
              getOptionValue={(option: IEquipment) => option.id}
              getOptionLabel={this.renderEquipmentOption}
              placeholder="Enter barcode or name of equipment"
              loadOptions={this.debouncedLoadOptions}
              label="Equipment Item"
              onChange={this.onSelectEquipment}
              disabled={edit}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-4">
            <Field
              name="unit_cost_to_me"
              disabled={true}
              component={Input}
              label="Unit Cost to Me"
              format={this.formatFormPrice}
            />
          </div>
          <div className="col-4">
            <Field
              name="unit_price_to_charge"
              disabled={true}
              component={Input}
              label="Unit Price to Charge"
              format={this.formatFormPrice}
            />
          </div>
          <div className="col-4">
            <Field
              name="total_amount"
              disabled={true}
              component={Input}
              label="Total Amount"
              format={e => this.formatTotalAmount(e, edit)}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-4">
            <Field
              name="started_at"
              validate={required}
              component={DateTime}
              showTime={true}
              label="Start Date"
              disabled={edit}
            />
          </div>
          <div className="col-4">
            <Field
              name="ended_at"
              component={DateTime}
              showTime={true}
              label="End Date"
              disabled={this.state.endDateDisabled}
            />
          </div>
          <div className="col-4">
            <Field
              name="intervals_count_override"
              validate={[isGreaterThanZero]}
              component={Input}
              type="number"
              min={0}
              label="Period on site"
              disabled={!(endedAt && endedAt.isValid()) || !edit}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default compose<React.ComponentClass<IProps & Partial<InjectedFormProps<{}>>>>(
  reduxForm<IFormValues, IProps>({
    form: formName,
    enableReinitialize: true
  }),
  formValues({
    endedAt: 'ended_at'
  })
)(EquipmentCustomForm);

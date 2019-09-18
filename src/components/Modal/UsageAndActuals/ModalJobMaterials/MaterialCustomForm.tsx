import * as React from 'react';
import {Field, formValues, InjectedFormProps, reduxForm} from 'redux-form';
import Input from 'src/components/Form/Input';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {IReturnType} from 'src/redux/reduxWrap';
import {IMaterial, IMeasureUnit} from 'src/models/UsageAndActualsModels/IMaterial';
import {ThunkDispatch} from 'redux-thunk';
import {loadAllMeasureUnits} from 'src/redux/measureUnitsDucks';
import Select from 'src/components/Form/Select';
import {isGreaterThanZero, required} from 'src/services/ValidationService';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import SelectAsync from 'src/components/Form/SelectAsync';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';
import {Link} from 'src/components/Layout/Common/StyledComponents';
import Typography from 'src/constants/Typography';
import {Moment} from 'moment';
import DateTime from 'src/components/Form/DateTime';
import {formatPrice} from 'src/utility/Helpers';

interface IInputProps {
  onSubmit: (data: IFormValues) => Promise<any>;
  edit: boolean;
}

interface IConnectProps {
  measureUnits: IReturnType<IMeasureUnit[]>;
  dispatch: ThunkDispatch<any, any, Action>;
}

export interface IFormValues {
  material: IMaterial;
  name: string;
  measure_unit_id: IMeasureUnit;
  default_sell_cost_per_unit: number;
  default_buy_cost_per_unit: number;
  count: number;
  used_at: Moment;
}

interface IExtractedFormValuesProps {
  sellCost: number;
  quantity: number;
}

interface IState {
  addCustomTrigger: boolean;
}

export const formName = 'MaterialCustomForm';

class MaterialCustomForm extends React.PureComponent<
  InjectedFormProps<IFormValues, IInputProps> & IInputProps & IConnectProps & IExtractedFormValuesProps,
  IState
> {
  public state = {
    addCustomTrigger: false
  };

  public componentDidMount() {
    const {dispatch} = this.props;

    this.setTotalAmount();
    dispatch(loadAllMeasureUnits());
  }

  private loadOptions = async (search: string) => {
    return await UsageAndActualsService.searchMaterials(search);
  };

  private toggleTrigger = () => {
    const {change} = this.props;

    this.setState({addCustomTrigger: !this.state.addCustomTrigger});
    setTimeout(() => {
      if (this.state.addCustomTrigger) {
        change('material', null);
      } else {
        change('name', null);
        change('measure_unit_id', null);
      }
    });
  };

  private setTotalAmount = () => {
    setTimeout(() => {
      // It is need cause getting values from reduxForm is async process, so we need to wait until new values from form will be passed as props to component
      const {sellCost, quantity, change} = this.props;

      change('total_amount', formatPrice((sellCost > 0 ? sellCost : 0) * (quantity > 0 ? quantity : 0)));
    });
  };

  private onMaterialChange = (data: any) => {
    const {change} = this.props;

    change('default_buy_cost_per_unit', +data.default_buy_cost_per_unit);
    change('default_sell_cost_per_unit', +data.default_sell_cost_per_unit);
  };

  public render() {
    const {
      handleSubmit,
      measureUnits: {data, loading},
      edit
    } = this.props;
    const {addCustomTrigger} = this.state;

    return (
      <form onSubmit={handleSubmit} autoComplete="off" id={formName}>
        <div className="row">
          {!addCustomTrigger ? (
            <div className="col-9">
              <Field
                name="material"
                validate={!addCustomTrigger && required}
                component={SelectAsync}
                getOptionValue={(option: IMaterial) => option.id}
                getOptionLabel={(option: IMaterial) => option.name}
                placeholder="Enter name of material"
                loadOptions={this.loadOptions}
                label="Material Item"
                onChange={this.onMaterialChange}
                disabled={edit}
              />
            </div>
          ) : (
            <>
              <div className="col">
                <Field name="name" validate={addCustomTrigger && required} component={Input} label="Material Name" />
              </div>
              <div className="col-3 position-relative">
                {loading && <BlockLoading size={30} color={ColorPalette.white} />}
                <Field
                  name="measure_unit_id"
                  validate={addCustomTrigger && required}
                  component={Select}
                  options={data || []}
                  getOptionValue={(option: IMeasureUnit) => option.id}
                  getOptionLabel={(option: IMeasureUnit) => option.name}
                  label="Measure Unit"
                />
              </div>
            </>
          )}
          {!edit && false && (
            <div className="col-auto">
              <div className="form-group">
                <label>&nbsp;</label>
                <Link className="form-control border-0" fontSize={Typography.size.normal} onClick={this.toggleTrigger}>
                  {addCustomTrigger ? 'Add Existing' : 'Add Custom'}
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="row">
          <div className="col-4">
            <Field
              name="default_buy_cost_per_unit"
              disabled={true}
              validate={[required, isGreaterThanZero]}
              type="number"
              component={Input}
              min={0}
              step={0.01}
              label="Unit Cost to Me"
            />
          </div>
          <div className="col-4">
            <Field
              name="count"
              validate={[required, isGreaterThanZero]}
              onChange={this.setTotalAmount}
              component={Input}
              type="number"
              min={0}
              label="Quantity"
            />
          </div>
          <div className="col-4">
            <Field name="used_at" validate={required} component={DateTime} label="Used At" />
          </div>
        </div>
        <div className="row">
          <div className="col-4">
            <Field
              name="default_sell_cost_per_unit"
              disabled={true}
              validate={[required, isGreaterThanZero]}
              component={Input}
              onChange={this.setTotalAmount}
              type="number"
              min={0}
              step={0.01}
              label="Unit Price to Charge"
            />
          </div>
          <div className="col-4">
            <Field name="total_amount" disabled={true} component={Input} label="Total Amount" />
          </div>
        </div>
      </form>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({measureUnits: state.measureUnits});

export default compose<React.ComponentClass<IInputProps & Partial<InjectedFormProps<{}>>>>(
  connect(mapStateToProps),
  reduxForm<IFormValues, IInputProps>({
    form: formName,
    enableReinitialize: true
  }),
  formValues({
    sellCost: 'default_sell_cost_per_unit',
    quantity: 'count'
  })
)(MaterialCustomForm);

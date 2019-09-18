import * as React from 'react';
import {Field, formValues, InjectedFormProps, reduxForm} from 'redux-form';
import {required} from 'src/services/ValidationService';
import Select from 'src/components/Form/Select';
import TextArea from 'src/components/Form/TextArea';
import DateTime from 'src/components/Form/DateTime';
import Input from 'src/components/Form/Input';
import moment, {Moment} from 'moment';
import Delimiter from 'src/components/Form/Delimiter';
import {ITaskType} from 'src/models/ITask';
import {IAddTaskToRunConfig, ModalModes} from 'src/components/Modal/Jobs/ModalJobTask/ModalJobTask';
import {compose} from 'redux';
import {validateStartDate} from 'src/components/Modal/Jobs/ModalJobTask/validation';

interface IInputProps {
  taskTypes: ITaskType[];
  kpiIsMissed: boolean;
  edit: boolean;
  onSubmit: (data: IFormValues) => any;
  canBeScheduled?: boolean;
  canEditDueDate?: boolean;
  isSchedulingActive: boolean;
  addTaskToRunConfig?: IAddTaskToRunConfig;
  mode?: ModalModes;
}

export interface IFormValues {
  id: number;
  type: ITaskType;
  internal_note: string;
  due_at: string | Moment;
  starts_at: string | Moment;
  ends_at: string | Moment;
  kpi_time: string;
  scheduling_note: string;
  kpi_missed_reason: string;
}

interface IExtractedFormValues {
  startsAt?: Moment;
  endsAt?: Moment;
}

interface IFormValuesProps {
  scheduledFrom?: Moment;
}

interface IState {
  canBeScheduled: boolean;
  kpiHours: number;
}

export type IProps = InjectedFormProps<IFormValues, IInputProps> &
  IInputProps &
  IFormValuesProps &
  IExtractedFormValues;

export const JobTaskDetailsFormName = 'JobTaskDetailsForm';

class JobTaskDetailsForm extends React.PureComponent<IProps, IState> {
  public state = {
    canBeScheduled: false,
    kpiHours: 0
  };

  public componentWillUnmount() {
    this.props.reset();
  }

  private onChange = (data: any) => {
    this.props.change('kpi_time', `${data.kpi_hours} hours`);
    this.setState({
      canBeScheduled: data.can_be_scheduled,
      kpiHours: data.kpi_hours || 0
    });

    this.setDueDateAuto();
  };

  private setDueDateAuto = () => {
    const {kpiHours} = this.state;

    if (!!kpiHours) {
      this.props.change('due_at', moment(moment().add(kpiHours, 'h')));
    }
  };

  private validateDate = (current: Date) => {
    const {addTaskToRunConfig} = this.props;

    if (addTaskToRunConfig) {
      return moment(current).isSame(addTaskToRunConfig.date);
    } else {
      return false;
    }
  };

  public render() {
    const {
      taskTypes,
      kpiIsMissed,
      edit,
      handleSubmit,
      canBeScheduled: cbs,
      canEditDueDate,
      isSchedulingActive,
      mode
    } = this.props;
    const {canBeScheduled} = this.state;
    const canBeScheduledCombine = cbs || canBeScheduled;
    const modeCondition = !mode || (mode && mode !== ModalModes.ADD_TASK_TO_RUN);

    return (
      <form autoComplete="off" onSubmit={handleSubmit}>
        {modeCondition && (
          <>
            <div className="row">
              <div className="col-5">
                <Field
                  name="type"
                  label="Task"
                  options={taskTypes}
                  validate={required}
                  onChange={this.onChange}
                  disabled={edit}
                  getOptionValue={(option: ITaskType) => option.id.toString()}
                  getOptionLabel={(option: ITaskType) => option.name}
                  component={Select}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <Field name="internal_note" label="Notes" validate={required} component={TextArea} />
              </div>
            </div>
            <div className="row">
              <div className="col-4">
                <Field
                  name="due_at"
                  validate={required}
                  showTime={true}
                  futureEnabled={true}
                  component={DateTime}
                  disabled={edit && !canEditDueDate}
                  label="Task Due"
                />
              </div>
              <div className="col-2">
                <Field name="kpi_time" disabled={true} component={Input} label="KPI Time" />
              </div>
              {edit && kpiIsMissed && (
                <div className="col-6">
                  <Field
                    name="kpi_missed_reason"
                    component={Input}
                    validate={kpiIsMissed && required}
                    label="Reason KPI Missed"
                  />
                </div>
              )}
            </div>
          </>
        )}
        {canBeScheduledCombine && (
          <>
            {modeCondition && <Delimiter />}
            <div className="row">
              <div className="col-4">
                <Field
                  name="starts_at"
                  showTime={true}
                  futureEnabled={true}
                  component={DateTime}
                  disabled={!isSchedulingActive}
                  validate={isSchedulingActive ? [required] : undefined}
                  label="Scheduled From"
                  isValidDate={this.validateDate}
                />
              </div>
              <div className="col-4">
                <Field
                  name="ends_at"
                  showTime={true}
                  futureEnabled={true}
                  component={DateTime}
                  disabled={!isSchedulingActive}
                  validate={isSchedulingActive ? [required] : undefined}
                  label="Scheduled To"
                  isValidDate={this.validateDate}
                />
              </div>
            </div>
            {modeCondition && (
              <div className="row">
                <div className="col-12">
                  <Field name="scheduling_note" label="Crew Notes" component={TextArea} />
                </div>
              </div>
            )}
          </>
        )}
      </form>
    );
  }
}

export default compose<React.ComponentClass<IInputProps & Partial<InjectedFormProps<{}>>>>(
  reduxForm<IFormValues, IInputProps>({
    form: JobTaskDetailsFormName,
    enableReinitialize: true,
    asyncValidate: validateStartDate,
    asyncBlurFields: ['starts_at', 'ends_at']
  }),
  formValues({
    startsAt: 'starts_at',
    endsAt: 'ends_at'
  })
)(JobTaskDetailsForm);

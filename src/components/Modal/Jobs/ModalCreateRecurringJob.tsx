import * as React from 'react';
import {IModal} from 'src/models/IModal';
import ModalWindow from '../ModalWindow';
import {Field, InjectedFormProps, reduxForm} from 'redux-form';
import DateTime from 'src/components/Form/DateTime';
import {Moment} from 'moment';
import Modal from '../Modal';
import RadioList, {IRadioItem} from 'src/components/Form/RadioList';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {ModalStyles} from '../ModalStyles';
import DateTransformer from 'src/transformers/DateTransformer';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import Select, {IWrappedSelectOption} from 'src/components/Form/Select';
import Input from 'src/components/Form/Input';
import {connect} from 'react-redux';
import {Action, compose} from 'redux';
import {IAppState} from 'src/redux';
import {ThunkDispatch} from 'redux-thunk';
import {ICurrentJob} from 'src/redux/currentJob/currentJobDucks';
import {RRule} from 'rrule';
import JobService from 'src/services/JobService';
import Notify, {NotifyType} from 'src/utility/Notify';

interface IFormValues {
  start_date: Moment;
  end_date: Moment;
  repeat: string;
  frequency: IWrappedSelectOption;
  every: number;
}

interface IState {
  loading: boolean;
  form: IFormValues;
}

interface IConnectProps {
  currentJob: ICurrentJob;
  dispatch: ThunkDispatch<any, any, Action>;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: ${ModalStyles.bodyMinHeight}px;
`;

const Form = styled.form`
  flex-grow: 1;
`;

const BottomHint = styled.div`
  border-top: 1px solid ${ColorPalette.gray2};
  margin: 0 -${ModalStyles.horizontalPadding}px;
  padding: 0 ${ModalStyles.horizontalPadding}px;
  padding-top: 20px;
  margin-top: 40px;
`;

export const RepeatConst = {
  daily: 'DAILY',
  weakly: 'WEEKLY',
  fortnightly: 'FORTNIGHTLY',
  monthly: 'MONTHLY',
  yearly: 'YEARLY',
  custom: 'CUSTOM'
};

const RepeatList: IRadioItem[] = [
  {
    value: RepeatConst.weakly,
    label: 'Every Week'
  },
  {
    value: RepeatConst.fortnightly,
    label: 'Every Fortnight'
  },
  {
    value: RepeatConst.monthly,
    label: 'Every Month'
  },
  {
    value: RepeatConst.yearly,
    label: 'Every Year'
  },
  {
    value: RepeatConst.custom,
    label: 'Custom'
  }
];

const FrequencyList: IWrappedSelectOption[] = [
  {
    value: RepeatConst.daily,
    label: 'Daily'
  },
  {
    value: RepeatConst.weakly,
    label: 'Weekly'
  },
  {
    value: RepeatConst.monthly,
    label: 'Monthly'
  },
  {
    value: RepeatConst.yearly,
    label: 'Yearly'
  }
];

const EveryList = {
  [RepeatConst.daily]: 'Day',
  [RepeatConst.weakly]: 'Week',
  [RepeatConst.monthly]: 'Month',
  [RepeatConst.yearly]: 'Year'
};

function createRRule(data: IFormValues): any {
  let rule: any;

  if (data.repeat !== RepeatConst.custom) {
    rule = RRule.optionsToString({
      freq: RRule[data.repeat !== RepeatConst.fortnightly ? data.repeat : RepeatConst.weakly],
      interval: data.repeat !== RepeatConst.fortnightly ? 1 : 2,
      dtstart: new Date(data.start_date.add(1, 'd').unix() * 1000)
    });
  } else {
    rule = RRule.optionsToString({
      freq: RRule[data.frequency.value],
      interval: data.every,
      dtstart: new Date(data.start_date.add(1, 'd').unix() * 1000),
      until: new Date(data.end_date.add(1, 'd').unix() * 1000)
    });
  }

  return rule
    .split('\n')
    .join(';')
    .replace('RRULE:', '')
    .replace('DTSTART:', 'DTSTART=');
}

class ModalCreateRecurringJob extends React.PureComponent<
  InjectedFormProps<IFormValues, IModal> & IModal & IConnectProps,
  IState
> {
  public state = {
    loading: false,
    form: {} as IFormValues
  };

  public componentDidMount() {
    this.props.initialize({
      every: 1
    } as Partial<IFormValues>);
  }

  private handleFormChange = () => {
    setTimeout(() => {
      this.props.handleSubmit(this.setData)();
    });
  };

  private setData = (form: IFormValues) => {
    this.setState({form});
  };

  private createRecurringJob = async () => {
    const {data} = this.props.currentJob;

    if (data) {
      this.setState({loading: true});

      try {
        await JobService.createRecurringJob({
          recurrence_rule: createRRule(this.state.form),
          job_service_id: data.job_service_id || 0,
          insurer_id: data.insurer_id || 0,
          site_address_id: data.site_address_id || 0,
          owner_location_id: data.owner_location_id || 0,
          description: data.description || '---'
        });
        this.setState({loading: false});
        Notify(NotifyType.Success, 'Recurring job successfully created!');
        this.onClose();
      } catch (er) {
        this.setState({loading: false});
        Notify(
          NotifyType.Danger,
          <>
            {Object.entries(er.fields).map((entry: any, index) => (
              <div key={index}>{entry[1]}</div>
            ))}
          </>
        );
      }
    }
  };

  private setEvery = () => {
    const {form} = this.state;

    if (form) {
      const {frequency} = form as IFormValues;

      return EveryList[(frequency || ({} as any)).value] || '';
    }

    return '';
  };

  private onClose = () => {
    const {onClose, reset} = this.props;

    this.setState({
      loading: false,
      form: {} as IFormValues
    });
    reset();
    onClose();
  };

  private renderHint() {
    const {form} = this.state;

    if (form) {
      const {frequency, start_date} = form as IFormValues;

      switch ((frequency || ({} as any)).value) {
        case '2' || '3' || '4':
          return (start_date as Moment).format('dddd');
        default:
          return '';
      }
    } else {
      return '';
    }
  }

  private customHintRenderCondition = () => {
    const {frequency, every} = this.state.form;

    const cond1 = frequency.value === RepeatConst.daily;
    const cond2 = [RepeatConst.weakly, RepeatConst.monthly, RepeatConst.yearly].includes(frequency.value) && every;

    return cond1 || cond2;
  };

  private renderBody() {
    const {repeat, start_date, end_date, every, frequency} = this.state.form;

    return (
      <Container>
        <Form>
          <div className="row">
            <div className="col-4">
              <Field
                name="start_date"
                label="Start Date"
                placeholder="Start Date"
                component={DateTime}
                futureEnabled={true}
                onChange={this.handleFormChange}
              />
            </div>
          </div>
          {repeat !== RepeatConst.custom && (
            <>
              <div className="row">
                <div className="col-12">
                  <Field
                    name="repeat"
                    label="Repeat"
                    list={RepeatList}
                    direction="vertical"
                    component={RadioList}
                    onChange={this.handleFormChange}
                  />
                </div>
              </div>
            </>
          )}
          {repeat === RepeatConst.custom && (
            <>
              <div className="row">
                <div className="col-5">
                  <Field
                    name="frequency"
                    label="Frequency"
                    placeholder="Frequency"
                    options={FrequencyList}
                    component={Select}
                    onChange={this.handleFormChange}
                  />
                </div>
                {frequency && frequency.value !== RepeatConst.daily && (
                  <div className="col-3">
                    <Field
                      name="every"
                      label={`Every X ${this.setEvery().toLowerCase()}(s)`}
                      type="number"
                      min={1}
                      component={Input}
                      onChange={this.handleFormChange}
                    />
                  </div>
                )}
              </div>
              <div className="row">
                <div className="col-4">
                  <Field
                    name="end_date"
                    label="Until Date"
                    placeholder="Until Date"
                    component={DateTime}
                    futureEnabled={true}
                    onChange={this.handleFormChange}
                  />
                </div>
              </div>
            </>
          )}
        </Form>
        {repeat && repeat !== RepeatConst.custom && start_date && (
          <BottomHint>
            This job will automatically reoccur <strong>{(repeat as string).toLowerCase()}</strong> on{' '}
            <strong>{(start_date as Moment).format('dddd')}</strong> starting{' '}
            <strong>{DateTransformer.dehydrateDate(start_date, 'D MMM YYYY')}</strong> with no end date.
          </BottomHint>
        )}
        {repeat &&
          repeat === RepeatConst.custom &&
          start_date &&
          end_date &&
          frequency &&
          this.customHintRenderCondition() && (
            <BottomHint>
              This job will automatically reoccur{' '}
              <strong>
                every {every > 1 && frequency.value !== RepeatConst.daily ? every : ''} {this.setEvery().toLowerCase()}
                {every > 1 && frequency.value !== RepeatConst.daily ? 's' : ''}
              </strong>{' '}
              {frequency.value !== RepeatConst.daily ? 'on ' : ''}
              <strong>{this.renderHint()}</strong> starting{' '}
              <strong>{DateTransformer.dehydrateDate(start_date, 'D MMM YYYY')}</strong> and stop on{' '}
              <strong>{DateTransformer.dehydrateDate(end_date, 'D MMM YYYY')}</strong>.
            </BottomHint>
          )}
      </Container>
    );
  }

  private renderFooter() {
    const {repeat, start_date, end_date, frequency} = this.state.form;

    return (
      <PrimaryButton
        className="btn btn-primary"
        onClick={this.createRecurringJob}
        disabled={
          !(
            repeat &&
            start_date &&
            (repeat !== RepeatConst.custom ||
              (repeat === RepeatConst.custom && end_date && frequency && this.customHintRenderCondition()))
          )
        }
      >
        Create
      </PrimaryButton>
    );
  }

  public render() {
    const {isOpen} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={this.onClose}
          title="Create Recurring Job"
          body={this.renderBody()}
          footer={this.renderFooter()}
          loading={this.state.loading}
        />
      </Modal>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  currentJob: state.currentJob
});

export default compose<React.ComponentClass<IModal>>(
  reduxForm<IFormValues, IModal>({
    form: 'RecurringJobForm'
  }),
  connect(mapStateToProps)
)(ModalCreateRecurringJob);

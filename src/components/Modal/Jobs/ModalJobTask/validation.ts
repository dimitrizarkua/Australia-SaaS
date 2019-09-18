import {ScheduleConfig} from 'src/components/ScheduleCalendar/ScheduleCalendar';
import moment from 'moment';
import {IFormValues, IProps} from 'src/components/Modal/Jobs/ModalJobTask/JobTaskDetailsForm';
import {delay} from 'q';

export const validateStartDate = async (values: IFormValues, dispatch: unknown, props: IProps) => {
  await delay(1);

  const {addTaskToRunConfig} = props;
  const errors = {} as any;

  if (!moment.isMoment(values.starts_at)) {
    errors.starts_at = 'Incorrect start date';
  } else if (
    addTaskToRunConfig &&
    ((moment.isMoment(values.ends_at) && values.ends_at.isSameOrBefore(values.starts_at)) ||
      (!values.starts_at!.isSameOrAfter(moment(addTaskToRunConfig.date).hours(ScheduleConfig.startHours)) ||
        !values.starts_at!.isSameOrBefore(moment(addTaskToRunConfig.date).hours(ScheduleConfig.endHours))))
  ) {
    errors.starts_at = 'Incorrect start date';
  }

  if (!moment.isMoment(values.ends_at)) {
    errors.ends_at = 'Incorrect end date';
  } else if (
    addTaskToRunConfig &&
    ((moment.isMoment(values.starts_at) && values.starts_at.isSameOrAfter(values.ends_at)) ||
      (!values.ends_at!.isSameOrAfter(moment(addTaskToRunConfig.date).hours(ScheduleConfig.startHours)) ||
        !values.ends_at!.isSameOrBefore(moment(addTaskToRunConfig.date).hours(ScheduleConfig.endHours))))
  ) {
    errors.ends_at = 'Incorrect end date';
  }

  if (Object.keys(errors).length > 0 && props.isSchedulingActive) {
    throw errors;
  }
};

import ScrollToComponent from 'src/components/AppLayout/ScrollToComponent';
import * as qs from 'qs';
import {FRONTEND_DATE} from 'src/constants/Date';
import {ILocation} from 'src/models/IAddress';
import moment from 'moment';
import {RouteComponentProps} from 'react-router';
import {IReturnType} from 'src/redux/reduxWrap';

interface IInputProps {
  user: any;
  financeEntity: IReturnType<any>;
}

type ExternalType = RouteComponentProps<any> & IInputProps;

class FinanceDetailsPage<P extends ExternalType, S = {}> extends ScrollToComponent<P, S> {
  public get isNew() {
    return !this.props.match.params.id;
  }

  public get primaryLocation() {
    return this.props.user.locations.find((l: ILocation) => !!l.primary);
  }

  public getInitializeFormValues = () => {
    const {
      location,
      financeEntity: {data},
      user
    } = this.props;
    const params = qs.parse(location.search, {ignoreQueryPrefix: true});

    if (this.isNew) {
      return {
        date: moment().format(FRONTEND_DATE),
        location:
          (params.form_location_id && user.locations.find((l: ILocation) => +l.id === +params.form_location_id)) ||
          this.primaryLocation,
        [params.form_job_id ? 'job' : '']: {
          id: +params.form_job_id
        },
        due_at: moment()
          .add(1, 'd')
          .format(FRONTEND_DATE)
      };
    } else {
      return data;
    }
  };
}

export default FinanceDetailsPage;

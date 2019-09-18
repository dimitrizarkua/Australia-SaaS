import * as React from 'react';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {Field} from 'redux-form';
import Input from './Input';
import Select from 'src/components/Form/Select';
import SelectAsync from 'src/components/Form/SelectAsync';
import AddressService from 'src/services/AddressService';
import {CountriesStateType} from 'src/redux/contacts/countriesReducer';
import {StatesStateType} from 'src/redux/contacts/statesReducer';
import {ICountry, IState, ISuburb} from 'src/models/IAddress';
import {OptionContainer, GrayText} from './ContactSelectors/OptionComponents';
import debounce from 'debounce-promise';

export interface IProps {
  name: string;
  change: (fieldName: string, value: any) => void;
  onChange?: () => void;
}

interface IConnectProps {
  countries: CountriesStateType;
  states: StatesStateType;
}

interface ISuburbOption extends ISuburb {
  showPostcode?: boolean;
}

class AddressFields extends React.PureComponent<IProps & IConnectProps> {
  private onChangeField = () => {
    if (this.props.onChange) {
      this.props.onChange();
    }
  };

  private updateSuburbDependencies = (e?: ISuburb | React.ChangeEvent) => {
    const {name, change} = this.props;
    change(`${name}.suburb`, e);
    if (e && e.hasOwnProperty('id')) {
      const suburb = e as ISuburb;
      const newState = this.props.states.data!.data.find(s => s.id === suburb.state_id);
      if (newState) {
        change(`${name}.state`, newState);
        const newCountry = this.props.countries.data!.data.find(c => c.id === newState.country_id);
        change(`${name}.country`, newCountry);
      }
      change(`${name}.postcode`, suburb.postcode);
      this.onChangeField();
    }
  };

  private loadSuburbs = (search: string) => {
    return AddressService.searchSuburbs(search || '', '', 20)
      .then(response => {
        return this.addShowPostcodeFlag(response.data);
      })
      .catch(() => {
        return [];
      });
  };

  private debouncedLoadSuburbs = debounce(this.loadSuburbs, 1000);

  private addShowPostcodeFlag = (data: any) => {
    return data.map((item: any, index: number) => {
      const notUniqueName =
        (index < data.length - 1 && item.name === data[index + 1].name) ||
        (index > 0 && item.name === data[index - 1].name);
      return {
        ...item,
        showPostcode: notUniqueName,
        label: item.name,
        value: item.id
      };
    });
  };

  private getSuburbOptionLabel = (option: ISuburbOption) => {
    if (!option.id) {
      return '';
    }
    return (
      <OptionContainer>
        <div>{option.name}</div>
        {option.showPostcode && <GrayText>{option.postcode}</GrayText>}
      </OptionContainer>
    );
  };

  private get statesOptions() {
    return [{id: null, name: 'All States'}, ...((this.props.states.data && this.props.states.data.data) || [])];
  }

  private get countriesOptions() {
    return (this.props.countries.data && this.props.countries.data.data) || [];
  }

  public render() {
    return (
      <>
        <div className="row">
          <div className="col-7">
            <Field
              name="address_line_1"
              label="Address"
              placeholder="Address"
              onChange={this.onChangeField}
              component={Input}
            />
          </div>
          <div className="col-4">
            <Field
              name="suburb"
              label="Suburb"
              placeholder="Suburb"
              loadOptions={this.debouncedLoadSuburbs}
              getOptionValue={(option: ISuburbOption) => option.id && option.id.toString()}
              getOptionLabel={this.getSuburbOptionLabel}
              component={SelectAsync}
              onChange={this.updateSuburbDependencies}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-4">
            <Field
              name="state"
              label="State"
              placeholder="State"
              options={this.statesOptions}
              getOptionValue={(option: IState) => (option.id !== null ? option.id.toString() : null)}
              getOptionLabel={(option: IState) => option.name}
              component={Select}
              disabled={true}
            />
          </div>
          <div className="col-2">
            <Field name="postcode" label="Postcode" placeholder="Postcode" component={Input} disabled={true} />
          </div>
          <div className="col-4">
            <Field
              name="country"
              label="Country"
              placeholder="Country"
              options={this.countriesOptions}
              getOptionValue={(option: ICountry) => option.id.toString()}
              getOptionLabel={(option: ICountry) => option.name}
              component={Select}
              disabled={true}
            />
          </div>
        </div>
      </>
    );
  }
}

export default connect((state: IAppState) => ({
  states: state.allStates,
  countries: state.allCountries
}))(AddressFields);

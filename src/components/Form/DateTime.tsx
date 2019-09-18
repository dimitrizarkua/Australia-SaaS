import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import ReactDatetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import Icon, {IconName} from 'src/components/Icon/Icon';
import {inputCss} from './Input';
import classnames from 'classnames';
import moment from 'moment';
import {FRONTEND_DATE, FRONTEND_TIME} from 'src/constants/Date';
import withoutProps from 'src/components/withoutProps/withoutProps';

export interface IProps extends WrappedFieldProps {
  label?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  showTime?: boolean;
  disabled?: boolean;
  futureEnabled?: boolean;
  isValidDate?: (date: Date) => boolean;
  viewMode?: number | 'years' | 'months' | 'days' | 'time' | undefined;
  dateFormat?: string | boolean;
  timeFormat?: string | boolean;
  iconName?: IconName;
}

const StyledLabel = styled.label`
  color: ${ColorPalette.gray4};
`;

const InputGroup = styled.div`
  position: relative;

  input {
    ${inputCss};
    padding-right: 40px;
  }
`;

const CalendarIcon = styled(withoutProps(['disabled'])(Icon))<{disabled?: boolean}>`
  position: absolute;
  right: 12px;
  top: 8px;
  cursor: ${props => (props.disabled ? 'unset' : 'pointer')};

  path,
  circle,
  line {
    stroke: ${ColorPalette.gray4};
  }

  :hover path {
    stroke: ${props => (props.disabled ? ColorPalette.gray4 : ColorPalette.gray5)};
  }
`;

const Error = styled.div`
  display: block;
`;

class DateTime extends React.PureComponent<IProps> {
  private picker: React.RefObject<any> = React.createRef();

  private focusDatePicker = () => {
    if (this.picker.current && !this.props.disabled) {
      this.picker.current.openCalendar();
    }
  };

  private isValidDate = (current: Date) => {
    if (!this.props.futureEnabled) {
      const now = moment();
      return moment(current).isBefore(now);
    }
    return true;
  };

  public render() {
    const {
      meta,
      isValidDate,
      disabled,
      viewMode,
      dateFormat,
      showTime,
      timeFormat,
      iconName,
      label,
      labelClassName,
      className
    } = this.props;
    const isInvalid = meta.touched && meta.error;
    const inputProps = {
      placeholder: this.props.placeholder,
      className: classnames('form-control', {'is-invalid': isInvalid}),
      disabled: this.props.disabled
    };
    return (
      <div className={classnames('form-group', className)}>
        {label && <StyledLabel className={labelClassName}>{label}</StyledLabel>}
        <div className={this.props.valueClassName}>
          <InputGroup>
            <ReactDatetime
              {...this.props.input}
              ref={this.picker}
              inputProps={inputProps}
              dateFormat={dateFormat === false ? false : FRONTEND_DATE}
              timeFormat={showTime ? (timeFormat ? timeFormat : FRONTEND_TIME) : false}
              isValidDate={isValidDate || this.isValidDate}
              viewMode={viewMode ? viewMode : undefined}
            />
            <CalendarIcon
              disabled={disabled}
              name={iconName ? iconName : IconName.Calendar}
              size={18}
              onClick={this.focusDatePicker}
            />
          </InputGroup>
          {isInvalid && <Error className="invalid-feedback">{meta.error}</Error>}
        </div>
      </div>
    );
  }
}

export default DateTime;

import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import {StyledLabel} from './Common';
import CheckboxSimple, {CheckboxDirection} from './CheckboxSimple';
import without from 'lodash/without';
import styled from 'styled-components';

export interface ICheckboxListItem {
  id: number;
  label: string;
  disabled?: boolean;
  unremovable?: boolean;
}

enum FormFieldEvents {
  onFocus = 'onFocus',
  onBlur = 'onBlur'
}

interface ICheckboxListProps extends WrappedFieldProps {
  label?: string;
  list?: ICheckboxListItem[];
  direction?: CheckboxDirection;
  onCheck?: (id: number) => void;
  height?: number;
  disabled?: boolean;
}

const LocationList = styled.div<{height: number}>`
  overflow: auto;
  max-height: ${props => `${props.height}px`};
  width: 100%;
`;

export default class CheckboxList extends React.PureComponent<ICheckboxListProps> {
  private onChange = (id: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      input: {onChange, value},
      onCheck
    } = this.props;
    if (event.target.checked) {
      onChange([...value, id]);
      if (onCheck) {
        onCheck(id);
      }
    } else {
      onChange(without(value, id));
    }
  };

  private bindFieldEvents = (name: FormFieldEvents) => {
    const {[name]: eventName, value} = this.props.input;
    if (eventName) {
      return () => eventName(value);
    }

    return () => null;
  };

  public render() {
    const {
      list,
      meta,
      label,
      direction = CheckboxDirection.horizontal,
      height = 220,
      disabled,
      input: {value}
    } = this.props;
    const isInvalid = meta.touched && meta.error;
    return (
      <div className="form-group">
        {label && <StyledLabel>{label}</StyledLabel>}
        <LocationList height={height}>
          {list &&
            list.map((el: ICheckboxListItem, i) => (
              <CheckboxSimple
                value={value.includes(el.id)}
                disabled={el.disabled || disabled}
                unremovable={el.unremovable}
                label={el.label}
                propsForForm={{
                  onChange: this.onChange(el.id),
                  onBlur: this.bindFieldEvents(FormFieldEvents.onBlur),
                  onFocus: this.bindFieldEvents(FormFieldEvents.onFocus)
                }}
                direction={direction}
                key={i}
              />
            ))}
        </LocationList>
        {isInvalid && <div className="invalid-feedback">{meta.error}</div>}
      </div>
    );
  }
}

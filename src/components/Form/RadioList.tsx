import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import {StyledLabel} from './Common';
import styled from 'styled-components';
import RadioButton from './RadioButton';

export interface IRadioItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface IProps extends WrappedFieldProps {
  label?: string;
  list?: IRadioItem[];
  nameInput?: string;
  direction?: 'vertical' | 'horizontal';
  size?: number;
}

const Label = styled.label`
  display: flex;
  align-items: center;
  width: fit-content;

  input {
    margin-right: 10px;
  }
`;

const RadioWrapper = styled.div`
  margin-right: 10px;
`;

class RadioList extends React.PureComponent<IProps> {
  public render() {
    const {list, meta, size} = this.props;
    const isInvalid = meta.touched && meta.error;

    return (
      <div className="form-group">
        {this.props.label && <StyledLabel>{this.props.label}</StyledLabel>}
        <div>
          {list &&
            list.map((el, index) => (
              <Label key={index}>
                <RadioWrapper>
                  <RadioButton
                    {...this.props.input}
                    size={size || 16}
                    value={el.value}
                    checked={this.props.input.value === el.value}
                    disabled={el.disabled}
                  />
                </RadioWrapper>
                <div>{el.label}</div>
              </Label>
            ))}
        </div>
        {isInvalid && <div className="invalid-feedback">{meta.error}</div>}
      </div>
    );
  }
}

export default RadioList;

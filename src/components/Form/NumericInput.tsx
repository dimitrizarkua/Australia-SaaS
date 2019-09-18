import * as React from 'react';

interface IProps {
  quantity: number;
  onChange?: (val: number) => any;
  disabled?: boolean;
}

interface IState {
  quantity: number;
}

class NumericInput extends React.PureComponent<IProps, IState> {
  public state = {
    quantity: this.props.quantity || 0
  };

  public componentDidUpdate(prevProps: IProps) {
    const {quantity} = this.props;

    if (quantity !== prevProps.quantity) {
      this.setState({quantity});
    }
  }

  private changeQuantity = (e: any) => {
    const {onChange} = this.props;
    const value: number = Math.floor(+e.target.value);

    if (value !== this.state.quantity) {
      if (value < 0) {
        this.setState({quantity: 0});
      } else {
        this.setState({quantity: value});

        if (onChange) {
          onChange(value);
        }
      }
    }
  };

  public render() {
    const {disabled} = this.props;
    const {quantity} = this.state;

    return (
      <input
        className="form-control"
        type="number"
        min="0"
        disabled={disabled}
        onChange={this.changeQuantity}
        style={{width: '70px'}}
        value={quantity}
      />
    );
  }
}

export default NumericInput;

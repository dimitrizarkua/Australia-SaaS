import * as React from 'react';
import InlineInput from './InlineInput';

interface IProps {
  value: string;
  onBlur: (e: any) => any;
}

interface IState {
  focused: boolean;
  value: string;
}

class InlinePriceInput extends React.PureComponent<IProps, IState> {
  public state = {focused: false, value: ''};

  public componentDidMount() {
    this.setState({value: this.props.value});
  }

  private onFocus = () => {
    this.setState({focused: true});
  };

  private onBlur = (e: any) => {
    this.setState({focused: false});
    this.props.onBlur(e);
  };

  private onChange = (e: any) => {
    if (this.state.focused) {
      const value = e.target.value;
      if (/^\$*\s*[0-9\,]*\.*[0-9]{0,2}$/.test(value)) {
        this.setState({value});
      }
    }
  };

  public render() {
    return (
      <InlineInput
        type="text"
        value={this.state.focused ? this.state.value : this.props.value}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      />
    );
  }
}

export default InlinePriceInput;

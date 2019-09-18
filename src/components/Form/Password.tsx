import * as React from 'react';
import Input, {IProps} from './Input';

class Password extends React.PureComponent<IProps> {
  public render() {
    return <Input {...this.props} type="password" />;
  }
}

export default Password;

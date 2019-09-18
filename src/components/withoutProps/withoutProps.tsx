import * as React from 'react';
import {omit} from 'lodash';

const withoutProps = (omitProps: string[]) => {
  return (WrappedComponent: React.ComponentClass<any> | string) => {
    const WithoutPropsComponent = (props: any) => {
      const {children, ...otherProps} = props;
      return React.createElement(WrappedComponent, omit(otherProps, omitProps), children);
    };
    return WithoutPropsComponent;
  };
};

export default withoutProps;

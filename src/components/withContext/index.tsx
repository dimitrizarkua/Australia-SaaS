import React, {Context} from 'react';

export interface IWithContextProps<T> {
  currentContext: T;
}

export function withContext<T>(ContextObj: Context<T>) {
  return function componentWrap(Component: React.ComponentClass<any>) {
    return React.memo(function renderWrap(props: any) {
      return <ContextObj.Consumer>{context => <Component {...props} currentContext={context} />}</ContextObj.Consumer>;
    });
  };
}

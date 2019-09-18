import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import * as qs from 'qs';

class ScrollToComponent<P, S = {}> extends React.PureComponent<RouteComponentProps<{}> & P, S> {
  public scrollToHighlightedItem = (selector?: string) => {
    if (selector) {
      const element = document.getElementById(selector);
      if (element && element.scrollIntoView) {
        element.scrollIntoView(true);
      }
    }
  };

  public getHighlightedItem = () => {
    const params = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});
    return {note: +params.note, message: +params.message, itemId: +params.note || +params.message};
  };
}

export default ScrollToComponent;

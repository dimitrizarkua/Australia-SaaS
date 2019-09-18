import * as React from 'react';
import classnames from 'classnames';
import {range} from 'lodash';
import {IPagination} from 'src/models/IEnvelope';

interface IProps {
  pagination: IPagination;
  onChange: (page: number) => any;
}

class Pagination extends React.PureComponent<IProps> {
  private renderControl = (label: any, page: number, isActive: boolean, isDisabled: boolean) => {
    return (
      <li key={page} className={classnames('page-item', {active: isActive, disabled: isDisabled})}>
        {isActive || isDisabled ? (
          <span className="page-link">{label}</span>
        ) : (
          <a className="page-link" onClick={() => this.props.onChange(page)}>
            {label}
          </a>
        )}
      </li>
    );
  };

  public render() {
    const {current_page, last_page} = this.props.pagination;
    return (
      <nav>
        <ul className="pagination">
          {this.renderControl('Previous', current_page - 1, false, current_page === 1)}
          {range(last_page).map(index => {
            const page = index + 1;
            return this.renderControl(page, page, page === current_page, false);
          })}
          {this.renderControl('Next', current_page + 1, false, current_page === last_page)}
        </ul>
      </nav>
    );
  }
}

export default Pagination;

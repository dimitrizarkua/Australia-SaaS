import * as React from 'react';
import {Link} from 'react-router-dom';
import InvertedPrimaryButton from 'src/components/Buttons/InvertedPrimaryButton';

interface IProps {
  jobId: number;
}

class ViewJobButton extends React.PureComponent<IProps> {
  public render() {
    const {jobId} = this.props;

    return (
      <Link to={`/job/${jobId}/details`}>
        <InvertedPrimaryButton className="btn">View Job</InvertedPrimaryButton>
      </Link>
    );
  }
}

export default ViewJobButton;

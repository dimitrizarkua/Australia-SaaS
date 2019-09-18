import * as React from 'react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import ReferenceBarItem from 'src/components/ReferenceBar/ReferenceBarItem';

const Period = styled.div`
  margin: 5px 0;
`;

interface IProps {
  referrals: any[];
}

class ContactJobs extends React.PureComponent<IProps> {
  public render() {
    return (
      <ReferenceBarItem caption="Jobs" collapsable={true}>
        {this.props.referrals &&
          this.props.referrals.map(r => (
            <Period key={r.year}>
              <strong>{r.year}</strong>
              <p>
                Referrals: {r.referrals}
                <br />
                Jobs (invoice to): {r.invoice}
              </p>
            </Period>
          ))}
        <div>
          <Link to={``}>View jobs</Link>
        </div>
        <div>
          <Link to={``}>View referrals</Link>
        </div>
      </ReferenceBarItem>
    );
  }
}

export default ContactJobs;

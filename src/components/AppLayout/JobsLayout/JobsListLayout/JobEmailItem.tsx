import * as React from 'react';
import {IJob} from 'src/models/IJob';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import EmailItemMenu from './EmailItemMenu';
import Moment from 'react-moment';
import withoutProps from 'src/components/withoutProps/withoutProps';
import {FRONTEND_DATE_TIME} from 'src/constants/Date';

interface IProps {
  job?: IJob | null;
  header: string;
  text: string;
  date: string;
  from: string;
  to: string;
  pinned_at: boolean;
}

const EmailBox = styled(withoutProps(['expanded'])('div'))<{expanded: boolean}>`
  overflow: hidden;
  position: relative;
  padding: 15px 10px 15px 20px;
  border: 1px solid ${ColorPalette.gray2};
  margin-top: -1px;
  text-decoration: none;
  background: ${props => (props.expanded ? ColorPalette.gray1 : ColorPalette.white)};

  :hover {
    background: ${props => (props.expanded ? ColorPalette.gray1 : ColorPalette.gray0)};
    text-decoration: none;
  }

  & *:hover {
    text-decoration: none;
  }
`;

const EmailFrom = styled.div`
  font-size: ${Typography.size.smaller};
  font-weight: ${Typography.weight.medium};
  width: 20%;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const EmailHeaderRead = styled.div`
  font-size: ${Typography.size.smaller};
  max-width: 20%;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 5px;
`;

const EmailHeaderUnread = styled(EmailHeaderRead)`
  font-weight: ${Typography.weight.medium};
`;

const EmailTextPreview = styled.div`
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 58%;
  margin-left: 5px;
  color: ${ColorPalette.gray5};
`;

const TextBox = styled.div`
  border: 1px solid ${ColorPalette.gray2};
  margin-top: -1px;
  padding: 17px 20px;
  padding-bottom: 25px;
`;

const ExpandedEmailFrom = styled.span`
  font-size: ${Typography.size.smaller};
  font-weight: ${Typography.weight.medium};
  margin-right: 5px;
`;

const ExpandedEmailTo = styled.span`
  font-size: ${Typography.size.smaller};
  font-weight: ${Typography.weight.normal};
  color: ${ColorPalette.gray5};
`;

const EmailInfo = styled.div`
  margin-bottom: 25px;
`;

const EmailDate = styled(ExpandedEmailTo)`
  width: 25%;
  margin-left: auto;
  text-align: right;
`;

const NewLabel = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: ${ColorPalette.orange1};
  transform: rotate(45deg);
  left: -10px;
  top: -10px;
`;

class JobsEmailItem extends React.PureComponent<IProps> {
  public state = {
    expanded: false
  };

  public expandEmail = () => {
    this.setState({expanded: !this.state.expanded});
  };

  public render() {
    const {from, header, text, pinned_at, to, date} = this.props;

    return (
      <div className="d-flex flex-column">
        <EmailBox className="d-flex flex-row" expanded={this.state.expanded} onClick={this.expandEmail}>
          {Math.random() > 0.5 && <NewLabel />}
          {!this.state.expanded && <EmailFrom className="align-self-center">{from}</EmailFrom>}
          <EmailHeaderUnread className="align-self-center">{header}</EmailHeaderUnread>
          {!this.state.expanded && ' - '}
          {!this.state.expanded && <EmailTextPreview className="align-self-center">{text}</EmailTextPreview>}
          <EmailItemMenu pinned_at={pinned_at} expanded={this.state.expanded} />
        </EmailBox>
        {this.state.expanded && (
          <TextBox className="d-flex flex-column">
            <EmailInfo className="d-flex flex-row">
              <ExpandedEmailFrom>{from}</ExpandedEmailFrom>
              <ExpandedEmailTo>to {to}</ExpandedEmailTo>
              <EmailDate>
                <Moment format={FRONTEND_DATE_TIME}>{date}</Moment>
              </EmailDate>
            </EmailInfo>
            {text}
          </TextBox>
        )}
      </div>
    );
  }
}

export default JobsEmailItem;

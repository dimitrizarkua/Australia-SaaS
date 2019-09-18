import * as React from 'react';
import ReferenceBarItem from './ReferenceBarItem';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import styled from 'styled-components';
import {IContactAssignment} from 'src/models/IJob';
import {IRawContactAddress, AddressType, IContact} from 'src/models/IContact';
import {IFinanceRecipientContact} from 'src/models/FinanceModels/ICommonFinance';
import {ITag} from 'src/models/ITag';
import Icon, {IconName} from 'src/components/Icon/Icon';
import ContactService from 'src/services/ContactService';

interface IProps {
  contact: Partial<IContactAssignment & IFinanceRecipientContact & IContact>;
}

const ContactType = styled.span`
  color: ${ColorPalette.gray4};
  font-size: ${Typography.size.smaller};
  margin-right: 10px;
`;

const MoreLessButton = styled.div`
  display: inline-block;
  cursor: pointer;
  color: ${ColorPalette.blue4};
  font-size: ${Typography.size.smaller};
`;

const MoreInfoBlock = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin: 0;
`;

const Alert = styled.div`
  margin-top: 5px;
  color: ${ColorPalette.orange2};
`;

const AlertIcon = styled(Icon)`
  vertical-align: sub;
  margin-right: 4px;

  & path,
  circle {
    stroke: ${ColorPalette.orange2};
  }
`;

class ReferenceBarContactItem extends React.PureComponent<IProps> {
  public state = {showMoreInfo: false};

  private toggleMoreInfo = () => {
    this.setState({showMoreInfo: !this.state.showMoreInfo});
  };

  public render() {
    const {
      mobile_phone,
      direct_phone,
      business_phone,
      mailing_address,
      addresses,
      email,
      assignment_type,
      website,
      tags
    } = this.props.contact;

    const hasAdditionalInfo = email || business_phone || mobile_phone || direct_phone || website;
    const address =
      (addresses && addresses.find((a: IRawContactAddress) => a.type === AddressType.street)) || mailing_address;
    const contactName = ContactService.getContactName(this.props.contact) || email || '';

    return (
      <ReferenceBarItem caption={contactName} hasMenu={false}>
        {address && address.full_address}
        {this.state.showMoreInfo && hasAdditionalInfo && (
          <MoreInfoBlock>
            {business_phone && <li>{`Business Phone: ${business_phone}`}</li>}
            {mobile_phone && <li>{`Mobile Phone: ${mobile_phone}`}</li>}
            {direct_phone && <li>{`Direct Phone: ${direct_phone}`}</li>}
            {email && <li>{`Email: ${email}`}</li>}
            {website && <li>{`website: ${website}`}</li>}
          </MoreInfoBlock>
        )}
        <div>
          {assignment_type && <ContactType>{assignment_type!.name}</ContactType>}
          {hasAdditionalInfo && (
            <MoreLessButton onClick={this.toggleMoreInfo}>{this.state.showMoreInfo ? 'less' : 'more'}</MoreLessButton>
          )}
          {tags && tags.find((tag: ITag) => tag.is_alert) && (
            <Alert>
              <AlertIcon name={IconName.Alert} size={18} /> Alerts
            </Alert>
          )}
        </div>
      </ReferenceBarItem>
    );
  }
}

export default ReferenceBarContactItem;

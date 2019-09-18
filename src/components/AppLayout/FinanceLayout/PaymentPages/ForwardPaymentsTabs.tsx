import * as React from 'react';
import TabNav, {ITab} from 'src/components/TabNav/TabNav';
import {TabsHolder} from './PaymentStyledComponents';

export enum ForwardTabs {
  new = 'new',
  received = 'received'
}

interface IProps {
  activeTabId: ForwardTabs;
  onChangePage: () => void;
}

const ForwardPaymentsTabs = (props: IProps) => {
  const getAction = (id: ForwardTabs) => (id === props.activeTabId ? undefined : props.onChangePage);

  const tabs: ITab[] = [
    {
      name: 'New Transfer',
      id: ForwardTabs.new,
      onClick: getAction(ForwardTabs.new)
    },
    {
      name: 'Received Remittences',
      id: ForwardTabs.received,
      onClick: getAction(ForwardTabs.received)
    }
  ];

  return (
    <TabsHolder>
      <TabNav items={tabs} selectedTabId={props.activeTabId} />
    </TabsHolder>
  );
};

export default ForwardPaymentsTabs;

import React from 'react';
import {IconName} from 'src/components/Icon/Icon';
import FullSidebarMenuItem from 'src/components/SidebarMenu/FullSidebarMenuItem';
import FullSidebarMenu from 'src/components/SidebarMenu/FullSidebarMenu';

interface IManageSidebar {
  activeLink: string;
}

const config = [
  {
    path: '/manage/contract',
    icon: IconName.FileEdit,
    label: 'Contract',
    type: 'contract'
  },
  {
    path: '/manage/location',
    icon: IconName.LocationPin,
    label: 'Locations',
    type: 'location'
  },
  {
    path: '/manage/form-option',
    icon: IconName.FileCash,
    label: 'Form Options',
    type: 'form_option'
  },
  {
    path: '/manage/tag',
    icon: IconName.Tags,
    label: 'Tags',
    type: 'tag'
  },
  {
    path: '/manage/user',
    icon: IconName.People,
    label: 'User',
    type: 'user'
  }
];

export default function ManageSidebar({activeLink}: IManageSidebar) {
  return (
    <FullSidebarMenu>
      {config.map(item => (
        <FullSidebarMenuItem key={item.path} item={{...item, isActive: item.type === activeLink}} />
      ))}
    </FullSidebarMenu>
  );
}

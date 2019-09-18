import React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {AvatarSquare} from 'src/components/Layout/Common/StyledComponents';
import {IUserNames} from 'src/utility/Helpers';

interface IUserProfileBox {
  photo: string | undefined;
  names: IUserNames;
  location?: string;
}

const UserProfile = styled.div`
  border: 1px solid ${ColorPalette.white1};
  padding: 10px;
`;

const UserInfo = styled.div`
  overflow: hidden;
`;

const LocationBlock = styled.div`
  color: ${ColorPalette.gray4} !important;
`;

function UserProfileBox({photo, names, location}: IUserProfileBox) {
  return (
    <UserProfile className="w-100 d-flex align-items-center f-row">
      <AvatarSquare wh={50} backgroundUrl={photo} margin="0 10px 0 0" className="flex-shrink-0">
        {!photo && names.initials}
      </AvatarSquare>
      <UserInfo className="d-flex flex-grow-1 flex-column">
        <div>{names.full_name}</div>
        <LocationBlock>{location}</LocationBlock>
      </UserInfo>
    </UserProfile>
  );
}

export default React.memo(UserProfileBox);

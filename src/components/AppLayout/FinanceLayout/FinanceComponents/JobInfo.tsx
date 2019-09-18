import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

const JobInfoSpan = styled.span`
  color: ${ColorPalette.gray5};
`;

interface IProps {
  job?: any;
  withoutName?: boolean;
  locationOnly?: boolean;
}

export default ({job, withoutName, locationOnly = false}: IProps) => {
  const insurerName = !locationOnly && job && job.insurer ? job.insurer.contact_name || job.insurer.legal_name : '';
  const locationDisplaysName = job && job.owner_location && job.owner_location.code;
  return (
    <JobInfoSpan>
      {job ? (
        <>
          {job.id}
          {locationDisplaysName && `-${locationDisplaysName}`}
          {withoutName ? '' : insurerName && `: ${insurerName}`}
        </>
      ) : (
        <>&nbsp;&nbsp;&nbsp;—&nbsp;&nbsp;&nbsp;</>
      )}
    </JobInfoSpan>
  );
};

import Permission from 'src/constants/Permission';
import * as React from 'react';

export interface IUserContext {
  has: (permission: Permission) => boolean;
}

const UserContext = React.createContext<IUserContext>({
  has: () => false
});

export default UserContext;

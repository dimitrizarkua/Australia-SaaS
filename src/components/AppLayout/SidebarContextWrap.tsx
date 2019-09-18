import React, {useState} from 'react';

export interface ISidebarContext {
  toggleSidebar: () => void;
  isOpen: boolean;
}
export const SidebarContext: React.Context<ISidebarContext> = React.createContext<ISidebarContext>({
  isOpen: true,
  toggleSidebar: () => null
});

export function SidebarContextWrap(Component: React.ComponentClass<any>) {
  return React.memo(props => {
    const [isOpen, changeState] = useState(true);
    const handleToggle = () => changeState(!isOpen);

    return (
      <SidebarContext.Provider value={{isOpen, toggleSidebar: handleToggle}}>
        <Component {...props} />
      </SidebarContext.Provider>
    );
  });
}

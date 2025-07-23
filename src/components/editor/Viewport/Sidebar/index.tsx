import { useEditor } from '@craftjs/core';
import { styled } from 'styled-components';


import { Toolbar } from '../../Toolbar';

export const SidebarDiv = styled.div<{ $enabled: boolean }>`
  opacity: ${(props) => (props.$enabled ? 1 : 0)};
  background: #fff;
  margin-right: ${(props) => (props.$enabled ? 0 : -280)}px;
`;



export const Sidebar = ({ isFixed }: { isFixed: boolean }) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <SidebarDiv $enabled={enabled} className={`sidebar transition bg-white w-2 h-full ${isFixed ? 'w-full sm:w-[280px]' : 'w-full'}`}>
      
        <Toolbar />

    </SidebarDiv>
  );
};

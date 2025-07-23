import React from 'react';
import ReactDOM from 'react-dom';
import { FaGripLines, FaPlus, FaCopy } from 'react-icons/fa';
import { SectionBottomIndicatorProps } from '../types/RenderNodeTypes';
import { SectionIndicatorDiv, Btn } from '../styles/RenderNodeStyles';

export const SectionBottomIndicator: React.FC<SectionBottomIndicatorProps> = ({
  dom,
  isSection,
  isActive,
  handleResizeMouseDown,
  addNewSection,
}) => {
  if (!isSection || !isActive || !dom) return null;

  if (!document.body.contains(dom)) return null;

  return ReactDOM.createPortal(
    <SectionIndicatorDiv>
      <div className='p-2 bg-white rounded-lg'>
        <Btn
          title="Resize section height"
          onMouseDown={handleResizeMouseDown}
          onTouchStart={handleResizeMouseDown}
          style={{
            cursor: 'ns-resize',
            touchAction: 'none' // Prevent default touch behaviors
          }}
        >
          <FaGripLines className='text-black'/>
        </Btn>
      </div>
      <div className='p-2 bg-white rounded-lg'>
        <Btn
          title="Add new section below"
          onClick={addNewSection}
        >
          Thêm section
          <FaPlus className='text-black'/>
        </Btn>
      </div>
    </SectionIndicatorDiv>,
    dom
  );
}; 
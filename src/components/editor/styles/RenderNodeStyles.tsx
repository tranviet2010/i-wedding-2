import { styled } from 'styled-components';
import { zIndex } from '@/utils/zIndex';

export const IndicatorDiv = styled.div`
  height: 30px;
  margin-top: -29px;
  font-size: 12px;
  line-height: 12px;
  z-index: ${zIndex.renderNodeHighlight};
  background-color: #2266EE;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 3px;
  color: white;
  position: fixed;

  svg {
    fill: #fff;
    width: 15px;
    height: 15px;
  }
`;

export const Btn = styled.a`
  padding: 0 8px;
  opacity: 0.9;
  display: flex;
  gap: 5px;
  align-items: center;
  cursor: pointer;
  color: #000000;
  &:hover {
    opacity: 1;
  }
`;

export const LayerControls = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 30px;
  right: 0;
  background-color: #2266EE;
  border-radius: 3px;
  padding: 8px;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
  z-index: ${zIndex.renderNodeHighlight};
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

export const SectionIndicatorDiv = styled.div`
  height: 30px;
  width: 100%;
  font-size: 12px;
  line-height: 12px;
  z-index: ${zIndex.renderNodeHighlight};
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 3px 3px;
  color: white;
  position: absolute;
  bottom: 0px;
  left: 0;
  cursor: default;
`;

export const SafeAreaBorders = styled.div<{
  platform?: 'desktop' | 'mobile';
  mobileWidth?: string;
  desktopWidth?: string;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: ${zIndex.renderNode};

  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    border-left: 1px dashed #2266EE;
    z-index: ${zIndex.quickActions};
  }

  &::before {
    left: ${props => props.platform === 'mobile'
      ? `calc((100% - ${props.mobileWidth || '420px'}) / 2)`
      : `calc((100% - ${props.desktopWidth || '960px'}) / 2)`};
  }

  &::after {
    right: ${props => props.platform === 'mobile'
      ? `calc((100% - ${props.mobileWidth || '420px'}) / 2)`
      : `calc((100% - ${props.desktopWidth || '960px'}) / 2)`};
  }
`;

export const MiddleGuides = styled.div<{ isSection: boolean; isVertical?: boolean; isHorizontal?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: ${zIndex.renderNodeHighlight};

  &::before {
    content: ${props => props.isVertical ? "''" : 'none'};
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    border-left: ${props => props.isSection ? '1px' : '1px'} dashed #f97316;
    z-index: ${zIndex.renderNodeHighlight};
    transform: translateX(-50%);
  }

  &::after {
    content: ${props => props.isHorizontal ? "''" : 'none'};
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    border-top: ${props => props.isSection ? '1px' : '1px'} dashed #f97316;
    z-index: ${zIndex.renderNodeHighlight};
    transform: translateY(-50%);
  }
`; 
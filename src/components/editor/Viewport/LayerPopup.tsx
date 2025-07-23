import {
  Box
} from '@chakra-ui/react';
import { Layers } from '@craftjs/layers';
import React from 'react';
import { IoMdClose } from "react-icons/io";
import { useViewport } from './ViewportContext';
import { zIndex } from '@/utils/zIndex';

export const LayerPopup: React.FC = () => {
  const { isLayerVisible, toggleLayer } = useViewport();

  return (
    <>
      {isLayerVisible && (
        <div className='absolute top-0 left-0 w-[280px] h-full bg-white p-5 flex flex-col gap-2' style={{ zIndex: zIndex.layerPopup }}>
          <div className='flex justify-between items-center'>
            <p className='text-sm font-bold'>Lớp</p>
            <Box
              as="button"
              onClick={() => toggleLayer(false)}
              cursor="pointer"
            >
              <IoMdClose size={20} />
            </Box>
          </div>
          <Layers expandRootOnLoad={true} />
        </div>
      )}
    </>
  );
};
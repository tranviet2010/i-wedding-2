import React, { useState } from 'react';
import { zIndex } from '@/utils/zIndex';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
}

// Sample images for demonstration
const sampleImages = [
  '/images/backgrounds/bg1.jpg',
  '/images/backgrounds/bg2.jpg',
  '/images/backgrounds/bg3.jpg',
  '/images/backgrounds/bg4.jpg',
  '/images/backgrounds/bg5.jpg',
  '/images/backgrounds/bg6.jpg',
  'https://images.unsplash.com/photo-1557683316-973673baf926',
  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d',
  'https://images.unsplash.com/photo-1579546929662-711aa81148cf',
];

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ 
  isOpen, 
  onClose, 
  onImageSelect
}) => {
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'url'
  
  if (!isOpen) return null;
  
  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    onClose();
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customImageUrl.trim()) {
      onImageSelect(customImageUrl);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center " 
      onClick={handleBackdropClick}
      style={{ zIndex: zIndex.imagePicker }}
    >
      <div 
        className="bg-white rounded-lg p-6 w-[600px] max-w-full max-h-[80vh] overflow-auto border border-gray-300" 
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium mb-4">Chọn ảnh nền</h3>
        
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button 
            className={`py-2 px-4 ${activeTab === 'gallery' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('gallery')}
          >
            Thư viện ảnh
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'url' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('url')}
          >
            URL ảnh
          </button>
        </div>
        
        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-3 gap-3">
            {sampleImages.map((image, index) => (
              <div 
                key={index} 
                className="aspect-video bg-gray-100 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageSelect(image)}
              >
                <img 
                  src={image} 
                  alt={`Background ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        
        {/* URL Tab */}
        {activeTab === 'url' && (
          <form onSubmit={handleCustomUrlSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">URL ảnh</label>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Áp dụng
              </button>
            </div>
          </form>
        )}
        
        {/* Footer */}
        {activeTab === 'gallery' && (
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 
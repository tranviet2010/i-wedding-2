import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FiX, FiSearch, FiUpload } from 'react-icons/fi';
import * as FaIcons from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';
import { popularIcons } from '@/utils/icons';
import { useGetFiles, uploadFile, FileType } from '../../../features/files/fileAPI';
import { domainFile } from '@/api/apiClient';
import { zIndex } from '@/utils/zIndex';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIconSelect: (svgCode: string) => void;
  initialSearchTerm?: string;
}


// Convert React Icon to SVG string
const iconToSvg = (IconComponent: React.ComponentType<any>): string => {
  try {
    const iconElement = React.createElement(IconComponent, {
      size: 24,
      style: { width: '100%', height: '100%' }
    });
    return renderToStaticMarkup(iconElement);
  } catch (error) {
    console.error('Error converting icon to SVG:', error);
    return '';
  }
};

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onIconSelect,
  initialSearchTerm = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [activeTab, setActiveTab] = useState<'fontawesome' | 'upload'>('fontawesome');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get uploaded SVG icons from backend
  const { data: uploadedIcons, refetch: refetchIcons } = useGetFiles(FileType.ICON);

  // Update search term when modal opens with initial search term
  useEffect(() => {
    if (isOpen && initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [isOpen, initialSearchTerm]);

  // Handle SVG file upload
  const handleSvgUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'image/svg+xml') {
      alert('Please select an SVG file');
      return;
    }

    // Check file size (2MB limit for SVG)
    if (file.size > 2 * 1024 * 1024) {
      alert('SVG file must be smaller than 2MB');
      return;
    }

    setIsUploading(true);

    try {
      const uploadedFileData = await uploadFile(file);
      const filePath = `${domainFile}${uploadedFileData.path}`;

      // Fetch the SVG content and pass it to the callback
      const response = await fetch(filePath);
      const svgContent = await response.text();

      onIconSelect(svgContent);
      refetchIcons(); // Refresh the list of uploaded icons
      onClose();
    } catch (error) {
      console.error('Error uploading SVG:', error);
      alert('Upload error: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    }
  };

  // Filter icons based on search term
  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) {
      return popularIcons;
    }

    const searchLower = searchTerm.toLowerCase();
    return Object.keys(FaIcons)
      .filter(iconName =>
        iconName.toLowerCase().includes(searchLower) &&
        iconName.startsWith('Fa') &&
        typeof (FaIcons as any)[iconName] === 'function'
      )
      .slice(0, 50); // Limit to 50 results for performance
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleIconSelect = (iconName: string) => {
    const IconComponent = (FaIcons as any)[iconName];
    if (IconComponent) {
      const svgCode = iconToSvg(IconComponent);
      if (svgCode) {
        onIconSelect(svgCode);
        onClose();
      }
    }
  };

  // Handle uploaded SVG icon selection
  const handleUploadedIconSelect = async (iconPath: string) => {
    try {
      const response = await fetch(`${domainFile}${iconPath}`);
      const svgContent = await response.text();
      onIconSelect(svgContent);
      onClose();
    } catch (error) {
      console.error('Error loading SVG:', error);
      alert('Error loading SVG icon');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      style={{ zIndex: zIndex.iconPicker }}
    >
      <div
        className="bg-white rounded-lg p-6 w-[700px] max-w-[90%] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Chọn biểu tượng</h3>
          <button onClick={onClose} className="p-1">
            <FiX className="text-2xl text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'fontawesome'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('fontawesome')}
          >
            FontAwesome Icons
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            Upload SVG
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'fontawesome' && (
            <>
              {/* Search Input */}
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm biểu tượng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* FontAwesome Icons Grid */}
              <div className="grid grid-cols-8 gap-3">
                {filteredIcons.map((iconName) => {
                  const IconComponent = (FaIcons as any)[iconName];
                  if (!IconComponent) return null;

                  return (
                    <div
                      key={iconName}
                      className="aspect-square border border-gray-200 rounded-md p-3 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center group"
                      onClick={() => handleIconSelect(iconName)}
                      title={iconName}
                    >
                      <IconComponent className="text-2xl text-gray-600 group-hover:text-blue-600" />
                    </div>
                  );
                })}
              </div>

              {filteredIcons.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không tìm thấy biểu tượng nào
                </div>
              )}
            </>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Upload Section */}
              <div className="flex flex-col items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleSvgUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex flex-col items-center justify-center gap-2 w-full h-32 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors disabled:opacity-50"
                >
                  <FiUpload className="text-3xl text-gray-400" />
                  <span className="text-gray-600">
                    {isUploading ? 'Uploading SVG...' : 'Nhấn để chọn SVG file tải lên'}
                  </span>
                  <span className="text-xs text-gray-500">Hỗ trợ định dạng SVG, tối đa 2MB</span>
                </button>
              </div>

              {/* Uploaded Icons Grid */}
              {uploadedIcons && uploadedIcons.length > 0 && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">SVG Icons đã tải lên</h4>
                    <div className="grid grid-cols-8 gap-3">
                      {uploadedIcons.map((icon) => (
                        <div
                          key={icon.id}
                          className="aspect-square border border-gray-200 rounded-md p-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center group"
                          onClick={() => handleUploadedIconSelect(icon.filePath)}
                          title={icon.originalName}
                        >
                          <img
                            src={`${domainFile}${icon.filePath}`}
                            alt={icon.originalName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Hiển thị {filteredIcons.length} biểu tượng
            {searchTerm && ` cho "${searchTerm}"`}
          </p>
        </div>
      </div>
    </div>
  );
};

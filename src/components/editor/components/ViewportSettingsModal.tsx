import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useViewport } from '../Viewport/ViewportContext';
import { useUpdateTemplate } from '@/features/template/templateAPI';
import { useViewportSettings } from '../contexts/ViewportSettingsContext';
import { zIndex } from '@/utils/zIndex';

export interface ViewportSettings {
  mobileWidth: string;
  desktopWidth: string;
  mobileOnly: boolean;
}

interface ViewportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: Partial<ViewportSettings>;
}

const defaultSettings: ViewportSettings = {
  mobileWidth: "380px",
  desktopWidth: "960px",
  mobileOnly: false
};

export const ViewportSettingsModal: React.FC<ViewportSettingsModalProps> = ({
  isOpen,
  onClose,
  initialValues
}) => {
  const [mobileWidth, setMobileWidth] = useState(defaultSettings.mobileWidth);
  const [desktopWidth, setDesktopWidth] = useState(defaultSettings.desktopWidth);
  const [mobileOnly, setMobileOnly] = useState(defaultSettings.mobileOnly);

  const { id, currentEditingPlatform, switchToPlatform } = useViewport();
  const { mutate: updateTemplate } = useUpdateTemplate();
  const { updateSettings } = useViewportSettings();

  // Initialize form values when modal opens
  useEffect(() => {
    if (isOpen) {
      setMobileWidth(initialValues.mobileWidth || defaultSettings.mobileWidth);
      setDesktopWidth(initialValues.desktopWidth || defaultSettings.desktopWidth);
      setMobileOnly(initialValues.mobileOnly || defaultSettings.mobileOnly);
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    // Show confirmation if enabling mobileOnly mode
    if (mobileOnly && !initialValues.mobileOnly) {
      const confirmed = window.confirm(
        'Bạn có chắc chắn muốn bật chế độ "Chỉ Mobile"?\n\n' +
        'Khi bật:\n' +
        '• Editor sẽ chỉ hiển thị giao diện mobile\n' +
        '• Không thể chuyển sang chế độ desktop\n' +
        '• Tính năng đồng bộ giữa mobile và desktop vẫn hoạt động bình thường\n' +
        '• Nội dung desktop vẫn được duy trì và có thể đồng bộ\n\n' +
        'Nhấn OK để tiếp tục hoặc Cancel để hủy.'
      );

      if (!confirmed) {
        return;
      }
    }

    const pageSettings: ViewportSettings = {
      mobileWidth,
      desktopWidth,
      mobileOnly,
    };

    try {
      await updateTemplate({
        id: Number(id),
        data: { pageSettings }
      });

      // Update the context with new settings
      updateSettings(pageSettings);

      // If mobileOnly is enabled and we're currently on desktop, force switch to mobile
      if (mobileOnly && currentEditingPlatform === 'desktop') {
        console.log('🔄 MobileOnly enabled - forcing switch to mobile platform');
        switchToPlatform('mobile');
      }

      onClose();

      // Reload page to apply new viewport settings
      window.location.reload();
    } catch (error) {
      console.error('Failed to save viewport settings:', error);
      alert('Không thể lưu cài đặt viewport. Vui lòng thử lại.');
    }
  };

  const mobileWidthOptions = ["320px", "380px", "420px"];
  const desktopWidthOptions = ["960px", "1200px"];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      onClick={handleBackdropClick}
            style={{ zIndex: zIndex.viewportSettings, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="bg-white rounded-lg p-6 w-[500px] max-w-[90%] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Cài đặt toàn trang</h3>
          <button onClick={onClose} className="p-1">
            <FiX className="text-2xl text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Mobile Width Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chiều rộng Mobile
            </label>
            <select
              value={mobileWidth}
              onChange={(e) => setMobileWidth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mobileWidthOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Chiều rộng tối đa của nội dung trên mobile
            </p>
          </div>

          {/* Desktop Width Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chiều rộng Desktop
            </label>
            <select
              value={desktopWidth}
              onChange={(e) => setDesktopWidth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {desktopWidthOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Chiều rộng tối đa của nội dung trên desktop và ngưỡng breakpoint
            </p>
          </div>

          {/* Mobile Only Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chế độ chỉ Mobile
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mobileOnly"
                  checked={!mobileOnly}
                  onChange={() => setMobileOnly(false)}
                  className="mr-2"
                />
                <span className="text-sm">Cho phép cả Desktop và Mobile</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mobileOnly"
                  checked={mobileOnly}
                  onChange={() => setMobileOnly(true)}
                  className="mr-2"
                />
                <span className="text-sm">Chỉ Mobile</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Khi bật "Chỉ Mobile", editor sẽ chỉ hiển thị giao diện mobile. Tính năng đồng bộ vẫn hoạt động bình thường.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

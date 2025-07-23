import React, { useState, useEffect } from 'react';
import { FiX, FiCode, FiEye } from 'react-icons/fi';
import DOMPurify from 'dompurify';
import { zIndex } from '@/utils/zIndex';

interface HtmlEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (html: string) => void;
}

export const HtmlEditorModal: React.FC<HtmlEditorModalProps> = ({
  isOpen,
  onClose,
  initialValue,
  onSave
}) => {
  const [customHtml, setCustomHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCustomHtml(initialValue || '');
      setValidationError('');
      setShowPreview(false);
      setIsSaving(false);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const validateHtml = (html: string): boolean => {
    try {
      if (!html.trim()) {
        setValidationError('');
        return true; // Empty HTML is valid
      }

      // Basic syntax validation
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Check for unclosed quotes in attributes
      const unclosedQuotes = html.match(/\w+\s*=\s*["'][^"']*$/m);
      if (unclosedQuotes) {
        setValidationError('Thuộc tính HTML có dấu ngoặc kép không được đóng đúng.');
        return false;
      }

      // Check for obviously malformed tags
      const malformedTags = html.match(/<[^>]*[<]/g);
      if (malformedTags) {
        setValidationError('Có thẻ HTML không đúng định dạng.');
        return false;
      }

      // Check for script tags without proper closing (basic security)
      if (html.toLowerCase().includes('<script') && 
          !html.toLowerCase().includes('</script>')) {
        setValidationError('Thẻ script phải được đóng đúng cách.');
        return false;
      }

      // If we get here, it's likely valid
      setValidationError('');
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError('Không thể xác thực mã HTML. Vui lòng kiểm tra cú pháp.');
      return false;
    }
  };

  const handleHtmlChange = (value: string) => {
    setCustomHtml(value);
    validateHtml(value);
  };

  const handleSave = async () => {
    console.log('Attempting to save HTML:', customHtml);
    console.log('Current validation error:', validationError);
    
    const isValid = validateHtml(customHtml);
    console.log('Validation result:', isValid);
    
    if (!isValid) {
      console.log('Validation failed, not saving');
      return;
    }

    setIsSaving(true);
    
    try {
      // Sanitize HTML before saving with more permissive settings
      const sanitizedHtml = getSanitizedHtml(customHtml);
      console.log('Sanitized HTML:', sanitizedHtml);

      console.log('Calling onSave callback...');
      await onSave(sanitizedHtml);
      
      console.log('Closing modal...');
      onClose();
    } catch (error) {
      console.error('Error during save:', error);
      setValidationError('Đã xảy ra lỗi khi lưu. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getSanitizedHtml = (html: string) => {
    // OPTION 1: Completely bypass sanitization (allows everything including scripts)
    return html;
    
    // OPTION 2: Use DOMPurify with maximum permissiveness (uncomment to use)
    /*
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ['iframe', 'script', 'style', 'object', 'embed', 'link', 'meta', 'base'],
      ADD_ATTR: ['allowfullscreen', 'frameborder', 'scrolling', 'sandbox', 'srcdoc', 'onload', 'onerror'],
      ALLOW_DATA_ATTR: true,
      ALLOW_UNKNOWN_PROTOCOLS: true,
      ALLOW_ARIA_ATTR: true,
      KEEP_CONTENT: true,
      WHOLE_DOCUMENT: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      FORBID_TAGS: [], // Don't forbid any tags
      FORBID_ATTR: [], // Don't forbid any attributes
      FORCE_BODY: false,
      SANITIZE_DOM: false
    });
    */
  };

  const getSanitizedPreview = () => {
    return getSanitizedHtml(customHtml);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      style={{ zIndex: zIndex.htmlEditor }}
    >
      <div
        className="bg-white rounded-lg p-6 w-[800px] max-w-[90%] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Chỉnh sửa HTML</h3>
          <button onClick={onClose} className="p-1">
            <FiX className="text-2xl text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col">
          {/* Toggle Preview Button */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Nhập mã HTML tùy chỉnh cho component
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center gap-2"
            >
              {showPreview ? <FiCode /> : <FiEye />}
              {showPreview ? 'Chỉnh sửa' : 'Xem trước'}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-grow overflow-hidden">
            {!showPreview ? (
              <div className="h-full flex flex-col">
                <label className="block text-sm font-medium mb-2">Mã HTML:</label>
                <textarea
                  value={customHtml}
                  onChange={(e) => handleHtmlChange(e.target.value)}
                  placeholder="Nhập mã HTML tùy chỉnh của bạn..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono resize-none"
                  style={{ minHeight: '300px' }}
                />
                {validationError && (
                  <div className="mt-2 text-red-600 text-sm">
                    {validationError}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <label className="block text-sm font-medium mb-2">Xem trước:</label>
                <div 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm overflow-auto bg-gray-50"
                  style={{ minHeight: '300px' }}
                  dangerouslySetInnerHTML={{ __html: getSanitizedPreview() }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!!validationError || isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

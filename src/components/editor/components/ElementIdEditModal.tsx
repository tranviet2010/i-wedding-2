import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useEditor } from '@craftjs/core';
import { zIndex } from '@/utils/zIndex';

interface ElementIdEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentElementId: string;
}

export const ElementIdEditModal: React.FC<ElementIdEditModalProps> = ({
  isOpen,
  onClose,
  currentElementId
}) => {
  const [newId, setNewId] = useState('');
  const [validationError, setValidationError] = useState('');
  const { actions, query } = useEditor();

  useEffect(() => {
    if (isOpen && currentElementId) {
      try {
        const currentNode = query.node(currentElementId).get();
        const existingCustomId = currentNode.data.custom?.customId;
        // Use existing custom ID if available, otherwise use the craft.js node ID as default
        setNewId(existingCustomId || currentElementId);
        setValidationError('');
      } catch (error) {
        console.error('Error getting current node:', error);
        setNewId(currentElementId);
        setValidationError('');
      }
    }
  }, [isOpen, currentElementId, query]);

  if (!isOpen) return null;

  const validateId = (id: string): boolean => {
    if (!id.trim()) {
      setValidationError('ID không được để trống');
      return false;
    }

    // Check for valid ID format (alphanumeric, underscore, hyphen)
    const validIdRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
    if (!validIdRegex.test(id)) {
      setValidationError('ID phải bắt đầu bằng chữ cái và chỉ chứa chữ cái, số, dấu gạch dưới và dấu gạch ngang');
      return false;
    }

    // Check if custom ID already exists (excluding current element)
    try {
      const allNodes = query.getNodes();
      const existingCustomIds = Object.values(allNodes)
        .map((node: any) => node.data.custom?.customId)
        .filter(Boolean)
        .filter((customId: string) => {
          // Exclude current element's custom ID
          const currentNode = query.node(currentElementId).get();
          return customId !== currentNode.data.custom?.customId;
        });

      if (existingCustomIds.includes(id)) {
        setValidationError('ID này đã tồn tại, vui lòng chọn ID khác');
        return false;
      }
    } catch (error) {
      console.error('Error checking ID uniqueness:', error);
      setValidationError('Không thể kiểm tra tính duy nhất của ID');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleIdChange = (value: string) => {
    setNewId(value);
    try {
      const currentNode = query.node(currentElementId).get();
      const existingCustomId = currentNode.data.custom?.customId || currentElementId;

      if (value !== existingCustomId) {
        validateId(value);
      } else {
        setValidationError('');
      }
    } catch (error) {
      validateId(value);
    }
  };

  const handleSave = () => {
    if (!validateId(newId)) {
      return;
    }

    // Check if the new ID is the same as the current custom ID
    try {
      const currentNode = query.node(currentElementId).get();
      const existingCustomId = currentNode.data.custom?.customId || currentElementId;

      if (newId === existingCustomId) {
        onClose();
        return;
      }
    } catch (error) {
      console.error('Error getting current custom ID:', error);
    }

    if (!currentElementId) {
      setValidationError('Không có phần tử nào được chọn');
      return;
    }

    try {
      // Approach 3: Store custom ID in the node's custom property instead of changing the actual ID
      // This is the safest approach as it doesn't interfere with craft.js internal ID management

      // Check if the new ID is already used as a custom ID
      const allNodes = query.getNodes();
      const existingCustomIds = Object.values(allNodes)
        .map((node: any) => node.data.custom?.customId)
        .filter(Boolean);

      if (existingCustomIds.includes(newId)) {
        setValidationError('ID này đã được sử dụng, vui lòng chọn ID khác');
        return;
      }

      // Set the custom ID using setCustom
      actions.setCustom(currentElementId, (custom: any) => {
        custom.customId = newId;
      });

      onClose();
    } catch (error) {
      console.error('Error updating element ID:', error);
      setValidationError('Không thể cập nhật ID. Vui lòng thử lại.');
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
      style={{ zIndex: zIndex.elementIdEdit }}
    >
      <div
        className="bg-white rounded-lg p-6 w-[500px] max-w-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Chỉnh sửa ID phần tử</h3>
          <button onClick={onClose} className="p-1">
            <FiX className="text-2xl text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ID phần tử
          </label>
          <input
            type="text"
            value={newId}
            onChange={(e) => handleIdChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập ID mới cho phần tử"
          />
          {validationError && (
            <p className="mt-1 text-sm text-red-600">{validationError}</p>
          )}
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Lưu ý:</strong> ID phải bắt đầu bằng chữ cái và chỉ chứa chữ cái, số, dấu gạch dưới (_) và dấu gạch ngang (-).
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!!validationError}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

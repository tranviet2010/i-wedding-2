import { useEditor, useNode } from '@craftjs/core';
import React, { useState } from 'react';
import { FiEdit2, FiCopy } from 'react-icons/fi';
import { ElementIdEditModal } from '../components/ElementIdEditModal';

export const Toolbar = () => {
  const [isIdEditModalOpen, setIsIdEditModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy ID:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = id;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const { active, related, parentRelated, name, displayId } = useEditor((state, query) => {
    const currentlySelectedNodeId = query.getEvent('selected').first();
    let isChildOfButton = false;
    let parent = null;
    let customId = null;

    if (currentlySelectedNodeId) {
      const nodeSelected = query.node(currentlySelectedNodeId).get();
      isChildOfButton = Boolean(nodeSelected.data.props.isChildOfButton);
      parent = nodeSelected.data.parent;
      customId = nodeSelected.data.custom?.customId;
    }

    return {
      active: currentlySelectedNodeId,
      related:
        currentlySelectedNodeId && state.nodes[currentlySelectedNodeId].related,
      parentRelated:
        isChildOfButton && parent &&
        query.node(parent).get().related as any,
      name: currentlySelectedNodeId
        ? state.nodes[currentlySelectedNodeId].data.displayName
        : null,
      displayId: customId || currentlySelectedNodeId
    };
  });



  return (
    <div className="py-1 h-full">
      {active ? (
        <div
          className="flex w-full items-center px-4 text-center text-sm font-bold "
        >
          <span>{name} - ID: {displayId}</span>
          <button
            onClick={() => handleCopyId(displayId)}
            className="ml-2 p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title={copySuccess ? "Đã sao chép!" : "Sao chép ID"}
          >
            <FiCopy className={`text-sm ${copySuccess ? 'text-green-600' : ''}`} />
          </button>
          <button
            onClick={() => setIsIdEditModalOpen(true)}
            className="ml-1 p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Chỉnh sửa ID phần tử"
          >
            <FiEdit2 className="text-sm" />
          </button>
        </div>
      ) : null}
      {active && parentRelated.subToolbar && React.createElement(parentRelated.subToolbar)}
      {active && related.subToolbar && React.createElement(related.subToolbar)}
      {active && related.toolbar && React.createElement(related.toolbar)}
      {!active && (
        <div
          className="px-5 py-2 flex flex-col items-center h-full justify-center text-center"
          style={{
            color: 'rgba(0, 0, 0, 0.5607843137254902)',
            fontSize: '11px',
          }}
        >
          <h2 className="pb-1">Chọn phần tử để bắt đầu chỉnh sửa</h2>
        </div>
      )}

      {/* Element ID Edit Modal */}
      {active && (
        <ElementIdEditModal
          isOpen={isIdEditModalOpen}
          onClose={() => setIsIdEditModalOpen(false)}
          currentElementId={active}
        />
      )}
    </div>
  );
};

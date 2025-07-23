import React from 'react';
import { useNode } from '@craftjs/core';

import { FaSync, FaSyncAlt } from 'react-icons/fa';
import { useViewport } from '../Viewport/ViewportContext';
import { Switch } from '@chakra-ui/react';

interface CrossPlatformSyncToggleProps {
  className?: string;
}

/**
 * Reusable component for cross-platform sync toggle control
 * Shows current sync status and allows users to enable/disable sync for individual elements
 */
export const CrossPlatformSyncToggle: React.FC<CrossPlatformSyncToggleProps> = ({
  className = ''
}) => {
  const {
    actions: { setProp },
    syncCrossPlatform = true
  } = useNode((node) => ({
    syncCrossPlatform: node.data.props?.syncCrossPlatform
  }));

  const { currentEditingPlatform } = useViewport();

  const handleToggleSync = (enabled: boolean) => {
    setProp((props: any) => {
      props.syncCrossPlatform = enabled;
    });
  };

  return (
    <div className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {syncCrossPlatform ? (
            <FaSync className="text-blue-500 text-lg" />
          ) : (
            <FaSyncAlt className="text-gray-400 text-lg" />
          )}
          <div>
            <div className="font-medium text-sm">
              Đồng bộ đa nền tảng
            </div>
            <div className="text-xs text-gray-500">
              {syncCrossPlatform
                ? `Phần tử sẽ đồng bộ giữa Desktop và Mobile`
                : 'Phần tử không đồng bộ giữa các nền tảng'
              }
            </div>
          </div>
        </div>
      </div>
      <Switch.Root
        checked={syncCrossPlatform}
        onCheckedChange={(details) => handleToggleSync(details.checked)}
      >
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </div>
  );
};

/**
 * Compact version for use in toolbars or smaller spaces
 */
export const CrossPlatformSyncToggleCompact: React.FC<CrossPlatformSyncToggleProps> = ({
  className = ''
}) => {
  const {
    actions: { setProp },
    syncCrossPlatform = true
  } = useNode((node) => ({
    syncCrossPlatform: node.data.props?.syncCrossPlatform
  }));

  const handleToggleSync = (enabled: boolean) => {
    setProp((props: any) => {
      props.syncCrossPlatform = enabled;
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {syncCrossPlatform ? (
        <FaSync className="text-blue-500 text-sm" />
      ) : (
        <FaSyncAlt className="text-gray-400 text-sm" />
      )}
      <span className="text-sm font-medium">Đồng bộ</span>
      <Switch.Root
        checked={syncCrossPlatform}
        onCheckedChange={(details) => handleToggleSync(details.checked)}
        size="sm"
      >
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </div>
  );
};

/**
 * Status indicator only (no toggle functionality)
 */
export const CrossPlatformSyncStatus: React.FC<CrossPlatformSyncToggleProps> = ({
  className = ''
}) => {
  const {
    syncCrossPlatform = true
  } = useNode((node) => ({
    syncCrossPlatform: node.data.props?.syncCrossPlatform
  }));

  if (syncCrossPlatform) {
    return null; // Don't show anything when sync is enabled (default state)
  }

  return (
    <div className={`flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded ${className}`}>
      <FaSyncAlt className="text-xs" />
      <span>Không đồng bộ</span>
    </div>
  );
};

export default CrossPlatformSyncToggle;

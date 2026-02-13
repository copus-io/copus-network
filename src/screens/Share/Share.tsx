import React from 'react';
import { SharePanel } from '../../components/SharePanel/SharePanel';

export const Share: React.FC = () => {
  return <SharePanel isOpen={true} onClose={() => window.history.back()} />;
};
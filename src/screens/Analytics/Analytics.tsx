import React from 'react';
import { AnalyticsPanel } from '../../components/AnalyticsPanel/AnalyticsPanel';

export const Analytics: React.FC = () => {
  return <AnalyticsPanel isOpen={true} onClose={() => window.history.back()} />;
};
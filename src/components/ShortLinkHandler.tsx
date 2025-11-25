import React from 'react';
import { useParams } from 'react-router-dom';
import { MyTreasury } from '../routes/MyTreasury/screens/MyTreasury';

export const ShortLinkHandler: React.FC = () => {
  // Directly render MyTreasury component, namespace will be obtained through useParams in MainContentSection
  return <MyTreasury />;
};
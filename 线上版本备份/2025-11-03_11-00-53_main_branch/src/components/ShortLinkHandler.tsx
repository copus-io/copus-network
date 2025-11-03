import React from 'react';
import { useParams } from 'react-router-dom';
import { MyTreasury } from '../routes/MyTreasury/screens/MyTreasury';

export const ShortLinkHandler: React.FC = () => {
  // 直接渲染 MyTreasury 组件，namespace 会通过 useParams 在 MainContentSection 中获取
  return <MyTreasury />;
};
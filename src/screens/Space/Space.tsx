import React, { useEffect } from "react";
import { MainFrame } from "../MainFrame/MainFrame";
import { SpaceContentSection } from "./sections/SpaceContentSection";

export const Space = (): JSX.Element => {
  // 页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <MainFrame>
      <SpaceContentSection />
    </MainFrame>
  );
};
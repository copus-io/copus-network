import React from "react";
import { MainFrame } from "../MainFrame/MainFrame";
import { SpaceContentSection } from "./sections/SpaceContentSection";

export const Space = (): JSX.Element => {
  return (
    <MainFrame>
      <SpaceContentSection />
    </MainFrame>
  );
};
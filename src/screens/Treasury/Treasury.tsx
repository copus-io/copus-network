import React from "react";
import { useUser } from "../../contexts/UserContext";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { TreasuryContentSection } from "./sections/TreasuryContentSection/TreasuryContentSection";

export const Treasury = (): JSX.Element => {
  return (
    <PageWrapper activeMenuItem="treasury" requireAuth={true}>
      <TreasuryContentSection />
    </PageWrapper>
  );
};

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { TreasuryContentSection } from "./sections/TreasuryContentSection/TreasuryContentSection";

export const Treasury = (): JSX.Element => {
  const location = useLocation();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <PageWrapper activeMenuItem="treasury" requireAuth={true}>
      <TreasuryContentSection />
    </PageWrapper>
  );
};
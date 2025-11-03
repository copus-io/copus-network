import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { UserProfileContent } from "./sections/UserProfileContent";

export const UserProfile = (): JSX.Element => {
  const { namespace } = useParams<{ namespace: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    // If viewing own namespace, redirect to /my-treasury
    if (user && namespace === user.namespace) {
      navigate('/my-treasury', { replace: true });
    }
  }, [user, namespace, navigate]);

  if (!namespace) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">User not found</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <UserProfileContent namespace={namespace} />
    </PageWrapper>
  );
};
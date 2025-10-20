import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { UserProfileContent } from "./sections/UserProfileContent";

export const UserProfile = (): JSX.Element => {
  const { namespace } = useParams<{ namespace: string }>();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // 如果访问的是当前用户自己的namespace，重定向到 /my-treasury
    if (user && namespace === user.namespace) {
      navigate('/my-treasury', { replace: true });
    }
  }, [user, namespace, navigate]);

  if (!namespace) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">用户不存在</p>
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
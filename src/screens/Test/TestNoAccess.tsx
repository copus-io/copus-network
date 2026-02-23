import React from 'react';
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { NoAccessPermission } from '../../components/NoAccessPermission/NoAccessPermission';

export const TestNoAccess: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex justify-center overflow-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <div className="flex mt-0 w-full min-h-screen ml-0 relative flex-col items-start">
        <HeaderSection articleAuthorId={undefined} />
        <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex items-center justify-center pt-[70px] lg:pt-[120px]">
          <NoAccessPermission
            message="测试页面：该作品为作者私享内容，仅作者本人可查看"
          />
        </div>
      </div>
    </div>
  );
};
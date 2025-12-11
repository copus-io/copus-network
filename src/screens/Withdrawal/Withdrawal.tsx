import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { IncomeDetailsSection } from "./sections/IncomeDetailsSection";
import { AuthService } from "../../services/authService";
import { WithdrawalService } from "../../services/withdrawalService";

export const Withdrawal = (): JSX.Element => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchUserInfo = async (force: boolean = false) => {
    // 防抖逻辑：防止频繁调用
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;
    const MIN_INTERVAL = 2000; // 2秒间隔

    if (!force && timeSinceLastFetch < MIN_INTERVAL) {
      console.log('🚫 API call debounced, too frequent. Time since last:', timeSinceLastFetch + 'ms');
      return;
    }
    try {
      setLoading(true);
      console.log('🏠 Withdrawal page mounted, calling REAL userinfo API and transactions...');
      console.log('📍 Route: /withdrawal');
      console.log('🔄 Calling AuthService.getUserInfo() - the CORRECT userinfo API');

      // 并行调用用户信息和交易数据
      const [userInfoResponse, transactionResponse] = await Promise.all([
        AuthService.getUserInfo(),
        WithdrawalService.getTransactionHistory({
          pageIndex: 1,
          pageSize: 20,
          flowType: 0
        })
      ]);

      console.log('📥 REAL userinfo API response:', userInfoResponse);
      console.log('📧 Email field from userinfo:', userInfoResponse.email);

      console.log('📊 Transaction API response:', {
        fullResponse: transactionResponse,
        dataArray: transactionResponse.data,
        dataType: typeof transactionResponse.data,
        isDataArray: Array.isArray(transactionResponse.data),
        dataKeys: transactionResponse.data ? Object.keys(transactionResponse.data) : 'no data',
        dataKeysDetailed: transactionResponse.data ? Object.entries(transactionResponse.data).map(([key, value]) => ({
          key,
          type: typeof value,
          isArray: Array.isArray(value),
          length: Array.isArray(value) ? value.length : 'N/A'
        })) : 'no data',
        dataLength: transactionResponse.data?.length || 0,
        pageInfo: {
          pageIndex: transactionResponse.pageIndex,
          pageSize: transactionResponse.pageSize,
          totalCount: transactionResponse.totalCount,
          pageCount: transactionResponse.pageCount
        },
        rawResponseStructure: JSON.stringify(transactionResponse, null, 2)
      });

      setUserInfo(userInfoResponse);
      setTransactions(transactionResponse.data || []);

      const hasEmail = Boolean(userInfoResponse.email && userInfoResponse.email.trim().length > 0);

      console.log('🎯 Withdrawal page - REAL user status determined:', {
        userId: userInfoResponse.id,
        username: userInfoResponse.username,
        email: userInfoResponse.email,
        walletAddress: userInfoResponse.walletAddress,
        hasEmailBound: hasEmail,
        shouldShowWithdrawButton: hasEmail,
        shouldShowBindEmailButton: !hasEmail,
        transactionCount: transactionResponse.data?.length || 0,
        pageRoute: '/withdrawal',
        timestamp: new Date().toISOString()
      });

      if (hasEmail) {
        console.log('✅ User has email bound - withdrawal functionality available');
      } else {
        console.log('⚠️ User has no email bound - will show email binding flow');
      }

    } catch (error) {
      console.error('❌ Failed to fetch userinfo or transactions:', error);
    } finally {
      setLoading(false);
      lastFetchRef.current = Date.now();
    }
  };

  // 创建防抖版本的刷新函数
  const debouncedFetchUserInfo = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchUserInfo();
    }, 500);
  }, []);

  // 页面可见性监听器，统一处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, debounced refresh...');
        debouncedFetchUserInfo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [debouncedFetchUserInfo]);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    // 页面加载时立即调用真正的userinfo接口（强制执行，绕过防抖）
    fetchUserInfo(true);
  }, []);


  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] scroll-smooth" style={{scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch'}}>
      <HeaderSection />
      <SideMenuSection activeItem="income" />
      <div className="lg:ml-[360px] lg:mr-[40px] min-h-screen overflow-y-auto overflow-x-visible pt-[70px] lg:pt-[110px] pb-[100px] scroll-smooth transition-all duration-300 ease-in-out" style={{scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', scrollPaddingTop: '110px'}}>
        <div className="flex h-full items-center justify-center px-[30px] py-0 relative w-full transition-all duration-500 ease-in-out animate-in fade-in-0 slide-in-from-bottom-4" style={{willChange: 'transform, opacity'}}>
          <IncomeDetailsSection
            userInfo={userInfo}
            loading={loading}
            refreshUserInfo={fetchUserInfo}
            transactions={transactions}
          />
        </div>
      </div>
    </div>
  );
};
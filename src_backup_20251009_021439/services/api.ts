// API配置
const API_BASE_URL = 'https://api-test.copus.network';

// 通用的API请求函数
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit & { requiresAuth?: boolean } = {}
): Promise<T> => {
  const { requiresAuth, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;


  const defaultHeaders: Record<string, string> = {};

  // 只有不是FormData时才设置JSON Content-Type
  if (!(fetchOptions.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // 如果需要认证或者有token，添加到headers
  const token = localStorage.getItem('copus_token');

  if (requiresAuth) {
    if (!token || token.trim() === '') {
      console.error('❌ 需要认证但token无效或不存在');
      throw new Error('未找到有效的认证令牌，请重新登录');
    }

    // 检查token格式（JWT通常有3部分，用.分隔）
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      // 清除无效token
      localStorage.removeItem('copus_token');
      localStorage.removeItem('copus_user');
      throw new Error('认证令牌格式无效，请重新登录');
    }

    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      ...fetchOptions,
      headers: {
        ...defaultHeaders,
        ...fetchOptions.headers,
      },
    });


    if (!response.ok) {
      const errorText = await response.text();

      // 特殊处理认证相关错误
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('copus_token');
        localStorage.removeItem('copus_user');

        // 尝试解析错误信息
        let errorMessage = 'Authentication failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.msg || errorJson.message || errorMessage;
        } catch (e) {
          // 忽略JSON解析错误
        }

        throw new Error(`认证失败: ${errorMessage}，请重新登录`);
      }

      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();


    return data;
  } catch (error) {
    console.error(`❌ API request failed for ${endpoint}:`, error);

    // 检查是否是CORS错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`CORS or network error when accessing ${url}. Check if the API allows cross-origin requests.`);
    }

    throw error;
  }
};
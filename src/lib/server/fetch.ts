import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// 响应数据接口（根据 swagger.json 定义）
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  result?: number; // 100表示接口正常，其他数字表示错误码
  success?: boolean; // true表示请求成功，false表示接口报错
}

// 请求配置接口
export interface RequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean; // 是否跳过统一错误处理
  showError?: boolean; // 是否显示错误提示（可根据需要扩展）
}

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: '', // 从环境变量读取
  timeout: 60000, // 默认 60 秒超时
  withCredentials: true, // 携带凭证
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
  responseType: 'json',
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等认证信息
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    // 添加请求时间戳，防止缓存
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    
    // 根据 swagger.json 定义：result === 100 表示接口正常，success === true 表示请求成功
    // 优先检查 result 字段
    if (data.result !== undefined) {
      if (data.result === 100) {
        // result === 100 表示成功
        return response;
      } else {
        // 业务错误：result !== 100
        const error = new Error(data.message || '请求失败');
        (error as any).code = data.result;
        (error as any).data = data.data;
        (error as any).success = data.success;
        return Promise.reject(error);
      }
    }
    
    // 如果没有 result 字段，检查 success 字段
    if (data.success !== undefined) {
      if (data.success === true) {
        return response;
      } else {
        // success === false 表示失败
        const error = new Error(data.message || '请求失败');
        (error as any).success = data.success;
        (error as any).data = data.data;
        return Promise.reject(error);
      }
    }
    
    // 如果既没有 result 也没有 success，默认认为成功（兼容其他格式）
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;
      
      // 如果响应体包含业务错误信息，优先使用业务错误信息
      if (data && (data.result !== undefined || data.success !== undefined)) {
        const errorMessage = data.message || '请求失败';
        const businessError = new Error(errorMessage);
        (businessError as any).code = data.result;
        (businessError as any).success = data.success;
        (businessError as any).data = data.data;
        (businessError as any).status = status;
        return Promise.reject(businessError);
      }
      
      // HTTP 状态码错误处理
      switch (status) {
        case 401:
          // 未授权，可以跳转到登录页
          // window.location.href = '/login';
          console.error('未授权，请重新登录');
          break;
        case 403:
          console.error('没有权限访问');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error(`请求失败: ${status}`);
      }
      
      // 可以在这里添加全局错误提示
      // message.error((data as any)?.message || '请求失败');
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('网络错误，请检查网络连接');
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * 统一处理响应数据
 * 根据 swagger.json 定义，响应格式为 { data, message, result, success }
 * 返回 data 字段的内容
 */
const handleResponse = <T = any>(response: AxiosResponse<ApiResponse<T>>): T => {
  const { data } = response;
  
  // 根据 swagger.json 定义，响应格式为 { data, message, result, success }
  // 返回 data 字段的内容
  if (data.data !== undefined) {
    return data.data;
  }
  
  // 如果 data 字段不存在，可能是某些特殊接口直接返回数据
  // 这种情况下返回整个响应对象（但这种情况应该很少见）
  return data as T;
};

/**
 * GET 请求
 */
export const get = <T = any>(
  url: string,
  params?: any,
  config?: RequestConfig
): Promise<T> => {
  return axiosInstance
    .get<ApiResponse<T>>(url, { params, ...config })
    .then(handleResponse<T>)
    .catch((error) => {
      if (config?.skipErrorHandler) {
        throw error;
      }
      throw error;
    });
};

/**
 * POST 请求
 */
export const post = <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return axiosInstance
    .post<ApiResponse<T>>(url, data, config)
    .then(handleResponse<T>)
    .catch((error) => {
      if (config?.skipErrorHandler) {
        throw error;
      }
      throw error;
    });
};

/**
 * PUT 请求
 */
export const put = <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return axiosInstance
    .put<ApiResponse<T>>(url, data, config)
    .then(handleResponse<T>)
    .catch((error) => {
      if (config?.skipErrorHandler) {
        throw error;
      }
      throw error;
    });
};

/**
 * DELETE 请求
 */
export const del = <T = any>(
  url: string,
  config?: RequestConfig
): Promise<T> => {
  return axiosInstance
    .delete<ApiResponse<T>>(url, config)
    .then(handleResponse<T>)
    .catch((error) => {
      if (config?.skipErrorHandler) {
        throw error;
      }
      throw error;
    });
};

/**
 * PATCH 请求
 */
export const patch = <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return axiosInstance
    .patch<ApiResponse<T>>(url, data, config)
    .then(handleResponse<T>)
    .catch((error) => {
      if (config?.skipErrorHandler) {
        throw error;
      }
      throw error;
    });
};

/**
 * 文件上传
 */
export const upload = <T = any>(
  url: string,
  file: File | FormData,
  config?: RequestConfig
): Promise<T> => {
  const formData = file instanceof FormData ? file : new FormData();
  if (file instanceof File) {
    formData.append('file', file);
  }
  
  return axiosInstance
    .post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    })
    .then(handleResponse<T>)
    .catch((error) => {
      if (config?.skipErrorHandler) {
        throw error;
      }
      throw error;
    });
};

// 导出 axios 实例，方便直接使用
export { axiosInstance };

// 默认导出常用方法
export default {
  get,
  post,
  put,
  delete: del,
  patch,
  upload,
};

// API 方法集合（根据实际业务扩展）
export const FetchApi = {
  // 示例：添加数据
  test: <T = any>(data?: any) => post<T>('/api/test', data),
  
  // 可以根据需要继续添加其他 API 方法
  // getStockInfo: (code: string) => get<StockInfo>(`/api/stock/${code}`),
  // updateStock: (code: string, data: any) => put(`/api/stock/${code}`, data),
};
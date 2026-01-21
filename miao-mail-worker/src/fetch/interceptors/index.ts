import { authIntor } from './authInterceptor';

/**
 * 拦截器(interceptor)返回的结果类型
 * @property isAllowed=true 未被拦截
 * @property isAllowed=false 被拦截
 * @property data 返回数据
 * @property data.code 状态码
 * @property data.message 提示信息
 */
type InterceptorResult =
	| {
			isAllowed: true;
	  }
	| {
			isAllowed: false;
			data: {
				code: number;
				message: string;
			};
	  };

/**
 * 拦截器入口
 * @param req 传入请求
 * @returns 拦截结果
 */
const mainInterceptor = async (req: Request): Promise<InterceptorResult> => {
	let authResult = await authIntor(req);
	if (!authResult.isAllowed) {
		return authResult;
	}
	return {
		isAllowed: true,
	};
};

export { mainInterceptor };

export type { InterceptorResult };

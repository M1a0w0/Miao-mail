import { env } from 'cloudflare:workers';
import { authIntor } from './authInterceptor';

/**
 * 拦截器入口
 * @param req 传入请求
 * @returns 拦截结果
 */
const mainInterceptor = (req: Request): interceptorResult => {
	let authResult = authIntor(req, env.JWT_SECRET_KEY);
	if (!authResult.valid) {
		return authResult;
	}
	return {
		valid: true,
		data: {
			authPayload: authResult.data?.authPayload,
		},
	};
};

export { mainInterceptor };

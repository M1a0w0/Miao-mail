import { mainInterceptor } from '../interceptors';
import { getStrAfterStr, responseGenerator } from '../utils/util';
import { authHanlder } from './authHandlers';

/**
 * 请求处理器入口
 * @description /miaomail
 * @param req 传入请求
 */
const mainHandler = async (req: Request): Promise<Response> => {
	const intorResult = mainInterceptor(req);
	if (!intorResult.valid) {
		return responseGenerator(intorResult.data.code, intorResult.data.message);
	}
	const username = intorResult.data?.authPayload?.username ?? '';
	const api = getStrAfterStr(req.url, '/miaomail/');
	switch (api.split('/')[0]) {
		case 'auth':
			return await authHanlder(req, username);
		default:
			return responseGenerator(404);
	}
};

export { mainHandler };

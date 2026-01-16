import { getStrAfterStr, responseGenerator } from '../../common/utils/util';
import { mainInterceptor } from '../interceptors';
import { authHanlder } from './authHandlers';
import { usersHanlder } from './usersHandlers';

/**
 * 请求处理器入口
 * @description /miaomail
 * @param req 传入请求
 * @returns 响应
 */
const mainHandler = async (req: Request): Promise<Response> => {
	if (getStrAfterStr(req.url, '/miaomail') != '') {
		return responseGenerator(404);
	}
	let intorResult = await mainInterceptor(req);
	if (!intorResult.isAllowed) {
		return responseGenerator(intorResult.data.code, intorResult.data.message);
	}
	let api = getStrAfterStr(req.url, '/miaomail/');
	switch (api.split('/')[0]) {
		case 'auth':
			return await authHanlder(req);
		case 'users':
			return await usersHanlder(req);
		default:
			return responseGenerator(404);
	}
};

export { mainHandler as fetchHandler };

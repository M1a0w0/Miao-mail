import { getStrAfterStr, responseGenerator } from '../../common/utils/util';
import { mainInterceptor } from '../interceptors';
import { authHanlder } from './authHandlers';
import { emailsHanlder } from './emailsHandlers';
import { filesHanlder } from './filesHandlers';
import { usersHanlder } from './usersHandlers';

/**
 * 请求处理器入口
 * @description /miaomail
 * @param req 传入请求
 * @returns 响应
 */
const mainHandler = async (req: Request): Promise<Response> => {
	let api = getStrAfterStr(req.url, '/miaomail');
	if (api === '') {
		return responseGenerator(404);
	}
	let intorResult = await mainInterceptor(req);
	if (!intorResult.isAllowed) {
		return responseGenerator(intorResult.data.code, { message: intorResult.data.message });
	}
	switch (api.split('/')[1]) {
		case 'auth':
			return await authHanlder(req);
		case 'users':
			return await usersHanlder(req);
		case 'emails':
			return await emailsHanlder(req);
		case 'files':
			return await filesHanlder(req);
		default:
			return responseGenerator(404);
	}
};

export { mainHandler as fetchHandler };

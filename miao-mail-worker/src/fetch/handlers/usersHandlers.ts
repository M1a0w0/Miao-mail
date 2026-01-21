import { setUserByUsername } from '../../common/cloudflare/d1/tableUser';
import { checkProperties, getStrAfterStr, getTimestamp, responseGenerator } from '../../common/utils/util';
import { verifyJWT } from '../utils/jwtUtil';

/**
 * 用户处理器
 * @description /miaomail/users
 * @param req 传入请求
 * @returns 响应
 */
const usersHanlder = async (req: Request): Promise<Response> => {
	let api = getStrAfterStr(req.url, '/miaomail/users');
	switch (api.split('/')[1]) {
		case 'password':
			return await passwordHandler(req);
		default:
			return responseGenerator(404);
	}
};

/**
 * 密码处理器
 * @description /miaomail/users/password
 * @param req 传入请求
 * @returns 响应
 */
const passwordHandler = async (req: Request): Promise<Response> => {
	let resp = responseGenerator(500);
	switch (req.method) {
		case 'PATCH':
			try {
				let reqJson: { newPassword: string } = await req.json();
				if (checkProperties(reqJson, { newPassword: 'string' })) {
					let token = getStrAfterStr(req.headers.get('Authorization'), 'Bearer ');
					let verifyResult = verifyJWT(token);
					if (verifyResult.isValid) {
						resp = await changePassword(verifyResult.payload.username, reqJson.newPassword);
					}
				} else {
					resp = responseGenerator(400);
				}
			} catch {
				resp = responseGenerator(400);
			}
			break;
		default:
			resp = responseGenerator(405, { headers: { Allow: 'PATCH' } });
	}
	return resp;
};

/**
 * 修改密码
 * @param username 用户名
 * @param newPassword 新密码
 * @returns 响应
 */
const changePassword = async (username: string, newPassword: string): Promise<Response> => {
	if (await setUserByUsername(username, { user_password: newPassword })) {
		if (await setUserByUsername(username, { token_expire: getTimestamp() })) {
			return responseGenerator(200, { message: 'Change Success, Tokens Logout Success' });
		} else {
			return responseGenerator(200, { message: 'Change Success, Tokens Logout Fail' });
		}
	} else {
		return responseGenerator(500);
	}
};

export { usersHanlder };

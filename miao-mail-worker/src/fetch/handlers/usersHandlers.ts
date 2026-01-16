import { setUserInfo } from '../../common/cloudflare/database/tableUser';
import { getStrAfterStr, getTimestamp, responseGenerator } from '../../common/utils/util';
import { verifyJWT } from '../utils/jwtUtil';

/**
 * 用户处理器
 * @description /miaomail/users
 * @param req 传入请求
 * @returns 响应
 */
const usersHanlder = async (req: Request): Promise<Response> => {
	let api = getStrAfterStr(req.url, '/miaomail/users/');
	switch (api.split('/')[0]) {
		case 'password':
			return await passwordHandler(req);
		default:
			return responseGenerator(404);
	}
};

/**
 * 密码处理器
 * @description /miaomail/password
 * @param req 传入请求
 * @returns 响应
 */
const passwordHandler = async (req: Request): Promise<Response> => {
	let resp = responseGenerator(500);
	switch (req.method) {
		case 'PATCH':
			await req.text().then(async (data) => {
				try {
					let dataObject = JSON.parse(data);
					let newPassword = dataObject.newPassword;
					if (newPassword == null) {
						resp = responseGenerator(400);
					} else {
						let token = getStrAfterStr(req.headers.get('Authorization'), 'Bearer ');
						let verifyResult = verifyJWT(token);
						if (verifyResult.isValid) {
							resp = await changePassword(verifyResult.payload.username, newPassword);
						}
					}
				} catch {
					resp = responseGenerator(400);
				}
			});
			break;
		default:
			resp = responseGenerator(405);
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
	if (await setUserInfo(username, { user_password: newPassword })) {
		if (await setUserInfo(username, { token_expire: getTimestamp() })) {
			return responseGenerator(200, 'Change Success, Tokens Logout Success');
		} else {
			return responseGenerator(200, 'Change Success, Tokens Logout Fail');
		}
	} else {
		return responseGenerator(500);
	}
};

export { usersHanlder };

import { QueryEmptyError } from '../../common/cloudflare/d1';
import { getUserByUsername, setUserByUsername } from '../../common/cloudflare/d1/tableUser';
import { checkProperties, getStrAfterStr, getTimestamp, responseGenerator } from '../../common/utils/util';
import { signJWT, verifyJWT } from '../utils/jwtUtil';

/**
 * 身份认证处理器
 * @description /miaomail/auth
 * @param req 传入请求
 * @returns 响应
 */
const authHanlder = async (req: Request): Promise<Response> => {
	let api = getStrAfterStr(req.url, '/miaomail/auth');
	switch (api.split('/')[1]) {
		case 'token':
			return await tokenHandler(req);
		default:
			return responseGenerator(404);
	}
};

/**
 * 令牌处理器
 * @description /miaomail/auth/token
 * @param req 传入请求
 * @returns 响应
 */
const tokenHandler = async (req: Request): Promise<Response> => {
	let resp = responseGenerator(500);
	switch (req.method) {
		case 'POST':
			try {
				let reqJson: { username: string; password: string } = await req.json();
				if (checkProperties(reqJson, { username: 'string', password: 'string' })) {
					resp = await login(reqJson.username, reqJson.password);
				} else {
					resp = responseGenerator(400);
				}
			} catch {
				resp = responseGenerator(400);
			}
			break;
		case 'DELETE':
			let token = getStrAfterStr(req.headers.get('Authorization'), 'Bearer ');
			let verifyResult = verifyJWT(token);
			if (verifyResult.isValid) {
				resp = await logout(verifyResult.payload.username);
			}
			break;
		default:
			resp = responseGenerator(405, { headers: { Allow: 'POST, DELETE' } });
	}
	return resp;
};

/**
 * 用户登录
 * @param username 用户名
 * @param password 密码
 * @returns 登录结果
 */
const login = async (username: string, password: string): Promise<Response> => {
	try {
		let userInfo = await getUserByUsername(username, ['user_password']);
		if (userInfo.user_password === password) {
			return responseGenerator(200, { message: 'Login Success', data: { token: signJWT(username) } });
		} else {
			return responseGenerator(401, { message: 'Incorrect Username or Password' });
		}
	} catch (error) {
		if (error instanceof QueryEmptyError) {
			return responseGenerator(401, { message: 'Incorrect Username or Password' });
		} else {
			return responseGenerator(500);
		}
	}
};

/**
 * 用户登出(注销之前的令牌)
 * @param username
 * @returns 登出结果
 */
const logout = async (username: string): Promise<Response> => {
	if (await setUserByUsername(username, { token_expire: getTimestamp() })) {
		return responseGenerator(200, { message: 'Logout Tokens Success' });
	} else {
		return responseGenerator(500, { message: 'Logout Tokens Fail, Try Later' });
	}
};

export { authHanlder };

import { QueryEmptyError } from '../../common/cloudflare/d1';
import { getUserByUsername, setUserByUsername } from '../../common/cloudflare/d1/tableUser';
import { getStrAfterStr, getTimestamp, responseGenerator } from '../../common/utils/util';
import { signJWT, verifyJWT } from '../utils/jwtUtil';

/**
 * 身份认证处理器
 * @description /miaomail/auth
 * @param req 传入请求
 * @returns 响应
 */
const authHanlder = async (req: Request): Promise<Response> => {
	let api = getStrAfterStr(req.url, '/miaomail/auth/');
	switch (api.split('/')[0]) {
		case 'tokens':
			return await tokensHandler(req);
		default:
			return responseGenerator(404);
	}
};

/**
 * 令牌处理器
 * @description /miaomail/auth/tokens
 * @param req 传入请求
 * @returns 响应
 */
const tokensHandler = async (req: Request): Promise<Response> => {
	let resp = responseGenerator(500);
	switch (req.method) {
		case 'POST':
			await req.text().then(async (data) => {
				try {
					let dataObject = JSON.parse(data);
					let username = dataObject.username;
					let password = dataObject.password;
					if (username == null || password == null) {
						resp = responseGenerator(400);
					} else {
						resp = await login(username, password);
					}
				} catch {
					resp = responseGenerator(400);
				}
			});
			break;
		case 'DELETE':
			let token = getStrAfterStr(req.headers.get('Authorization'), 'Bearer ');
			let verifyResult = verifyJWT(token);
			if (verifyResult.isValid) {
				resp = await logout(verifyResult.payload.username);
			}
			break;
		default:
			resp = responseGenerator(405);
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
		if (userInfo.user_password == password) {
			return responseGenerator(200, 'Login Success', { token: signJWT(username) });
		} else {
			return responseGenerator(401, 'Incorrect Username or Password');
		}
	} catch (error) {
		if (error instanceof QueryEmptyError) {
			return responseGenerator(401, 'Incorrect Username or Password');
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
		return responseGenerator(200, 'Logout Tokens Success');
	} else {
		return responseGenerator(500, 'Logout Tokens Fail, Try Later');
	}
};

export { authHanlder };

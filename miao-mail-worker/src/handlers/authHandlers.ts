import { env } from 'cloudflare:workers';
import { getUserPassword, setUserTokenExpire } from '../cloudflare/database';
import { getStrAfterStr, responseGenerator } from '../utils/util';
const jwt = require('jsonwebtoken');

/**
 * 身份认证处理器
 * @description /miaomail/auth
 * @param req 传入请求
 * @param username 请求的用户
 */
const authHanlder = async (req: Request, username: string): Promise<Response> => {
	const api = getStrAfterStr(req.url, '/miaomail/auth/');
	switch (api.split('/')[0]) {
		case 'tokens':
			return await tokensHandler(req, username);
		default:
			return responseGenerator(404);
	}
};

/**
 * 令牌处理器
 * @description /miaomail/auth/tokens
 * @param req 传入请求
 * @param username 请求的用户; 如果是登录请求, 则为""
 */
const tokensHandler = async (req: Request, username: string): Promise<Response> => {
	let resp = responseGenerator(500);
	switch (req.method) {
		case 'POST':
			await req.text().then((data) => {
				let dataObject = JSON.parse(data);
				let username = dataObject.username;
				let password = dataObject.password;
				if (login(username, password)) {
					resp = responseGenerator(200, 'Login Success', { token: signToken(username, env.JWT_SECRET_KEY) });
				} else {
					resp = responseGenerator(401, 'Incorrect Username or Password');
				}
			});
			break;
		case 'DELETE':
			if (setUserTokenExpire(username)) {
				resp = responseGenerator(200);
			}
			break;
	}
	return resp;
};

/**
 * 用户登录
 * @param username 用户名
 * @param password 密码
 * @returns 登录结果: true=成功
 */
const login = (username: string, password: string): boolean => {
	return getUserPassword(username) == password;
};

/**
 * 签发令牌
 * @param username 用户名
 * @param secretKey 签发所使用的密钥
 * @returns JSON Web Token
 */
const signToken = (username: string, secretKey: string): string => {
	const expiresIn = '1d'; // 令牌在一天后过期.
	return jwt.sign({ username: username }, secretKey, { expiresIn: expiresIn, issuer: 'miaomail' });
};

export { authHanlder };

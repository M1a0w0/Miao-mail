import { getUserTokenExpire } from '../cloudflare/database';
import { getStrAfterStr } from '../utils/util';

const jwt = require('jsonwebtoken');

/**
 * @description 不进行身份拦截的接口
 */
const exclude = [
	{
		method: 'POST',
		api: '/auth/tokens',
	},
];

/**
 * 身份认证拦截器
 * @param req 传入请求
 * @param secretKey 用于 JWT 验证时的密钥
 * @returns 拦截结果
 */
export const authIntor = (req: Request, secretKey: string): interceptorResult => {
	const api = getStrAfterStr(req.url, '/miaomail');
	const method = req.method;
	if (
		exclude.some((ele) => {
			if (api == ele.api) {
				if (method == ele.method) {
					return true;
				}
			}
		})
	) {
		return { valid: true };
	}
	let token = getStrAfterStr(req.headers.get('Authorization'), 'Bearer ');
	if (token != '') {
		try {
			let decode = jwt.verify(token, secretKey, {
				algorithms: ['HS256'],
				issuer: 'miaomail',
			});
			if (getUserTokenExpire(decode.username) > decode.iat) {
				return { valid: false, data: { code: 401, message: 'Authorization expired' } };
			}
			return { valid: true, data: { authPayload: decode } };
		} catch {
			return { valid: false, data: { code: 401, message: 'Authorization invalid' } };
		}
	} else {
		return { valid: false, data: { code: 401, message: 'Authorization missed' } };
	}
};

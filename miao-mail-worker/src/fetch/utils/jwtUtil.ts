import { env } from 'cloudflare:workers';
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = env.JWT_SECRET_KEY; // 令牌签名密钥
const algorithm = 'HS256'; // 令牌签名算法
const expiresIn = '1d'; // 令牌在一天后过期
const issuer = 'miaomail'; // 令牌签发者: miaomail

/**
 * JSON Web Token 验证器(verify)返回的结果类型
 * @property isValid=false 令牌不合法
 * @property isValid=true 令牌合法
 * - payload 载荷
 * - payload.iat 令牌签发时间
 * - payload.username 令牌所属用户
 */
type VerifiedJWT =
	| {
			isValid: false;
	  }
	| {
			isValid: true;
			payload: {
				iat: number;
				username: string;
			};
	  };

/**
 * 签发令牌 JSON Web Token
 * @param username 用户名
 * @returns JSON Web Token
 */
const sign = (username: string): string => {
	return jwt.sign({ username }, JWT_SECRET_KEY, {
		algorithm,
		expiresIn,
		issuer,
	});
};

/**
 * 验证令牌 JSON Web Token
 * @param token 令牌 JSON Web Token
 * @returns 验证结果
 */
const verify = (token: string): VerifiedJWT => {
	try {
		let decode = jwt.verify(token, JWT_SECRET_KEY, {
			algorithms: [algorithm],
			issuer,
		});
		return {
			isValid: true,
			payload: {
				iat: decode.iat,
				username: decode.username,
			},
		};
	} catch {
		return {
			isValid: false,
		};
	}
};

export { sign as signJWT, verify as verifyJWT };

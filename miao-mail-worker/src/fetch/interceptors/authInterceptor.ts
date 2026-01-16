import { InterceptorResult } from '.';
import { getUserInfo } from '../../common/cloudflare/database/tableUser';
import { getStrAfterStr } from '../../common/utils/util';

import { verifyJWT } from '../utils/jwtUtil';

/**
 * 排除列表
 * @description 不进行身份拦截的接口
 * @description method='ALL' 时表示所有方法
 */
const exclude = [
	{
		api: '/auth/tokens',
		method: 'POST',
	},
];

/**
 * 管理员资源列表
 * @description 用户访问该列表中的资源时, 将检查是否拥有管理员权限
 * @description method='ALL' 时表示所有方法
 */
const adminResource = [
	{
		api: '/admin',
		method: 'ALL',
	},
];

/**
 * 检查接口是否在排除列表内
 * @param api 请求接口
 * @param method 请求方法
 * @returns true=在内
 */
const excludeChecker = (api: string, method: string): boolean => {
	return exclude.some((ele) => {
		if (api.startsWith(ele.api)) {
			if (ele.method == 'ALL' || method == ele.method) {
				return true;
			}
		}
	});
};

/**
 * 检查接口是否在管理员资源列表内
 * @param api 请求接口
 * @param method 请求方法
 * @returns true=在内
 */
const adminResourceChecker = (api: string, method: string): boolean => {
	return adminResource.some((ele) => {
		if (api.startsWith(ele.api)) {
			if (ele.method == 'ALL' || method == ele.method) {
				return true;
			}
		}
	});
};

/**
 * 身份认证拦截器
 * @param req 传入请求
 * @returns 拦截结果
 */
const authIntor = async (req: Request): Promise<InterceptorResult> => {
	let api = getStrAfterStr(req.url, '/miaomail');
	let method = req.method;
	// 检查排除列表
	if (excludeChecker(api, method)) {
		return { isAllowed: true };
	}
	// 验证Token是否提供
	let token = getStrAfterStr(req.headers.get('Authorization'), 'Bearer ');
	if (token != '') {
		// 验证Token是否有效
		let verifyResult = verifyJWT(token);
		if (verifyResult.isValid) {
			try {
				// 获取Token信息
				let userInfo = await getUserInfo(verifyResult.payload.username, ['token_expire', 'user_role']);
				let tokenExpire = userInfo.token_expire as number;
				let tokenRole = userInfo.user_role as string;
				// 验证Token是否过期
				if (verifyResult.payload.iat > tokenExpire) {
					// 检查管理员资源列表
					if (adminResourceChecker(api, method)) {
						// 验证Token是否拥有管理员权限
						if (tokenRole == 'admin') {
							return { isAllowed: true };
						} else {
							return { isAllowed: false, data: { code: 403, message: 'Permission Denied' } };
						}
					} else {
						return { isAllowed: true };
					}
				} else {
					return { isAllowed: false, data: { code: 401, message: 'Authorization Expired' } };
				}
			} catch {
				return { isAllowed: false, data: { code: 500, message: 'Internal Server Error' } };
			}
		} else {
			return { isAllowed: false, data: { code: 401, message: 'Authorization Invalid' } };
		}
	} else {
		return { isAllowed: false, data: { code: 401, message: 'Authorization Missed' } };
	}
};

export { authIntor };

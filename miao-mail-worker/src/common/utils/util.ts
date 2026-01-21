import { env } from 'cloudflare:workers';

/**
 * 检查记录中是否包含指定属性
 * @param rcd 记录
 * @param properties 要检查的属性
 * @returns true=包含
 */
const checkProperties = (rcd: Record<string, unknown>, properties: Record<string, string>): boolean => {
	for (const [key, type] of Object.entries(properties)) {
		const value = rcd[key];
		if (value === undefined || value === null) {
			return false;
		} else {
			if (typeof value !== type) {
				return false;
			}
		}
	}
	return true;
};

/**
 * 获得当前 Worker 绑定的域名(env.DOMAIN)
 * @returns 域名
 */
const getDomain = (): string => {
	return env.DOMAIN;
};

/**
 * 获得 原字符串 在 给定字符串 之后的内容
 * @param str 原字符串
 * @param aft 给定字符串
 * @returns aft 之后的内容
 * @example
 * // return '/auth'
 * getStrAfterStr("/miaomail/auth", "/miaomail")
 */
const getStrAfterStr = (str: string | null, aft: string | null): string => {
	if (str == null) {
		return '';
	}
	if (aft === null) {
		return '';
	}
	let index = str.indexOf(aft);
	if (index === -1) {
		return '';
	}
	return str.substring(index + aft.length);
};

/**
 * 获得当前时间戳(10位)
 * @returns 时间戳
 */
const getTimestamp = (): number => {
	return Math.trunc(Date.now() / 1000);
};

/**
 * Response 对象构建器
 * @param code 状态码 https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status
 * @param options 要传递的额外数据
 * @param options.message 要传递的简单信息, 若不提供, 则通过 code 推断信息
 * @param options.headers 要传递的标头数据
 * @param options.data 要传递的复杂数据
 * @returns 构建完成的 Response 对象
 * @example <caption>构建一个状态码为 404, 消息为 'Not Found' 的 Response 对象</caption>
 * let resp = responseGenerator(404)
 * @example <caption>构建一个状态码为 405, 消息为 'Method Not Allowed', 标头为 { Allow: 'GET' } 的 Response 对象</caption>
 * let resp = responseGenerator(405, { headers: { Allow: 'GET' } })
 */
const responseGenerator = (
	code: number,
	options?: { message?: string; headers?: Record<string, unknown>; data?: Record<string, unknown> },
): Response => {
	const stdCodeMessage: Record<number, string> = {
		200: 'OK',
		400: 'Bad Request',
		401: 'Unauthorized',
		403: 'Forbidden',
		404: 'Not Found',
		405: 'Method Not Allowed',
		500: 'Internal Server Error',
	};
	let respHeaders = {
		'Content-Type': 'application/json',
		...options?.headers,
	};
	let resp = {
		code: code,
		message: options?.message ?? stdCodeMessage[code] ?? 'Unknown',
		data: options?.data ?? {},
	};
	return new Response(JSON.stringify(resp), { status: code, headers: respHeaders });
};

export { checkProperties, getDomain, getStrAfterStr, getTimestamp, responseGenerator };

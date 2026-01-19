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
	if (aft == null) {
		return '';
	}
	let index = str.indexOf(aft);
	if (index == -1) {
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
 * Response 对象创建器
 * @param code 状态码 https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status
 * @param message 要传递的简单信息, 若不提供, 则通过 code 推断信息
 * @param data 要传递的复杂数据
 * @returns 构建完成的 Response 对象
 * @example <caption>构建一个状态码为 404, 消息为 'Not Found' 的 Response 对象</caption>
 * let resp = responseGenerator(404)
 */
const responseGenerator = (code: number, message?: string, data?: Record<string, unknown>): Response => {
	const stdCodeMessage: Record<number, string> = {
		200: 'OK',
		400: 'Bad Request',
		401: 'Unauthorized',
		403: 'Forbidden',
		404: 'Not Found',
		405: 'Method Not Allowed',
		500: 'Internal Server Error',
	};
	let resp = {
		code: code,
		message: message ?? stdCodeMessage[code] ?? 'Unknown Error',
		data: data ?? {},
	};
	let headers = new Headers();
	headers.append('Content-Type', 'application/json');
	return new Response(JSON.stringify(resp), { status: code, headers: headers });
};

export { getStrAfterStr, getTimestamp, responseGenerator };

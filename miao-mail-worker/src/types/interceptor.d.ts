/**
 * 拦截器(interceptor)返回的结果类型
 * 联合类型说明：
 * - valid: true(未被拦截)：可选 data，data 内可选 authPayload (包含 username 字符串)
 * - valid: false(被拦截)：必选 data，data 内必含 code(状态码) 和 message(提示信息)
 */
type interceptorResult =
	| {
			valid: true;
			data?: {
				authPayload?: {
					username: string;
				};
			};
	  }
	| {
			valid: false;
			data: {
				code: number;
				message: string;
			};
	  };

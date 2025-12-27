/**
 * @author MiaoYu<m1a0w0@miaocraft.dev>
 * @license MIT
 * @version 0.0.1
 */

import { mainHandler } from './handlers';
import { getStrAfterStr, responseGenerator } from './utils/util';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (getStrAfterStr(request.url, '/miaomail') != '') {
			return await mainHandler(request);
		} else {
			return responseGenerator(404);
		}
	},
	async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {},
};

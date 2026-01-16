/**
 * @author MiaoYu <m1a0w0@miaocraft.dev>
 * @license MIT
 * @version 0.0.1
 */

import { responseGenerator } from './common/utils/util';
import { emailHandler } from './email/handlers';
import { fetchHandler } from './fetch/handlers';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			return await fetchHandler(request);
		} catch {
			return responseGenerator(500);
		}
	},
	async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
		try {
			// 不允许发送邮件到 admin
			if (!message.to.startsWith('admin')) {
				await emailHandler(message);
			}
		} catch {}
	},
} satisfies ExportedHandler<Env>;

import { addEmail } from '../common/cloudflare/d1/tableEmail';
import { msg2MailEmail } from './utils';

/**
 * 电子邮件处理器入口
 * @param message 传入邮件
 */
const mainHandler = async (message: ForwardableEmailMessage): Promise<void> => {
	// 不允许发送邮件到 admin
	if (!message.to.startsWith('admin')) {
		let email = await msg2MailEmail(message);
		if (await addEmail(email)) {
			// TODO: save attachments to r2
		} else {
			console.error(`Miao-mail Email Handler Error\nEmail From: ${message.from}`);
		}
	}
};

export { mainHandler as emailHandler };

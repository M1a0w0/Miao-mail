import PostalMime from 'postal-mime';
import { addEmail } from '../common/cloudflare/d1/tableEmail';
import { getUserByUsername } from '../common/cloudflare/d1/tableUser';
import { putAttachments } from '../common/cloudflare/r2/emailAttachment';
import { email2MailEmail } from './utils';

/**
 * 电子邮件处理器入口
 * @param message 传入邮件
 */
const mainHandler = async (message: ForwardableEmailMessage): Promise<void> => {
	// 不允许发送邮件到 admin
	if (!message.to.startsWith('admin')) {
		let username = message.to.split('@')[0];
		try {
			let userInfo = await getUserByUsername(username, ['blacklist']);
			let blacklist = userInfo.blacklist?.split(',') as string[];
			if (!blacklist.includes(message.from)) {
				await saveEmail(message);
			}
		} catch {}
	}
};

/**
 * 保存邮件
 * @param message 要存储的邮件
 */
const saveEmail = async (message: ForwardableEmailMessage): Promise<void> => {
	let username = message.to.split('@')[0];
	let parsedEmail = await PostalMime.parse(message.raw, { attachmentEncoding: 'base64' });
	let savedEmail = email2MailEmail(username, parsedEmail);
	savedEmail.email_attacchments = await putAttachments(username, parsedEmail.attachments);
	if (!(await addEmail(savedEmail))) {
		console.error(`Miao-mail Email Handler Error\nEmail From: ${message.from}`);
	}
};

export { mainHandler as emailHandler };

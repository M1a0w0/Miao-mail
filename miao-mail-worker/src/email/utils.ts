import PostalMime, { Address } from 'postal-mime';
import { MailEmail } from '../common/cloudflare/d1/tableEmail';

/**
 * postal-mime Address 转 string
 * @param addr Address
 * @returns string
 */
const addr2string = (addr: undefined | Address | Address[]): string => {
	let result = '';
	if (addr != undefined) {
		if (!Array.isArray(addr)) {
			result = `${addr.name} <${addr.address ?? ''}>`;
		} else {
			addr.forEach((ele) => {
				result += `${ele.name} <${ele.address ?? ''}>`;
			});
		}
	}
	return result;
};

/**
 * Cloudflare ForwardableEmailMessage 转 MailEmail
 * @param msg ForwardableEmailMessage
 * @returns MailEmail
 */
const msg2MailEmail = async (msg: ForwardableEmailMessage): Promise<MailEmail> => {
	let rawEmail = new Response(msg.raw);
	let email = await PostalMime.parse(await rawEmail.arrayBuffer());
	return {
		mail_user_name: msg.to.split('@')[0],
		mail_type: 'receive',
		mail_scheduled: '',
		message_from: msg.from,
		message_to: msg.to,
		email_from: addr2string(email.from),
		email_sender: addr2string(email.sender),
		email_reply_to: addr2string(email.replyTo),
		email_to: addr2string(email.to),
		email_cc: addr2string(email.cc),
		email_bcc: addr2string(email.bcc),
		email_subject: email.subject ?? '',
		email_message_id: email.messageId ?? '',
		email_in_reply_to: email.inReplyTo ?? '',
		email_references: email.references ?? '',
		email_date: email.date ?? '',
		email_html: email.html ?? '',
		email_text: email.text ?? '',
		email_attacchments: '',
	};
};

export { msg2MailEmail };

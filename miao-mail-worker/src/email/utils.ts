import { Address, Email, Mailbox } from 'postal-mime';
import { MailEmail } from '../common/cloudflare/d1/tableEmail';

/**
 * 判断 postal-mime Address 是否是 postal-mime MailBox
 * @param addr Address
 * @returns true=是
 */
const isMailbox = (addr: Address): addr is Mailbox => {
	return !('group' in addr) || addr.group === undefined;
};

/**
 * postal-mime MailBox 转 string
 * @param mb Mailbox
 * @returns string
 */
const mailbox2string = (mb: Mailbox | Mailbox[]): string => {
	if (Array.isArray(mb)) {
		let result: string[] = [];
		mb.forEach((ele) => {
			if (ele.name.length > 0) {
				result.push(`${ele.name} <${ele.address ?? ''}>`);
			} else {
				result.push(`<${ele.address ?? ''}>`);
			}
		});
		return result.join(',');
	} else {
		if (mb.name.length > 0) {
			return `${mb.name} <${mb.address ?? ''}>`;
		} else {
			return `<${mb.address ?? ''}>`;
		}
	}
};

/**
 * postal-mime Address 转 string
 * @param addr Address
 * @returns string
 */
const address2string = (addr: undefined | Address | Address[]): string => {
	if (addr !== undefined) {
		if (Array.isArray(addr)) {
			let result: string[] = [];
			addr.forEach((ele) => {
				if (isMailbox(ele)) {
					result.push(mailbox2string(ele));
				} else {
					result.push(mailbox2string(ele.group));
				}
			});
			return result.join(',');
		} else {
			if (isMailbox(addr)) {
				return mailbox2string(addr);
			} else {
				return mailbox2string(addr.group);
			}
		}
	} else {
		return '';
	}
};

/**
 * postal-mime Email 转 MailEmail
 * @param msg Email
 * @returns MailEmail
 */
const email2MailEmail = (username: string, email: Email): MailEmail => {
	return {
		mail_user_name: username,
		mail_type: 'inbox',
		email_from: address2string(email.from),
		email_sender: address2string(email.sender),
		email_reply_to: address2string(email.replyTo),
		email_to: address2string(email.to),
		email_cc: address2string(email.cc),
		email_bcc: address2string(email.bcc),
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

export { email2MailEmail };

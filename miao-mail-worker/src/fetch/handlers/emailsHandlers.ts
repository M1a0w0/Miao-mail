import { QueryEmptyError } from '../../common/cloudflare/d1';
import { addEmail, getEmailByUsername, MailEmail } from '../../common/cloudflare/d1/tableEmail';
import { getUserByUsername } from '../../common/cloudflare/d1/tableUser';
import { resendSend, ResendSendError } from '../../common/resend/sendEmail';
import { checkProperties, getDomain, getStrAfterStr, responseGenerator } from '../../common/utils/util';
import { verifyJWT } from '../utils/jwtUtil';

/**
 * 发送邮件参数接口
 * @description POST /miaomail/emails
 * @description { email : PostEmailI }
 * @property to 邮件主要收件人
 * @property subject 邮件主题
 * @property bcc 邮件密送
 * @property cc 邮件抄送
 * @property scheduledAt Resend邮件定时发送
 * @property replyTo 邮件回复目标
 * @property inReplyTo 邮件回复的Message-ID
 * @property references 邮件关联的Message-ID
 * @property date 邮件发送时间
 * @property html 邮件内容HTML
 * @property text 邮件内容TEXT
 * @property attachments 邮件附件
 * @property attachments.content 附件内容
 * @property attachments.filename 附件名称
 * @property attachments.path 附件路径(Path where the attachment file is hosted)
 * @property attachments.contentType 附件Content-Type
 * @property attachments.contentId 附件Content-ID
 */
interface PostEmailI {
	to: string;
	subject: string;
	bcc?: string;
	cc?: string;
	scheduledAt?: string;
	replyTo?: string;
	inReplyTo?: string;
	references?: string;
	date?: string;
	html?: string;
	text?: string;
	attachments?: {
		content?: string;
		filename?: string;
		path?: string;
		contentType?: string;
		contentId?: string;
	}[];
}

/**
 * 邮件处理器
 * @description /miaomail/emails
 * @param req 传入请求
 * @returns 响应
 */
const emailsHanlder = async (req: Request): Promise<Response> => {
	let resp = responseGenerator(500);
	switch (req.method) {
		case 'GET':
			try {
				let token = getStrAfterStr(req.headers.get('Authorization'), 'Bearer ');
				let verifyResult = verifyJWT(token);
				if (verifyResult.isValid) {
					resp = await getEmails(verifyResult.payload.username);
				}
			} catch (error) {
				if (error instanceof QueryEmptyError) {
					resp = responseGenerator(200, { message: 'Email List Is Empty', data: { emails: [] } });
				}
			}
			break;
		case 'POST':
			try {
				let reqJson: { email: PostEmailI } = await req.json();
				if (checkProperties(reqJson, { email: 'object' })) {
					let token = getStrAfterStr(req.headers.get('Authorization'), 'Bearer ');
					let verifyResult = verifyJWT(token);
					if (verifyResult.isValid) {
						resp = await postEmail(verifyResult.payload.username, reqJson.email);
					}
				} else {
					resp = responseGenerator(400);
				}
			} catch {
				resp = responseGenerator(400);
			}
			break;
		default:
			resp = responseGenerator(405, { headers: { Allow: 'GET, POST' } });
	}
	return resp;
};

/**
 * 获取邮件
 * @param username 用户名
 * @returns 响应
 */
const getEmails = async (username: string): Promise<Response> => {
	let emails = await getEmailByUsername(username);
	return responseGenerator(200, { data: { emails } });
};

/**
 * 发送邮件
 * @param username 用户名
 * @param email 邮件
 * @returns 响应
 */
const postEmail = async (username: string, email: PostEmailI): Promise<Response> => {
	try {
		let userInfo = await getUserByUsername(username, ['user_nickname']);
		let nickname = userInfo.user_nickname as string;
		let emailFrom = `${nickname} <${username}@${getDomain()}>`;
		let resendId = await resendSend(emailFrom, email);
		if (await saveEmail(username, emailFrom, email, resendId)) {
			return responseGenerator(200, { message: 'Email OK' });
		} else {
			return responseGenerator(200, { message: 'Email OK, But Save Fail' });
		}
	} catch (error) {
		if (error instanceof ResendSendError) {
			return responseGenerator(500, { message: 'Resend Error' });
		} else {
			return responseGenerator(500);
		}
	}
};

/**
 * 保存邮件
 * @param email 要存储的邮件
 */
const saveEmail = async (username: string, from: string, email: PostEmailI, resendId: string): Promise<boolean> => {
	let savedEmail: MailEmail = {
		mail_user_name: username,
		mail_type: 'sent',
		resend_id: resendId,
		email_from: from,
		email_sender: 'Resend',
		email_to: email.to,
		email_subject: email.subject,
		...(email.scheduledAt && { resend_scheduled_at: email.scheduledAt }),
		...(email.replyTo && { email_reply_to: email.replyTo }),
		...(email.cc && { email_cc: email.cc }),
		...(email.bcc && { email_bcc: email.bcc }),
		...(email.inReplyTo && { email_in_reply_to: email.inReplyTo }),
		...(email.references && { email_references: email.references }),
		...(email.date && { email_date: email.date }),
		...(email.html && { email_html: email.html }),
		...(email.text && { email_text: email.text }),
	};
	// TODO: saveAttachments
	// savedEmail.email_attacchments = await putAttachments(username, parsedEmail.attachments);
	if (await addEmail(savedEmail)) {
		return true;
	} else {
		return false;
	}
};

export { emailsHanlder };
export type { PostEmailI };

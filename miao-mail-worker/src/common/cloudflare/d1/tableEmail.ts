import { d1Insert, d1Select } from '.';

/** 电子邮件表列名 */
type MailEmailColumnNames =
	| 'mail_user_name'
	| 'mail_type'
	| 'resend_id'
	| 'resend_scheduled_at'
	| 'resend_last_event'
	| 'email_from'
	| 'email_sender'
	| 'email_reply_to'
	| 'email_to'
	| 'email_cc'
	| 'email_bcc'
	| 'email_subject'
	| 'email_message_id'
	| 'email_in_reply_to'
	| 'email_references'
	| 'email_date'
	| 'email_html'
	| 'email_text'
	| 'email_attacchments';
/** 可查询的电子邮件信息 */
type MailEmailQuery = [...MailEmailColumnNames[]];

/**
 * 电子邮件参数类型
 * @description [唯一]: 表示此字段在数据表中不允许重复
 * @description [只读]: 表示不允许在数据表中修改此字段
 * @property mail_user_name 邮件所属用户
 * @property mail_type 邮件类型: inbox=收件箱 sent=发件箱 custom<>=自定义
 * @property resend_id Resend邮件ID
 * @property resend_scheduled_at Resend邮件定时发送
 * @property resend_last_event Resend邮件上一个事件 https://resend.com/docs/dashboard/emails/introduction#understand-email-events
 * @property email_from 邮件作者
 * @property email_sender 邮件发送者
 * @property email_reply_to 邮件回复目标
 * @property email_to 邮件主要收件人
 * @property email_cc 邮件抄送
 * @property email_bcc 邮件密送
 * @property email_subject 邮件主题
 * @property email_message_id [唯一, 只读] 邮件唯一标识
 * @property email_in_reply_to 邮件回复的Message-ID
 * @property email_references 邮件关联的Message-ID
 * @property email_date 邮件发送时间
 * @property email_html 邮件内容HTML
 * @property email_text 邮件内容TEXT
 * @property email_attacchments 邮件附件
 */
type MailEmail = {
	mail_user_name?: string;
	mail_type?: string;
	resend_id?: string;
	resend_scheduled_at?: string;
	resend_last_event?: string;
	email_from?: string;
	email_sender?: string;
	email_reply_to?: string;
	email_to?: string;
	email_cc?: string;
	email_bcc?: string;
	email_subject?: string;
	email_message_id?: string;
	email_in_reply_to?: string;
	email_references?: string;
	email_date?: string;
	email_html?: string;
	email_text?: string;
	email_attacchments?: string;
};

/**
 * 添加邮件到表email
 * @param email
 * @returns true=添加成功
 */
const addEmail = async (email: MailEmail): Promise<boolean> => {
	return d1Insert('email', email);
};

/**
 * 根据用户名获取邮件
 * @param username
 * @param column 要查询的列, 为空时返回所有
 * @returns 邮件列表
 */
const getEmailByUsername = async (username: string, column: MailEmailQuery = []): Promise<MailEmail[]> => {
	return await d1Select('email', column, { mail_user_name: username });
};

export { addEmail, getEmailByUsername };
export type { MailEmail };

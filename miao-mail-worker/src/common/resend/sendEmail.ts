import { v4 as uuidv4 } from 'uuid';
import { PostEmailI } from '../../fetch/handlers/emailsHandlers';

/** Resend 发送失败错误 */
class SendError extends Error {}

/**
 * Resend 发送邮件
 * @param from 邮件作者
 * @param email 邮件
 * @returns Resend 邮件 ID
 */
const send = async (from: string, email: PostEmailI): Promise<string> => {
	return uuidv4(); // TODO: Resend
};

export { send as resendSend, SendError as ResendSendError };

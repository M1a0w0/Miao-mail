import { Attachment } from 'postal-mime';
import { v4 as uuidv4 } from 'uuid';
import { r2Get, r2Head, r2Put } from '.';

/**
 * 附件元数据参数类型
 * @property owner 附件所属
 * @property filename 文件名
 * @property mimeType MIME类型
 * @property description 文件描述
 * @property disposition 附件方式
 * @property contentId Content-ID
 */
type AttachmentMetadata = {
	owner: string;
	filename: string;
	mimeType: string;
	description: string;
	disposition?: string;
	contentId?: string;
};

/**
 * 附件数据参数类型
 * @property metadata 附件元数据
 * @property body 附件数据
 */
type AttachmentData = {
	metadata: AttachmentMetadata;
	body: string;
};

/**
 * 获取附件数据
 * @param username 尝试获取者
 * @param attachment 附件键名
 * @returns 附件数据
 */
const getAttachments = async (username: string, attachment: string): Promise<AttachmentData | null> => {
	let r2obj = await r2Head(attachment);
	if (r2obj !== null) {
		let metadata = r2obj.customMetadata as AttachmentMetadata;
		if (metadata.owner !== username) {
			return null;
		}
		let r2objBody = await r2Get(attachment);
		if (r2objBody !== null) {
			return {
				metadata: metadata,
				body: await r2objBody.text(),
			};
		} else {
			return null;
		}
	} else {
		return null;
	}
};

/**
 * 存储 postal-mime Attachment[]
 * @param owner 附件所属
 * @param attachments 附件
 * @returns 附件键名
 */
const putAttachments = async (owner: string, attachments: Attachment[]): Promise<string> => {
	let result: string[] = [];
	if (attachments.length > 0) {
		for (const ele of attachments) {
			let metadata: AttachmentMetadata = {
				owner: owner,
				filename: ele.filename ?? '',
				mimeType: ele.mimeType,
				description: ele.description ?? '',
				...(ele.disposition && { disposition: ele.disposition }),
				...(ele.disposition === 'inline' && { contentId: ele.contentId }),
			};
			let putResult = await r2Put(uuidv4(), ele.content, metadata);
			if (putResult !== null) {
				result.push(putResult.key);
			}
		}
	}
	return result.join(',');
};

export { getAttachments, putAttachments };

import { getAttachments } from '../../common/cloudflare/r2/emailAttachment';
import { getStrAfterStr, responseGenerator } from '../../common/utils/util';
import { verifyJWT } from '../utils/jwtUtil';

/**
 * 文件处理器
 * @description /miaomail/files/:uuid
 * @param req 传入请求
 * @returns 响应
 */
const filesHanlder = async (req: Request): Promise<Response> => {
	let api = getStrAfterStr(req.url, '/miaomail/files');
	let resp = responseGenerator(500);
	switch (req.method) {
		case 'GET':
			let fileUUID = api.split('/')[1];
			let token = getStrAfterStr(req.headers.get('Authorization'), 'Bearer ');
			let verifyResult = verifyJWT(token);
			if (verifyResult.isValid) {
				resp = await getFile(verifyResult.payload.username, fileUUID);
			}
			break;
		default:
			resp = responseGenerator(405, { headers: { Allow: 'GET' } });
	}
	return resp;
};

/**
 * 获取文件
 * @param username 用户名
 * @param uuid 文件UUID
 * @returns 响应
 */
const getFile = async (username: string, uuid: string): Promise<Response> => {
	let file = await getAttachments(username, uuid);
	if (file !== null) {
		return responseGenerator(200, { data: file });
	} else {
		return responseGenerator(404, { message: 'File Not Exist' });
	}
};

export { filesHanlder };

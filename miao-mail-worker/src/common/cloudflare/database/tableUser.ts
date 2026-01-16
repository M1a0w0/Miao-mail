import { select, update } from '.';

/** 用户信息表列名 */
type MailUserColumnNames = 'id' | 'user_name' | 'user_password' | 'token_expire' | 'user_role' | 'user_nickname';
/** 可查询的用户信息 */
type MailUserQuery = [MailUserColumnNames, ...MailUserColumnNames[]];

/**
 * 用户信息参数类型
 * @description [只读]: 表示不允许在数据表中修改此字段
 * @description [唯一]: 表示此字段在数据表中不允许重复
 * @property id 内部ID [只读, 唯一]
 * @property user_name 用户名 [只读, 唯一]
 * @property user_password 用户密码
 * @property token_expire 在{token_expire: 10位时间戳}之前创建的令牌均过期
 * @property user_role 用户角色 admin=管理员 user=普通用户
 * @property user_nickname 用户昵称
 */
type MailUser = {
	id?: number;
	user_name?: string;
	user_password?: string;
	token_expire?: number;
	user_role?: string;
	user_nickname?: string;
};

/**
 * 获取用户信息
 * @param username 用户名
 * @param columnName 要查询的列
 * @returns 查询结果
 * @throws {Error | QueryEmptyError} 内部出错时抛出Error, 查询结果为空时抛出QueryEmptyError, 均为上层抛出
 */
const getUserInfo = async (username: string, columnName: MailUserQuery): Promise<Record<string, unknown>> => {
	return await select('user', columnName, ['user_name'], username);
};

/**
 * 设置用户信息
 * @param username 用户名
 * @param userInfo 用户信息
 * @returns 是否成功
 */
const setUserInfo = async (username: string, userInfo: MailUser): Promise<boolean> => {
	return await update('user', userInfo, ['user_name'], username);
};

export { getUserInfo, setUserInfo };

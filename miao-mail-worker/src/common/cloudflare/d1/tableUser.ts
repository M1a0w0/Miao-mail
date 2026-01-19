import { d1Select, d1Update } from '.';

/** 用户信息表列名 */
type MailUserColumnNames = 'user_name' | 'user_password' | 'token_expire' | 'user_role' | 'user_nickname';
/** 可查询的用户信息 */
type MailUserQuery = [MailUserColumnNames, ...MailUserColumnNames[]];

/**
 * 用户信息参数类型
 * @description [唯一]: 表示此字段在数据表中不允许重复
 * @description [只读]: 表示不允许在数据表中修改此字段
 * @property user_name [唯一, 只读] 用户名
 * @property user_password 用户密码
 * @property token_expire 在{token_expire: 10位时间戳}之前创建的令牌均过期
 * @property user_role 用户角色 admin=管理员 user=普通用户
 * @property user_nickname 用户昵称
 */
type MailUser = {
	user_name?: string;
	user_password?: string;
	token_expire?: number;
	user_role?: string;
	user_nickname?: string;
};

/**
 * 根据用户名获取用户信息
 * @param username 用户名
 * @param column 要查询的列, 为空时返回所有
 * @returns 查询结果
 * @throws {Error | QueryEmptyError} 内部出错时抛出Error, 查询结果为空时抛出QueryEmptyError, 均为上层抛出
 */
const getUserByUsername = async (
	username: string,
	column: MailUserQuery = ['user_name', 'user_password', 'token_expire', 'user_role', 'user_nickname'],
): Promise<MailUser> => {
	return (await d1Select('user', column, { user_name: username }))[0];
};

/**
 * 根据用户名设置用户信息
 * @param username 用户名
 * @param data 用户信息
 * @returns 是否成功
 */
const setUserByUsername = async (username: string, data: MailUser): Promise<boolean> => {
	return await d1Update('user', data, { user_name: username });
};

export { getUserByUsername, setUserByUsername };

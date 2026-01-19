import { env } from 'cloudflare:workers';

/** D1数据库 */
const d1 = env.prod_d1_tutorial;

/** 查询为空错误 */
class QueryEmptyError extends Error {}

/**
 * 运行SQL语句
 * @param stmt SQL语句
 * @param values 附加参数
 * @returns 查询结果
 * @throws {Error} 内部出错时抛出
 */
const runStatement = async (stmt: string, ...values: unknown[]): Promise<D1Result<Record<string, unknown>>> => {
	return await d1
		.prepare(stmt)
		.bind(...values)
		.run();
};

/**
 * 删除 DELETE
 * @param table 要删除数据的表
 * @param condition 删除条件
 * @returns true=删除成功
 */
const d1Delete = async (table: string, condition: Record<string, unknown>): Promise<boolean> => {
	try {
		let conditionKeys = Object.keys(condition);
		let conditionValues = Object.values(condition);
		return (await runStatement(`DELETE FROM ${table} WHERE ${conditionKeys.join(' = ?, ')} = ?`, ...conditionValues)).success;
	} catch {
		return false;
	}
};

/**
 * 插入 INSERT
 * @param table 要插入数据的表
 * @param data 要插入的数据
 * @returns true=插入成功
 */
const d1Insert = async (table: string, data: Record<string, unknown>): Promise<boolean> => {
	try {
		let dataKeys = Object.keys(data);
		let dataValues = Object.values(data);
		return (
			await runStatement(
				`INSERT INTO ${table} (${dataKeys.join(',')}) VALUES (${Array(dataKeys.length).fill('?').join(',')})`,
				...dataValues,
			)
		).success;
	} catch (error) {
		console.log(error);
		return false;
	}
};

/**
 * 查询 SELECT
 * @param table 要查询数据的表
 * @param column 要查询的列名
 * @param condition 查询条件
 * @returns 查询到的数据
 * @throws {Error | QueryEmptyError} 内部出错时抛出Error, 查询结果为空时抛出QueryEmptyError
 */
const d1Select = async (table: string, column: string[], condition: Record<string, unknown>): Promise<Record<string, unknown>[]> => {
	let conditionKeys = Object.keys(condition);
	let conditionValues = Object.values(condition);
	let result = await runStatement(`SELECT ${column.join(',')} FROM ${table} WHERE ${conditionKeys.join(' = ?, ')} = ?`, ...conditionValues);
	if (result.results.length > 0) {
		return result.results;
	} else {
		throw new QueryEmptyError();
	}
};

/**
 * 更新 UPDATE
 * @param table 要更新的表
 * @param data 要更新的列
 * @param condition 更新条件
 * @returns true=更新成功
 */
const d1Update = async (table: string, data: Record<string, unknown>, condition: Record<string, unknown>): Promise<boolean> => {
	try {
		let dataKeys = Object.keys(data);
		let dataValues = Object.values(data);
		let conditionKeys = Object.keys(condition);
		let conditionValues = Object.values(condition);
		return (
			await runStatement(
				`UPDATE ${table} SET ${dataKeys.join(' = ?, ')} = ? WHERE ${conditionKeys.join(' = ?, ')} = ?`,
				...dataValues,
				...conditionValues,
			)
		).success;
	} catch {
		return false;
	}
};

export { d1Delete, d1Insert, d1Select, d1Update, QueryEmptyError };

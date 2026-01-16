import { env } from 'cloudflare:workers';

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
	return await env.prod_d1_tutorial
		.prepare(stmt)
		.bind(...values)
		.run();
};

/**
 * 查询 SELECT
 * @param table 要查询的表
 * @param column 要查询的列
 * @param condition 条件
 * @param values 附加参数
 * @returns 查询到的数据
 * @throws {Error | QueryEmptyError} 内部出错时抛出Error, 查询结果为空时抛出QueryEmptyError
 */
const select = async (table: string, column: string[], condition: string[], ...values: unknown[]): Promise<Record<string, unknown>> => {
	let result = await runStatement(`SELECT ${column.join(',')} FROM ${table} WHERE ${condition.join(' = ?, ')} = ?`, ...values);
	if (result.results.length > 0) {
		return result.results[0];
	} else {
		throw new QueryEmptyError();
	}
};

/**
 * 更新 UPDATE
 * @param table 要更新的表
 * @param column 要更新的列
 * @param condition 条件
 * @param values 附加参数
 * @returns true=更新成功
 */
const update = async (table: string, column: Object, condition: string[], ...values: unknown[]): Promise<boolean> => {
	try {
		let editInfo = Object.entries(column) as [string, unknown][];
		let editKeys: string[] = [];
		let editValues: unknown[] = [];
		editInfo.forEach(([k, v]) => {
			editKeys.push(k);
			editValues.push(v);
		});
		return (
			await runStatement(
				`UPDATE ${table} SET ${editKeys.join(' = ?, ')} = ? WHERE ${condition.join(' = ?, ')} = ?`,
				...editValues,
				...values
			)
		).success;
	} catch {
		return false;
	}
};

export { QueryEmptyError, runStatement, select, update };

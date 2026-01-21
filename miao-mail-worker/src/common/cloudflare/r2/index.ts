import { env } from 'cloudflare:workers';

/** R2存储桶 */
const r2 = env.test_bucket;

/**
 * 读取元数据 Head
 * @param key 键名
 * @returns 元数据
 */
const r2Head = async (key: string): Promise<R2Object | null> => {
	try {
		return await r2.head(key);
	} catch {
		return null;
	}
};

/**
 * 读取数据 Get
 * @param key 键名
 * @returns 数据
 */
const r2Get = async (key: string): Promise<R2ObjectBody | null> => {
	try {
		return await r2.get(key);
	} catch {
		return null;
	}
};

/**
 * 存储数据 Put
 * @param key 键名
 * @param value 存储数据
 * @param customMetadata 存储自定义元数据
 * @returns 元数据
 */
const r2Put = async (
	key: string,
	value: string | ReadableStream<any> | ArrayBuffer | ArrayBufferView<ArrayBufferLike> | Blob | null,
	customMetadata: Record<string, string>,
): Promise<R2Object | null> => {
	try {
		return await r2.put(key, value, { customMetadata: customMetadata });
	} catch {
		return null;
	}
};

/**
 * 删除数据 Delete
 * @param keys 键名
 */
const r2Delete = async (keys: string | string[]): Promise<void> => {
	try {
		await r2.delete(keys);
	} catch {}
};

export { r2Delete, r2Get, r2Head, r2Put };

import { env } from 'cloudflare:workers';

/** R2存储桶 */
const r2 = env.test_bucket;

const r2Get = async (key: string): Promise<R2Object | R2ObjectBody | null> => {
	try {
		return await r2.get(key);
	} catch {
		return null;
	}
};

const r2Put = async (
	key: string,
	value: string | ReadableStream<any> | ArrayBuffer | ArrayBufferView<ArrayBufferLike> | Blob | null,
): Promise<R2Object | null> => {
	try {
		return await r2.put(key, value);
	} catch {
		return null;
	}
};

const r2Delete = async (keys: string | string[]): Promise<void> => {
	try {
		await r2.delete(keys);
	} catch {}
};

export { r2Delete, r2Get, r2Put };

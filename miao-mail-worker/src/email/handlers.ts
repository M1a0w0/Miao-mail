import PostalMime from 'postal-mime';

const mainHandler = async (message: ForwardableEmailMessage): Promise<void> => {
	let rawEmail = new Response(message.raw);
	let email = await PostalMime.parse(await rawEmail.arrayBuffer());
	console.log(email);
};

export { mainHandler as emailHandler };

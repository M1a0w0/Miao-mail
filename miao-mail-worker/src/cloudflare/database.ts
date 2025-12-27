const getUserTokenExpire = (username: string): number => {
	return Math.floor(Date.now() / 1000) - 1000000; //TODO:getUserTokenExpireTimeInDatabase
};

const setUserTokenExpire = (username: string): boolean => {
	return true; //TODO:setUserTokenExpireTimeInDatabase
};

const getUserPassword = (username: string): string => {
	return 'admin'; //TODO:getUserPassword
};

export { getUserPassword, getUserTokenExpire, setUserTokenExpire };

const privateRoutes: Readonly<string[]> = ['/my/*', '/invites/*', '/api/board|notes|user'];

const pathToRegexp = (path: string): RegExp => {
	// First, escape necessary special characters except for '*' and '|'
	// because we'll handle them separately for their special roles.
	let regexString = path.replace(/[-[\]/{}()+?.\\^$]/g, '\\$&');

	// Replace '*' with '.*' for wildcard matches
	regexString = regexString.replace(/\*/g, '.*');

	// Split by '|' to handle OR expressions, but avoid splitting escaped '\|'
	regexString = regexString.split(/\|(?![^\\]*(?:\\{2})*\\)/).join('|');

	return new RegExp(`^${regexString}$`);
};

export const matchesPrivateRoute = (path: string): boolean => {
	return privateRoutes.some((route) => pathToRegexp(route).test(path));
};

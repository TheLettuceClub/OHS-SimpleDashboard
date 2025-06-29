// various utility functions that I use elsewhere

/**
 * This exists so I can create static logins to actually access the UI. Has the same hashing logic as the UI.
 * Modified from: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/7616484#7616484
 */
export function hashCode(inPass: string): number {
	let hash = 0;
	if (inPass.length === 0) {
		return hash;
	}
	for (let i = 0; i < inPass.length; i++) {
		const chr = inPass.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

export const delay = function (ms: number) {
	return new Promise((res) => setTimeout(res, ms));
};

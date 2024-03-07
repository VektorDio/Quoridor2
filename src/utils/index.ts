export function deepCopy<T>(classObj: T): T {
	return Object.assign(Object.create(Object.getPrototypeOf(classObj)), classObj);
}

export function getColor(index: number) {
	return ['bg-white', 'bg-black', 'bg-red-900', 'bg-blue-900'][index];
}

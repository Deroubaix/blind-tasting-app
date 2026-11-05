/* eslint-disable @typescript-eslint/no-explicit-any */
export type Constructor = new (...args: any) => any;

/** dr-pam's ServiceContainer API, but lazy: a class is built on its first `getClass`, so order doesn't matter. */
export default class ServiceContainer {
	private readonly builders = new Map<Constructor, () => unknown>();
	private readonly constructed = new Map<Constructor, unknown>();
	private readonly building = new Set<Constructor>();

	public withClass<T extends new () => unknown>(type: T) {
		this.builders.set(type, () => new type());
		return this;
	}

	public withClassConstructorCallback<T extends Constructor>(
		type: T,
		constructorArgsCallback: (c: ServiceContainer) => [...ConstructorParameters<T>],
	) {
		this.builders.set(type, () => new type(...constructorArgsCallback(this)));
		return this;
	}

	public withFactory<T extends Constructor>(type: T, factory: () => InstanceType<T>) {
		this.builders.set(type, factory);
		return this;
	}

	public getClass<T extends Constructor>(type: T): InstanceType<T> {
		if (!this.constructed.has(type)) {
			const build = this.builders.get(type);
			if (!build) {
				throw new Error(`No class constructor found for type ${type.name}`);
			}
			if (this.building.has(type)) {
				throw new Error(`Circular dependency while building ${type.name}`);
			}
			this.building.add(type);
			try {
				this.constructed.set(type, build());
			} finally {
				this.building.delete(type);
			}
		}
		return this.constructed.get(type) as InstanceType<T>;
	}
}

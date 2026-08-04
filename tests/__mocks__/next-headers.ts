export function cookies() {
  return {
    getAll: () => [],
    get: (name: string) => undefined,
    set: (name: string, value: string, options: any) => {},
    delete: (name: string) => {},
    has: (name: string) => false,
  };
}

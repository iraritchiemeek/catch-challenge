// Tiny pure helper used by the home page. Exists mainly to anchor the unit-test
// project; real challenge logic (the GitHub repo listing) replaces this later.
export function greeting(name: string): string {
  return `Hello, ${name}!`;
}

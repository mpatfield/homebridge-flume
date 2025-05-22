export const SECOND = 1000;
export const MINUTE = 60 * SECOND;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseError(err: any, hideStack: string[] = []): string {
  let toReturn = err.message;
  if (err.stack && err?.stack?.length > 0 && !hideStack.includes(err.message)) {
    const stack = err.stack.split('\n');
    if (stack[1]) {
      toReturn += stack[1].replace('   ', '');
    }
  }
  return toReturn;
};

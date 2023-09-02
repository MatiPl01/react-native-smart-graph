/* eslint-disable @typescript-eslint/no-explicit-any */
export type ChangeResult<T = void> = {
  data?: T;
} & (
  | {
      error: string;
      success: false;
    }
  | {
      success: true;
    }
);

type AnyFunction = (...props: Array<any>) => any;

type WithChangeResult<F extends AnyFunction> = (
  ...props: Parameters<F>
) => ChangeResult<ReturnType<F>>;

export const catchError =
  <F extends AnyFunction>(fn: F): WithChangeResult<F> =>
  (...props) => {
    try {
      return {
        data: fn(...props) as ReturnType<F>,
        success: true
      };
    } catch (error) {
      return {
        error: (error as Error).message,
        success: false
      };
    }
  };

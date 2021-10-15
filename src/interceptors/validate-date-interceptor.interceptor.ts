import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: ValidateDateInterceptorInterceptor.BINDING_KEY}})
export class ValidateDateInterceptorInterceptor
  implements Provider<Interceptor>
{
  static readonly BINDING_KEY = `interceptors.${ValidateDateInterceptorInterceptor.name}`;

  /*
  constructor() {}
  */

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Add pre-invocation logic here
      let bodyData: any | undefined;
      if (invocationCtx.methodName === 'create')
        bodyData = invocationCtx.args[0];
      else if (invocationCtx.methodName === 'updateById')
        bodyData = invocationCtx.args[1];

      if (!bodyData || !this.isDateStringValid(bodyData?.createdDate)) {
        const err: ValidationError = new ValidationError('Date is invalid');
        err.statusCode = 400;
        throw err;
      } else {
        bodyData.createdDate = new Date(+bodyData.createdDate);
      }
      const result = await next();
      // Add post-invocation logic here
      return result;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }

  isDateStringValid(date: string) {
    const numb = +date;
    let d = new Date(numb);
    return d instanceof Date && !isNaN(+numb);
  }
}

class ValidationError extends Error {
  code?: string;
  statusCode?: number;
}

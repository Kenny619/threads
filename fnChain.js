//function format
//function or promise.
//first argument will always be arg, free to put additional argument.
/**
 * fnAry = [
 *  {
 *   fn: function
 *   catch: function called when fn failed to resolve.
 *  }
 * ]
 *
 * finalAry = {
 *  fnFinal = function.
 *  fnFinalCatch = function called when fnFinal failed to resolve.
 * }
 */

class FnChain {
  constructor(paramAry, functionAry, finalAry) {
    if (paramAry.length === 0) throw new Error(`Parameter array is empty.`);
    if (functionAry.length === 0) throw new Error(`Function array is empty.`);

    this.params = params.reverse();
    this.functionAry = functionAry.reverse();
    this.carriedValue = null;

    this.functionAry = functionAry;
    if (finalAry) {
      this.fnFinal = finalAry.fnFinal ? finalAry.fnFinal : () => {};
      this.fnFinalCatch = finalAry.fnFinalCatch
        ? finalAry.fnFinalCatch
        : () => {};

      const params = [...this.params];
      const functions = [...this.functionAry];
      this._recur(params, functions);
    }
  }

  _recur = (params, functions) => {
    /** this.carried */
    let carried = this.carriedValue ? this.carriedValue : null;
    let carriedObj = { carriedValue: carried };

    /**
     *  exit condition
     *  call fnFinal/fnFinalCatch and exit the recursion.
     */
    if (this.params.length === 0) {
      try {
        this.fnFinal.call(carriedObj);
      } catch (err) {
        if (typeof this.fnFinalCatch !== "function")
          throw new Error(
            `finalAry.fnFinalCatch has to be of a type function.`
          );
        this.fnFinalCatch.call({ err: err });
      }
      return;
    }

    if (functions.length === 0) {
      param = params.pop();
      functions = [...this.functionAry];
    }

    const fns = functions.pop();

    const pfn = Promise.resolve(fns.fn.call(carriedObj, param));
    pfn
      .then((res) => {
        carried = res ? res : carried;
        carriedObj = { carriedValue: carried };
        this._recur.call(carriedObj, params, functions);
      })
      .catch((err) => {
        console.log(`failed to resolve fn`, err);
      });
  };

  getCarriedValue = () => {
    return this.carried;
  };

  _isFnStatement = (fn) => {
    const regex = new RegExp(/^\s*function\s/);
    if (regex.test(fn)) return true;

    try {
      Function("return " + fn);
      return false;
    } catch (error) {
      return true;
    }
  };
}

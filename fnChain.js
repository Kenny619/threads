/**
 * Represents a chain of functions/promises executed sequentially with parameters provided.
 * @class
 * @classdesc The `FnChain` class iterates through parameters and executes a series of
 * functions/promises with each parameter. The result of each execution is carried over
 * to the next iteration. After all parameters are processed, it optionally executes a final
 * function/promise provided in the `finalAry`.
 */
class FnChain {
  /**
   * Creates an instance of the `FnChain` class.
   * @constructor
   * @param {Array} paramAry - An array of parameters to be used as arguments in function execution.
   * @param {Array} functionAry - An array of functions/promises to be executed in sequence.
   * @param {Object}
   * @param {Object} [final] - An optional object containing finalization functions.
   * @param {Function} [final.fn] - The final function to be executed after processing all parameters.
   * @param {Function} [final.fnCatch] - The function to handle errors in the finalization process.
   * @throws Will throw an error if `paramAry` or `functionAry` is empty.
   */
  constructor(paramAry, functionAry, finalObj) {
    if (paramAry.length === 0) throw new Error(`Parameter array is empty.`);
    if (functionAry.length === 0) throw new Error(`Function array is empty.`);

    this.params = paramAry.reverse();
    this.functionAry = functionAry.reverse();
    this.returns = [];

    this.functionAry = functionAry;
    if (finalObj) {
      this.fnFinal = finalObj.fn ? finalObj.fn : () => {};
      this.fnFinalCatch = finalObj.fnCatch ? finalObj.fnCatch : () => {};

      const functions = [...this.functionAry];
      const param = this.params.pop();
      this._recur(param, functions);
    }
  }

  /**
   * Internal recursive function for executing functions/promises in sequence with parameters.
   * @private
   * @param {*} param - The current parameter to be used as an argument.
   * @param {Array} functions - The functions/promises to be executed in a sequence.
   */
  _recur = (param, functions) => {
    /** this.carried */

    /**
     *  exit condition
     *  call fn/fnCatch and exit the recursion.
     */
    const fns = functions.pop();

    const pfn = Promise.resolve(fns.fn.call({ carriedValue: this.returns }, param));
    pfn
      .then(res => {
        if (res) this.returns = [...this.returns, res];

        if (this.params.length === 0 && functions.length === 0) {
          try {
            const pfn = Promise.resolve(this.fnFinal.call({ carriedValue: this.returns }, param));
            pfn.then(res => {
              return;
            });
          } catch (err) {
            if (typeof this.fnFinalCatch !== "function") throw new Error(`final.fnCatch has to be a type function.`);
            this.fnFinalCatch.call({ err: err });
          }
          return;
        }

        if (functions.length === 0) {
          param = this.params.pop();
          functions = [...this.functionAry];
        }
        this._recur.call({ carriedValue: this.returns }, param, functions);
      })
      .catch(err => {
        const pfnCatch = Promise.resolve(fns.fnCatch.call({ err: err }, param));
        pfnCatch.then(res => {
          return;
        });
      });
  };

  /**
   * Retrieves the carried value from the series of function executions.
   * @returns {*} The carried value from the series of function executions.
   */
  getCarriedValue = () => {
    return this.carried;
  };

  /**
   * Checks if the provided function is a function statement or an arrow function.
   * @private
   * @param {Function} fn - The function to be checked.
   * @returns {boolean} `true` if the function is a statement, `false` if it's an arrow function.
   */
  _isFnStatement = fn => {
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

module.exports = FnChain;

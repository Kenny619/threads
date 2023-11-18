/**
 * Represents a chain of functions/promises executed sequentially with parameters provided.
 * @class
 * @classdesc The `FnChain` class iterates through parameters and executes a series of
 * functions/promises with each parameter. The result of each execution is carried over
 * to the next iteration. After all parameters are processed, it optionally executes a final
 * function/promise provided in the `finalAry`.
 */
class ThreadsOrdered {
  /**
   * Serialized promise container.  Hold promises in an array of object {id:integer, prms:[promises]}
   */
  static prmsAry = [];
  /**
   * Creates an instance of the `FnChain` class.
   * @constructor
   * @param {Number} threads - Number of threads i.e. number of promises running concurrently.
   * @param {Array} paramAry - An array of parameters to be used as arguments in function execution.
   * @param {Array} functionAry - An array of functions/promises to be executed in sequence.
   * @param {Object} [final] - An optional object containing finalization functions.
   * @param {Function} [final.fn] - The final function to be executed after processing all parameters.
   * @param {Function} [final.fnCatch] - The function to handle errors in the finalization process.
   * @throws Will throw an error if `paramAry` or `functionAry` is empty.
   */
  constructor(threads, paramAry, functionAry, finalObj) {
    if (paramAry.length === 0) throw new Error(`Parameter array is empty.`);
    if (functionAry.length === 0) throw new Error(`Function array is empty.`);

    this.threads = threads;

    /** Array of parameters to be passed to the functions as arguments.  Reversed for the purpose of using pop */
    this.params = paramAry.reverse();

    /** Series of funtions/promises.  Functions/promises runs in the order from functionAry[0].  Reserved for the purpose of using pop */
    this.functionAry = functionAry.reverse();

    /** Holds returned/resolved values pased by functions/promises.  Functions/promises can refer to this value as this.carriedValue. */
    this.returns = [];

    /** Track the next promise to be resolved. */
    this.resolveId = 0;

    /** id counter for serializing promises */
    this.idCnt = 0;

    this.functionAry = functionAry;
    if (finalObj) {
      this.fnFinal = finalObj.fn ? finalObj.fn : function () {};
      this.fnFinalCatch = finalObj.fnCatch ? finalObj.fnCatch : function () {};
      if (typeof this.fnFinal !== "function" || typeof this.fnFinalCatch !== "function") {
        throw new Error(`FnFinal and fnFinalCatch both need to be functions.${typeof this.fnFinal}, ${typeof this.fnFinalCatch}`);
      }

      for (let i = 0; i < this.threads; i++) {
        if (this.params.length === 0) {
          return;
        }
        const param = this.params.pop();
        this._prepFunctions(param);
      }

      this._resolver();
    }
  }

  _prepFunctions = param => {
    let resultObj = { id: this.idCnt, param: param, fn: [] };
    this.functionAry.forEach(fns => {
      let obj = {};
      obj.prms = this._isPromise(fns.fn) ? fns.fn : this._promisify(fns.fn);
      if (fns.fnCatch) obj.fnCatch = fns.fnCatch;
      if (fns.cb) obj.cb = fns.cb;
      if (fns.cbCatch) obj.cbCatch = fns.cbCatch;
      resultObj.fn.push(obj);
    });
    ThreadsOrdered.prmsAry.push(resultObj);
    this.idCnt++;
  };

  /**
   * Internal recursive function for executing functions/promises in sequence with parameters.
   * @private
   * @param {*} param - The current parameter to be used as an argument.
   * @param {Array} functions - The functions/promises to be executed in a sequence.
   */
  _resolver = () => {
    /** this.carried */

    /**
     *  exit condition
     *  call fn/fnCatch and exit the recursion.
     */
    let param = ThreadsOrdered.prmsAry[this.resolveId].param;
    let fns = ThreadsOrdered.prmsAry[this.resolveId].fn.pop();

    fns.prms
      .call({ carriedValue: this.returns }, param)
      .then(fnReturn => {
        if (fns.cb) {
          if (fnReturn) this.returns = [...this.returns, fnReturn];

          const pcb = this._isPromise(fns.cb) ? fns.cb : this._promisify(fns.cb);
          pcb
            .call({ carriedValue: this.returns }, param)
            .then(cbReturn => this._thenTask(cbReturn))
            .catch(err => {
              if (fns.cbCatch) {
                this._catchTask(err, fns.cbCatch, param);
              } else {
                return;
              }
            });
        } else {
          this._thenTask(fnReturn);
        }
      })
      .catch(err => {
        if (fns.fnCatch) {
          this._catchTask(err, fns.fnCatch, param);
        } else {
          return;
        }
      });
  };

  _thenTask = returned => {
    if (returned) this.returns = [...this.returns, returned];
    //this.resolveId++;
    this._next();
  };

  _catchTask = (err, fn, param) => {
    this.returns = [...this.returns, err];
    // const pCatch = Promise.resolve(fn.call({ err: err }, param));
    // pCatch.then(returned => this._thenTask(returned));
    const pfn = this._isPromise(fn) ? fn : this._promisify(fn);
    pfn
      .call({ err: err }, param)
      .then(res => this._thenTask(res))
      .catch(err => this._catchTask(err));
  };

  _next = () => {
    const isMoreTask = ThreadsOrdered.prmsAry.length - 1 > this.resolveId;
    const isMoreFunctions = ThreadsOrdered.prmsAry[this.resolveId].fn.length > 0;
    const isMoreParams = this.params.length > 0;
    if (!isMoreTask && !isMoreFunctions && !isMoreParams) {
      this._final();
    } else if (isMoreTask && !isMoreFunctions && isMoreParams) {
      this.resolveId++;
      const p = this.params.pop();
      this._prepFunctions(p);
      this._resolver();
    } else if (isMoreTask && !isMoreFunctions) {
      this.resolveId++;
      this._resolver();
    } else {
      this._resolver();
    }
  };

  _final = () => {
    // console.log(this._isPromise(this.fnFinal), this._isPromise(this.fnFinalCatch));
    try {
      const pfinal = this._isPromise(this.fnFinal) ? this.fnFinal : this._promisify(this.fnFinal);
      pfinal.call({ carriedValue: this.returns }).then(res => {
        return;
      });
    } catch (err) {
      const pfinalCatch = this._isPromise(this.fnFinalCatch) ? this.fnFinalCatch : this._promisify(this.fnFinalCatch);
      pfinalCatch.then(res => {
        return;
      });
    }
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
  // _isFnStatement = fn => {
  //   const regex = new RegExp(/^\s*function\s/);
  //   if (regex.test(fn)) return true;

  //   try {
  //     Function("return " + fn);
  //     return false;
  //   } catch (error) {
  //     return true;
  //   }
  // };

  _isPromise = fn => {
    const regex = new RegExp(/new Promise\(/);
    if (typeof fn === "function") {
      // Check if the result is a promise
      if (regex.test(fn)) {
        return true;
      } else {
        return false;
      }
    } else if (fn && typeof fn.then === "function") {
      return true;
    } else {
      throw new Error(`${fn} has to be either a function or a promise.`);
    }
  };

  _promisify = fn => {
    return function () {
      return new Promise((resolve, reject) => {
        try {
          const result = fn.apply(this, arguments);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    };
  };
}
module.exports = ThreadsOrdered;

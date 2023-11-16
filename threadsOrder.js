/**
 * Class representing a utility for running functions concurrently with a limited number of threads.
 * @class
 *
 *
 *
 */
class Threads {
  /**
   * Create a Threads instance.
   * @constructor
   * @param {number} threadNum - The maximum number of tasks running simultaneously.
   * @param {Array} baseArgs - An array of base arguments that will be passed to each function.
   * @param {Array} fnArray - An array of objects containing functions to be executed and their corresponding callbacks.
   * @param {Function} [finalCb=() => {}] - The final callback function to be executed when all tasks are completed.
   * @param {Array} [finalCbArgs=[]] - Arguments to be passed to the final callback function.
   */
  constructor(threadNum, baseArgs, functions) {
    /** Max number of tasks running simultaneously */
    this.threadNum = threadNum;

    /** Array container for the arguments to be used for the series of functions  */
    this.baseArgs = baseArgs.reverse(); // reverse order for the purpose of using pop instead of shift

    /**
     * An array of objects, each specifying a set of functions and callbacks.
     * @type {Array<FunctionArrayObject>}
     * Represents an array of objects, each specifying a set of functions and callbacks.
     * @typedef {Object} FunctionArrayObject
     * @property {Function} fn - The main function to be executed.
     * @property {Function} [fnCatch] - The callback function to be executed after the main function.
    *  @property {Function} [fnCb] - The callback function to be executed after the main function.
     * @property {Function} [fnCbCatch] - The catch function to be executed when the main function fails.
     * @property {Function} [fn] - The catch function to be executed when the callback function fails.
     * @property {Function} [fnFinal] - The catch function to be executed when the callback function fails.
     * @property {Function} [fnFinalCatch] - The catch function to be executed when the callback function fails.

    */
    this.fnObj = fnObj;

    /** Tracks the number of remaining tasks. */
    this.remainingTasks = this.baseArgs.length;

    /** define functions */
    Object.keys(functions).forEach((key) => {
      this[key] = key ? functions.key : () => {};
    });

    /** Set of functions for the initial run */

    /** Initialize thread.  Promises/functions up to threadNum runs concurrently */
    for (let n = 0; n < this.threadNum; n++) {
      /** Do nothing when threadNum is larger than the length of baseArg */
      if (this.baseArgs.length === 0) {
        return;
      }
      /** Start calling functions in sequence. */
      this._runThread();
    }
  }

  /**
   * Run a task in a thread.
   * @private
   */
  _runThread = () => {
    if (this.baseArgs.length === 0) {
      return;
    }

    const args = this.baseArgs.pop();
    const fns = [...this.fnArray];

    this._callFnInSequence(args, fns);
  };

  /**
   * Call functions in sequence with the provided arguments.
   * @private
   * @param {any} args - The arguments to be passed to the functions.
   * @param {Array} fns - An array of objects containing functions and their corresponding callbacks.
   * @returns {Promise} - A promise that resolves when all functions and callbacks are completed.
   */

  _callFnInSequence = async (args, fns) => {
    let skipCb = false;
    let fnReturn;
    const fnObj = fns.shift();
    try {
      const pfn = Promise.resolve(fnObj.fn(args));
      fnReturn = await pfn;
    } catch (err) {
      console.error(`failed to resolve ${fnObj.fn}`);
      skipCb = true;
    }

    if (skipCb === false) {
      try {
        const pfncb = Promise.resolve(fnObj.fnCb(args, fnReturn));
        await pfncb;
      } catch (err) {
        console.error(`failed to resolve ${fnObj.fnCb}`);
      }
    }
    if (fns.length === 0) {
      this.remainingTasks--;

      if (this.remainingTasks === 0) {
        this.finalCb();
        return false;
      }

      if (this.baseArgs.length === 0) {
        return false;
      }

      args = this.baseArgs.shift();
      fns = [...this.fnArray];
      this._callFnInSequence(args, fns);
    } else {
      this._callFnInSequence(args, fns);
    }
  };
}

module.exports = Threads;

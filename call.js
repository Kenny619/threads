const isExpression = (function (functionDeclaration) {
  return function (regex) {
    if (functionDeclaration.test(regex)) return false;

    try {
      Function("return " + regex);
      return true;
    } catch (error) {
      return false;
    }
  };
})(new RegExp(/^\s*function\s/));

function prms(value) {
  return new Promise((resolve) => {
    let v = value + 1;
    let msg = `resolved prms. ${value} was passed as an argument. incremented v to ${v}.  `;
    if (this.inherited) {
      v += this.inherited;
      msg += `${this.inherited} is inherited form the previous round. adding ${this.inherited} to v to get ${v}`;
    }
    console.log(msg + "\r\n");
    resolve(v);
  });
}

const _prms = (value) => {
  return new Promise((resolve) => {
    let v = value + 1;
    let msg = `resolved prms. ${value} was passed as an argument. incremented v to ${v}.  `;
    if (this.inherited) {
      v += this.inherited;
      msg += `${this.inherited} is inherited form the previous round. adding ${this.inherited} to v to get ${v}`;
    }
    console.log(msg + "\r\n");
    resolve(v);
  });
};

function cb(cbVal) {
  let v = cbVal;
  if (this.prmsReturn) {
    v += this.prmsReturn;
  }
  let msg = `Calling cb with argument ${cbVal}.  ${this.prmsReturn} was returned from the previous funtion/promise. There sum is ${v}.  `;
  if (this.inherited) {
    v += this.inherited;
    msg += `${this.inherited} was carried from previous round.  Adding ${this.inherited} to v to get ${v}`;
  }
  console.log(msg + "\r\n");
  return v;
}

function fnCatch(err) {
  console.log(`failed to resolve fn.`, err);
}

function cbCatch(err) {
  console.log(`failed to resolve cb.`, err);
}

function final() {
  console.log(`The final number is ${this.inherited}`);
  return;
}

this.inherited = function (val) {
  return val;
};

function recur(fns, params) {
  const arg = params.pop();

  let inherited = this.inherited || null;
  let passObj = { inherited: inherited };

  const pfn = Promise.resolve(fns.prms.call(passObj, arg));
  pfn
    .then((res) => {
      let passObj = { inherited: this.inherited };
      if (res) {
        passObj.prmsReturn = res;
        inherited = res;
      }
      /** callback */
      if (fns.cb) {
        let pfnCb = Promise.resolve(fns.cb.call(passObj, arg));
        pfnCb
          .then((cbRes) => {
            if (cbRes) {
              inherited = cbRes;
            }

            if (params.length === 0) {
              fns.final.call({ inherited: inherited });
            } else {
              fns.recur.call({ inherited: inherited }, fns, params);
            }
          })
          .catch((err) => {
            fns.catch.call(passObj, err);
          });
      }
    })
    .catch((err) => {
      console.log(`failed to resolve fn`, err);
    });
}

// console.log(st);
// console.log(ex);
// console.log(co);

const st = isExpression(prms);
const ex = isExpression(_prms);
const _co = ex2dec(_prms);
const co = isExpression(_co);

function ex2dec(fnExpression) {
  return function () {
    fnExpression;
  };
}

const fns = {
  prms: _prms,
  cb: cb,
  recur: recur,
  final: final,
};

const params = [1, 10];

fns.recur(fns, params.reverse());

const isExpression = (function (functionDeclaration) {
  return function (code) {
    if (functionDeclaration.test(code)) return false;

    try {
      Function("return " + code);
      return true;
    } catch (error) {
      return false;
    }
  };
})(new RegExp(/^\s*function\s/));

const isFnExpression = function (fn) {
  const regex = new RegExp(/^\s*function\s/);

  if (regex.test(fn)) return false;

  try {
    Function("return " + fn);
    return true;
  } catch (error) {
    return false;
  }
};

const isFnStatement = (fn) => {
  const regex = new RegExp(/^\s*function\s/);

  if (regex.test(fn)) return true;

  try {
    Function("return " + fn);
    return false;
  } catch (error) {
    return true;
  }
};
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

// console.log(st);
// console.log(ex);
// console.log(co);

let st = isExpression(prms);
let ex = isExpression(_prms);
let co_prms = function () {
  return _prms;
};
let co = isExpression(co_prms);

// console.log(st);
// console.log(ex);
// console.log(co);

st = isFnStatement(prms);
ex = isFnStatement(_prms);
co = isFnStatement(co_prms);
console.log(st);
console.log(ex);
console.log(co);

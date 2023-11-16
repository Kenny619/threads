function fn(val) {
  const v = this.carried ? val + this.carried : val;
  console.log(`v is ${v}`);
}

this.carried = 1000;

const _fn = (val) => {
  const v = val + this.carried;
  console.log(`v is ${v}`);
};

_fn.call({ carried: 100 }, 5);

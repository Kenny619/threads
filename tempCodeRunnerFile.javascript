var isExpression = function (functionDeclaration) {
    return function (regex) {
        if (functionDeclaration.test(regex)) return false;

        try {
            Function("return " + regex);
            return true;
        } catch (error) {
            return false;
        }
    };
}(new RegExp(/^\s*function\s/));


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

    const st =isExpression(prms);   
    const ex = isExpression(_prms);
  console.log(st);
  console.log(ex);
  
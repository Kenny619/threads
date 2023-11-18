const FnChain = require("../fnChain");

const contestans = [{ name: "Bob" }, { name: "Nick" }, { name: "Mia" }, { name: "Jo" }];
const activities = [
  { fn: swim, fnCatch: fnCatch },
  { fn: bike, fnCatch: fnCatch },
  { fn: run, fnCatch: fnCatch },
];
const final = { fn: showRecords };

const chain = new FnChain(contestans, activities, final);

function activity(name, activity, min, max) {
  const time = Math.floor(Math.random() * (max - min + 1) + min);
  const result = { name: name, activity: activity, time: time };
  return result;
}

function bike(arg) {
  return activity(arg.name, "bike", 75, 95);
}

function run(arg) {
  return activity(arg.name, "run", 55, 70);
}

function swim(arg) {
  return activity(arg.name, "swim", 30, 50);
}

function fnCatch(args) {
  console.log(this.err, "failed for ", args);
}

function showRecords() {
  const ttlTimeObj = {};
  this.carriedValue.forEach(({ name, time }) => {
    if (!ttlTimeObj[name]) {
      ttlTimeObj[name] = 0;
    }
    ttlTimeObj[name] += time;
  });

  const ttlTime = Object.entries(ttlTimeObj).map(([name, time]) => ({ name, time }));

  // Sort the array based on time in descending order
  ttlTime.sort((a, b) => a.time - b.time);
  const medal = { 0: "🥇", 1: "🥈", 2: "🥉", 3: "" };

  ttlTime.forEach(({ name, time }, index) => {
    console.log(`${name}${medal[index]}`);
    const indiRecords = this.carriedValue.filter(record => record.name === name);
    indiRecords.forEach(({ activity, time }) => {
      console.log(activity.padStart(5, " "), ":", min2HHMM(time));
    });
    console.log("total :", min2HHMM(time), "\r\n");
  });
  console.log(`The winner is ${ttlTime[0].name}!🎉🎉🎉`);
}

function min2HHMM(minutes) {
  return `${Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;
}

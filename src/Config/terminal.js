const { Console } = require("console");
const fs = require("fs");
const myLogger = new Console({
  stdout: fs.createWriteStream("./spamPrevention/Output.txt"),
  stderr: fs.createWriteStream("./spamPrevention/Error.txt"),
});

for (let i = 0; i < 3; i++) {
  myLogger.log(i)
}
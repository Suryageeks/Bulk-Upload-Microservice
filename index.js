// CSV FILE

const fs = require("fs");
const fastcsv = require("fast-csv");
const { Worker } = require("worker_threads");
const batchInsert = require("./utils/batchInsert");

console.time("importTime"); // get initial timer

const bytesToMB = (bytes) => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

const initMemory = process.memoryUsage(); // get initial memory
console.log(`Initial Memory ${bytesToMB(initMemory.rss)} MB`);

let stream = fs.createReadStream("./example/source.csv");
let csvStore = [];
let batchSize = 2_00_000;
let skipFirstRow = false;

let csvStream = fastcsv
  .parse()
  .on("data", (data) => {
    if (!skipFirstRow) {
      skipFirstRow = true;
      return;
    }
    const validation = data.map((value) => (isNumeric(value) ? null : value));
    csvStore.push(validation);
    if (csvStore.length >= batchSize) {
      batchInsert(csvStore);
      csvStore = [];
    }
  })
  .on("end", () => {
    if (csvStore.length > 0) {
      batchInsert(csvStore);
    }
    console.timeEnd("importTime"); // get end time

    const worker = new Worker("./utils/memoryClearWorker.js");

    worker.on("message", (msg) => {
      if (typeof msg === "object" && msg.memoryUsageDifference) {
        console.log(
          `Memory usage difference after cleaning - ${JSON.stringify(
            msg.memoryUsageDifference
          )}`
        );
      } else {
        console.log(msg);
      }

      const finalMemory = process.memoryUsage();
      console.log(`Final Memory after cleaning: 
      ${bytesToMB(finalMemory.rss)} MB`);
    });
  })
  .on("error", (error) => {
    console.error("CSV Error occurred", error);
  });

stream.pipe(csvStream);

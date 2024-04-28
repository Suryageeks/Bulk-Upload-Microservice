// XLSX FILE

const fs = require("fs");
const { getXlsxStream } = require("xlstream");
const { Worker } = require("worker_threads");
const batchExcelInsert = require("./utils/batchExcelInsert");

console.time("importTime"); // get initial timer

const bytesToMB = (bytes) => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

const initMemory = process.memoryUsage(); // get initial memory
console.log(`Initial Memory ${bytesToMB(initMemory.rss)} MB`);

let batchSize = 2_00_000;
let skipFirstRow = false;
let excelStore = [];

(async () => {
  try {
    const stream = await getXlsxStream({
      filePath: "./example/sourceExcel.xlsx",
      sheet: 0,
    });

    stream.on("data", (data) => {
      if (!skipFirstRow) {
        skipFirstRow = true;
        return;
      }
      data.raw.obj = Object.fromEntries(
        Object.entries(data.raw.obj).map(([key, value]) => [
          key,
          value !== null && typeof value !== "string" ? String(value) : value,
        ])
      );

      excelStore.push(data.raw.obj);

      if (excelStore.length >= batchSize) {
        batchExcelInsert(excelStore);
        excelStore = [];
      }
    });

    stream.on("end", () => {
      if (excelStore.length > 0) {
        batchExcelInsert(excelStore);
      }
    });

    stream.on("error", (error) => {
      console.error("Error occurred ", error);
    });

    stream.on("end", () => {
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
    });
  } catch (error) {
    console.error("Error occurred while parsing excel ", error);
  }
})();

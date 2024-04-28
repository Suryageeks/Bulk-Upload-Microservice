const { parentPort } = require("worker_threads");

const bytesToMB = (bytes) => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

const clearMemory = () => {
  global.gc();

  const afterMemoryClear = process.memoryUsage();
  const memoryUsageDifference = {
    rss: bytesToMB(afterMemoryClear.rss),
    heapTotal: bytesToMB(afterMemoryClear.heapTotal),
    heapUsed: bytesToMB(afterMemoryClear.heapUsed),
    external: bytesToMB(afterMemoryClear.external),
  };

  parentPort.postMessage({
    message: "Memory Cleared",
    memoryUsageDifference: memoryUsageDifference,
  });
};

clearMemory();

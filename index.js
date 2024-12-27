const spawn = require("child_process").spawn;

function getCPUTemperature(callback) {
  const regex = /temp=([^'C]+)/;
  const cmd = spawn("/usr/bin/vcgencmd", ["measure_temp"]);

  cmd.stdout.once("data", (data) => {
    const match = data.toString("utf8").match(regex);
    callback(match ? parseFloat(match[1]) : null);
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

function getMemoryUsage(callback) {
  const cmd = spawn("free");

  cmd.stdout.once("data", (data) => {
    const usages = data
      .toString("utf8")
      .split("\n")[1]
      .replace(/( +)/g, " ")
      .split(" ");
    const [total, used, free, shared, buffCache, available] = usages
      .splice(1)
      .map((usage) => parseFloat(usage));

    callback({ total, used, free, shared, buffCache, available });
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

function getDiskUsage(callback) {
  const cmd = spawn("df");

  cmd.stdout.once("data", (data) => {
    const usages = data
      .toString("utf8")
      .split("\n")
      .filter(Boolean)
      .splice(1)
      .map((usageText) => {
        const [
          filesystem,
          oneKBlocks,
          used,
          available,
          usePercentage,
          mountedOn,
        ] = usageText.replace(/( +)/g, " ").split(" ");
        return {
          filesystem,
          oneKBlocks: parseFloat(oneKBlocks),
          used: parseFloat(used),
          available: parseFloat(available),
          usePercentage: parseFloat(usePercentage.replace("%", "")),
          mountedOn,
        };
      });
    callback(usages);
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

function getVoltage(callback) {
  const regex = /volt=([^V]+)/;
  const cmd = spawn("/usr/bin/vcgencmd", ["measure_volts"]);

  cmd.stdout.once("data", (data) => {
    const match = data.toString("utf8").match(regex);
    callback(match ? parseFloat(match[1]) : null);
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

function asynchronize(candidate, errorMessage) {
  return () =>
    new Promise((resolve, reject) => {
      candidate((value) => {
        if (value === null) {
          reject(new Error(errorMessage));
        }

        resolve(value);
      });
    });
}

module.exports = {
  getCPUTemperature,
  getCPUTemperatureAsync: asynchronize(
    getCPUTemperature,
    "Failed to read CPU temperature",
  ),
  getMemoryUsage,
  getMemoryUsageAsync: asynchronize(
    getMemoryUsage,
    "Failed to read memory usage",
  ),
  getDiskUsage,
  getDiskUsageAsync: asynchronize(getDiskUsage, "Failed to read disk usage"),
  getVoltage,
  getVoltageAsync: asynchronize(getVoltage, "Failed to read voltage"),
};

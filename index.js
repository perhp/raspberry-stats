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

function getClockFrequencies(callback) {
  const clocks = [
    "arm",
    "core",
    "h264",
    "isp",
    "v3d",
    "uart",
    "pwm",
    "emmc",
    "pixel",
    "vec",
    "hdmi",
    "dpi",
  ];

  let results = [];
  let pending = clocks.length;

  for (const clock of clocks) {
    const cmd = spawn("/usr/bin/vcgencmd", ["measure_clock", clock]);

    cmd.stdout.once("data", (data) => {
      const match = data.toString("utf8").match(/frequency\(\d+\)=(\d+)/);
      const frequency = match ? parseInt(match[1]) : 0;

      results.push({ clock, frequency });
    });

    cmd.stderr.once("data", () => {
      results.push({ clock, frequency: null });
    });

    cmd.on("close", () => {
      pending--;
      if (pending === 0) {
        callback(results);
      }
    });
  }
}

function getClockFrequency(clock, callback) {
  const cmd = spawn("/usr/bin/vcgencmd", ["measure_clock", clock]);

  cmd.stdout.once("data", (data) => {
    const match = data.toString("utf8").match(/frequency\(\d+\)=(\d+)/);
    const frequency = match ? parseInt(match[1]) : 0;

    callback(frequency);
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

function getCPUUsage(callback) {
  const cmd = spawn("bash", [
    "-c",
    `top -bn10 -d 0.1 | grep "Cpu(s)" | awk '{ print 100 - $8 }'`,
  ]);

  cmd.stdout.once("data", (data) => {
    const usage = data
      .toString("utf8")
      .split("\n")
      .filter(Boolean)
      .reduce((acc, curr, index, original) => {
        const parsedCurrent = parseFloat(curr);
        if (index === original.length - 1) {
          return (acc + parsedCurrent) / original.length;
        }
        return acc + parsedCurrent;
      }, 0);
    callback(usage);
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

function getUptime(callback) {
  const cmd = spawn("awk", ["{print $1*1000}", "/proc/uptime"]);

  cmd.stdout.once("data", (data) => {
    callback(parseInt(data.toString("utf8")));
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

function asynchronize(candidate, errorMessage) {
  return (...args) =>
    new Promise((resolve, reject) => {
      candidate(...args, (value) => {
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
  getClockFrequencies,
  getClockFrequenciesAsync: asynchronize(
    getClockFrequencies,
    "Failed to read clock frequencies",
  ),
  getClockFrequency,
  getClockFrequencyAsync: asynchronize(
    getClockFrequency,
    "Failed to read clock frequency",
  ),
  getCPUUsage,
  getCPUUsageAsync: asynchronize(getCPUUsage, "Failed to read CPU usage"),
  getUptime,
  getUptimeAsync: asynchronize(getUptime, "Failed to read uptime"),
};

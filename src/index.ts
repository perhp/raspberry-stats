import { spawn } from "child_process";

/**
 * Memory usage structure
 */
export interface MemoryUsageResult {
  total: number;
  used: number;
  free: number;
  shared: number;
  buffCache: number;
  available: number;
}

/**
 * Disk usage structure
 */
export interface DiskUsageResult {
  filesystem: string;
  oneKBlocks: number;
  used: number;
  available: number;
  usePercentage: number;
  mountedOn: string;
}

/**
 * Clock frequency structure
 */
export interface ClockFrequencyResult {
  clock: string;
  frequency: number | null;
}

/**
 * Retrieves the CPU temperature.
 * @param callback A function that receives the CPU temperature or null if an error occurred.
 */
export function getCPUTemperature(
  callback: (temp: number | null) => void,
): void {
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

/**
 * Retrieves the memory usage.
 * @param callback A function that receives the memory usage results or null if an error occurred.
 */
export function getMemoryUsage(
  callback: (usage: MemoryUsageResult | null) => void,
): void {
  const cmd = spawn("free");

  cmd.stdout.once("data", (data) => {
    const lines = data.toString("utf8").split("\n");
    // The second line typically has the memory usage
    const memLine = lines[1];
    if (!memLine) {
      callback(null);
      return;
    }

    const usages = memLine.replace(/( +)/g, " ").split(" ");
    const [total, used, free, shared, buffCache, available] = usages
      .splice(1)
      .map((usage: string) => parseFloat(usage));

    callback({ total, used, free, shared, buffCache, available });
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

/**
 * Retrieves the disk usage.
 * @param callback A function that receives an array of disk usage results or null if an error occurred.
 */
export function getDiskUsage(
  callback: (usage: DiskUsageResult[] | null) => void,
): void {
  const cmd = spawn("df");

  cmd.stdout.once("data", (data) => {
    const lines = data.toString("utf8").split("\n").filter(Boolean);
    // The first line is headers, so skip it
    const usageLines = lines.splice(1);

    const results = usageLines.map((usageText: string) => {
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

    callback(results);
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

/**
 * Retrieves the voltage.
 * @param callback A function that receives the voltage or null if an error occurred.
 */
export function getVoltage(callback: (voltage: number | null) => void): void {
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

/**
 * Retrieves all clock frequencies.
 * @param callback A function that receives an array of clock-frequency objects or null if an error occurred.
 */
export function getClockFrequencies(
  callback: (clocks: ClockFrequencyResult[] | null) => void,
): void {
  const clockNames = [
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

  let results: ClockFrequencyResult[] = [];
  let pending = clockNames.length;

  for (const clock of clockNames) {
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

/**
 * Retrieves a specific clock frequency.
 * @param clock Name of the clock to measure.
 * @param callback A function that receives the clock frequency or null if an error occurred.
 */
export function getClockFrequency(
  clock: string,
  callback: (frequency: number | null) => void,
): void {
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

/**
 * Retrieves the CPU usage by analyzing the "Cpu(s)" line from the `top` command.
 * @param callback A function that receives the CPU usage percentage or null if an error occurred.
 */
export function getCPUUsage(callback: (usage: number | null) => void): void {
  const cmd = spawn("bash", [
    "-c",
    `top -bn10 -d 0.1 | grep "Cpu(s)" | awk '{ print 100 - $8 }'`,
  ]);

  cmd.stdout.once("data", (data) => {
    const lines = data.toString("utf8").split("\n").filter(Boolean);
    if (!lines.length) {
      callback(null);
      return;
    }

    const usage = lines.reduce(
      (acc: number, line: string, index: number, original: string[]) => {
        const val = parseFloat(line);
        if (index === original.length - 1) {
          return (acc + val) / original.length;
        }
        return acc + val;
      },
      0,
    );

    callback(usage);
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

/**
 * Retrieves the system uptime in milliseconds.
 * @param callback A function that receives the uptime in milliseconds or null if an error occurred.
 */
export function getUptime(callback: (uptime: number | null) => void): void {
  // The `awk` command will multiply the first field by 1000 (making it ms).
  const cmd = spawn("awk", ["{print $1*1000}", "/proc/uptime"]);

  cmd.stdout.once("data", (data) => {
    callback(parseInt(data.toString("utf8"), 10));
  });

  cmd.stderr.once("data", () => {
    callback(null);
  });
}

function asynchronize<T>(
  candidate: (...args: any[]) => void,
  errorMessage: string,
): (...args: any[]) => Promise<T> {
  return (...args: any[]) =>
    new Promise<T>((resolve, reject) => {
      candidate(...args, (value: T | null) => {
        if (value === null) {
          return reject(new Error(errorMessage));
        }
        resolve(value);
      });
    });
}

// Export asynchronous versions
export const getCPUTemperatureAsync = asynchronize<number>(
  getCPUTemperature,
  "Failed to read CPU temperature",
);

export const getMemoryUsageAsync = asynchronize<MemoryUsageResult>(
  getMemoryUsage,
  "Failed to read memory usage",
);

export const getDiskUsageAsync = asynchronize<DiskUsageResult[]>(
  getDiskUsage,
  "Failed to read disk usage",
);

export const getVoltageAsync = asynchronize<number>(
  getVoltage,
  "Failed to read voltage",
);

export const getClockFrequenciesAsync = asynchronize<ClockFrequencyResult[]>(
  getClockFrequencies,
  "Failed to read clock frequencies",
);

export const getClockFrequencyAsync = asynchronize<number>(
  getClockFrequency,
  "Failed to read clock frequency",
);

export const getCPUUsageAsync = asynchronize<number>(
  getCPUUsage,
  "Failed to read CPU usage",
);

export const getUptimeAsync = asynchronize<number>(
  getUptime,
  "Failed to read uptime",
);

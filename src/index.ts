import { spawn } from "child_process";

/**
 * Generic return type for all system queries
 */
export interface SystemInfo<T> {
  error: string | null;
  data: T | null;
}

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
 * Available clocks
 */
export enum Clock {
  ARM = "arm",
  CORE = "core",
  H264 = "h264",
  ISP = "isp",
  V3D = "v3d",
  UART = "uart",
  PWM = "pwm",
  EMMC = "emmc",
  PIXEL = "pixel",
  VEC = "vec",
  HDMI = "hdmi",
  DPI = "dpi",
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
 * @param callback A function that receives { data, error }, where `data` is the CPU temperature or null.
 */
export function getCPUTemperature(
  callback: (response: SystemInfo<number>) => void,
): void {
  const regex = /temp=([^'C]+)/;
  const cmd = spawn("/usr/bin/vcgencmd", ["measure_temp"]);

  cmd.stdout.once("data", (data) => {
    const match = data.toString("utf8").match(regex);
    callback({
      data: match ? parseFloat(match[1]) : null,
      error: match ? null : "Failed to parse CPU temperature",
    });
  });

  cmd.stderr.once("data", () => {
    callback({
      data: null,
      error: "Failed to read CPU temperature",
    });
  });
}

/**
 * Retrieves the memory usage.
 * @param callback A function that receives { data, error }, where `data` is the MemoryUsageResult or null.
 */
export function getMemoryUsage(
  callback: (response: SystemInfo<MemoryUsageResult>) => void,
): void {
  const cmd = spawn("free");

  cmd.stdout.once("data", (data) => {
    const lines = data.toString("utf8").split("\n");
    // The second line typically has the memory usage
    const memLine = lines[1];
    if (!memLine) {
      callback({
        data: null,
        error: "Unable to parse memory usage",
      });
      return;
    }

    const usages = memLine.replace(/( +)/g, " ").split(" ");
    const [total, used, free, shared, buffCache, available] = usages
      .splice(1)
      .map((usage: string) => parseFloat(usage));

    callback({
      data: {
        total,
        used,
        free,
        shared,
        buffCache,
        available,
      },
      error: null,
    });
  });

  cmd.stderr.once("data", () => {
    callback({
      data: null,
      error: "Failed to read memory usage",
    });
  });
}

/**
 * Retrieves the disk usage.
 * @param callback A function that receives { data, error }, where `data` is an array of DiskUsageResult or null.
 */
export function getDiskUsage(
  callback: (response: SystemInfo<DiskUsageResult[]>) => void,
): void {
  const cmd = spawn("df");

  cmd.stdout.once("data", (data) => {
    const lines = data.toString("utf8").split("\n").filter(Boolean);
    // The first line is headers, so skip it
    const usageLines = lines.splice(1);

    if (!usageLines.length) {
      callback({
        data: null,
        error: "No disk usage data found",
      });
      return;
    }

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

    callback({
      data: results,
      error: null,
    });
  });

  cmd.stderr.once("data", () => {
    callback({
      data: null,
      error: "Failed to read disk usage",
    });
  });
}

/**
 * Retrieves the voltage.
 * @param callback A function that receives { data, error }, where `data` is the voltage or null.
 */
export function getVoltage(
  callback: (response: SystemInfo<number>) => void,
): void {
  const regex = /volt=([^V]+)/;
  const cmd = spawn("/usr/bin/vcgencmd", ["measure_volts"]);

  cmd.stdout.once("data", (data) => {
    const match = data.toString("utf8").match(regex);
    callback({
      data: match ? parseFloat(match[1]) : null,
      error: match ? null : "Failed to parse voltage",
    });
  });

  cmd.stderr.once("data", () => {
    callback({
      data: null,
      error: "Failed to read voltage",
    });
  });
}

/**
 * Retrieves all clock frequencies.
 * @param callback A function that receives { data, error }, where `data` is an array of ClockFrequencyResult or null.
 */
export function getClockFrequencies(
  callback: (response: SystemInfo<ClockFrequencyResult[]>) => void,
): void {
  const clockNames: Clock[] = [
    Clock.ARM,
    Clock.CORE,
    Clock.H264,
    Clock.ISP,
    Clock.V3D,
    Clock.UART,
    Clock.PWM,
    Clock.EMMC,
    Clock.PIXEL,
    Clock.VEC,
    Clock.HDMI,
    Clock.DPI,
  ];

  const results: ClockFrequencyResult[] = [];
  let pending = clockNames.length;

  if (!pending) {
    callback({
      data: null,
      error: "No clock names provided",
    });
    return;
  }

  for (const clock of clockNames) {
    const cmd = spawn("/usr/bin/vcgencmd", ["measure_clock", clock]);

    cmd.stdout.once("data", (data) => {
      const match = data.toString("utf8").match(/frequency\(\d+\)=(\d+)/);
      const frequency = match ? parseInt(match[1]) : null;
      results.push({ clock, frequency });
    });

    cmd.stderr.once("data", () => {
      results.push({ clock, frequency: null });
    });

    cmd.on("close", () => {
      pending--;
      if (pending === 0) {
        callback({
          data: results,
          error: null,
        });
      }
    });
  }
}

/**
 * Retrieves a specific clock frequency.
 * @param clock Name of the clock to measure.
 * @param callback A function that receives { data, error }, where `data` is the clock frequency or null.
 */
export function getClockFrequency(
  clock: Clock,
  callback: (response: SystemInfo<number>) => void,
): void {
  const cmd = spawn("/usr/bin/vcgencmd", ["measure_clock", clock]);

  cmd.stdout.once("data", (data) => {
    const match = data.toString("utf8").match(/frequency\(\d+\)=(\d+)/);
    const frequency = match ? parseInt(match[1]) : null;
    callback({
      data: frequency,
      error: match ? null : `Failed to parse clock frequency for ${clock}`,
    });
  });

  cmd.stderr.once("data", () => {
    callback({
      data: null,
      error: `Failed to read clock frequency for ${clock}`,
    });
  });
}

/**
 * Retrieves the CPU usage by analyzing the "Cpu(s)" line from the `top` command.
 * @param callback A function that receives { data, error }, where `data` is the CPU usage percentage or null.
 */
export function getCPUUsage(
  callback: (response: SystemInfo<number>) => void,
): void {
  const cmd = spawn("bash", [
    "-c",
    `top -bn10 -d 0.1 | grep "Cpu(s)" | awk '{ print 100 - $8 }'`,
  ]);

  cmd.stdout.once("data", (data) => {
    const lines = data.toString("utf8").split("\n").filter(Boolean);
    if (!lines.length) {
      callback({
        data: null,
        error: "No CPU usage data retrieved",
      });
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

    callback({
      data: usage,
      error: null,
    });
  });

  cmd.stderr.once("data", () => {
    callback({
      data: null,
      error: "Failed to read CPU usage",
    });
  });
}

/**
 * Retrieves the system uptime in milliseconds.
 * @param callback A function that receives { data, error }, where `data` is the uptime in milliseconds or null.
 */
export function getUptime(
  callback: (response: SystemInfo<number>) => void,
): void {
  // The `awk` command will multiply the first field by 1000 (making it ms).
  const cmd = spawn("awk", ["{print $1*1000}", "/proc/uptime"]);

  cmd.stdout.once("data", (data) => {
    const uptime = parseInt(data.toString("utf8"), 10);
    callback({
      data: isNaN(uptime) ? null : uptime,
      error: isNaN(uptime) ? "Failed to parse uptime" : null,
    });
  });

  cmd.stderr.once("data", () => {
    callback({
      data: null,
      error: "Failed to read uptime",
    });
  });
}

/**
 * Helper to convert a callback-based function into a Promise-based one,
 * returning a Promise<SystemInfo<T>>.
 */
function asynchronize<T>(
  func: (...args: any[]) => void,
): (...args: any[]) => Promise<SystemInfo<T>> {
  return (...args: any[]) =>
    new Promise<SystemInfo<T>>((resolve) => {
      // The last argument in our original calls is the callback
      func(...args, (response: SystemInfo<T>) => {
        resolve(response);
      });
    });
}

// Export asynchronous versions
export const getCPUTemperatureAsync = asynchronize<number>(getCPUTemperature);
export const getMemoryUsageAsync =
  asynchronize<MemoryUsageResult>(getMemoryUsage);
export const getDiskUsageAsync = asynchronize<DiskUsageResult[]>(getDiskUsage);
export const getVoltageAsync = asynchronize<number>(getVoltage);
export const getClockFrequenciesAsync =
  asynchronize<ClockFrequencyResult[]>(getClockFrequencies);
export const getClockFrequencyAsync = asynchronize<number>(getClockFrequency);
export const getCPUUsageAsync = asynchronize<number>(getCPUUsage);
export const getUptimeAsync = asynchronize<number>(getUptime);

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
 * Utility to make sure a callback fires **once** no matter how many events occur
 */
function once<T>(
  callback: (response: SystemInfo<T>) => void,
): (data: T | null, error: string | null) => void {
  let fired = false;
  return (data, error) => {
    if (fired) {
      return;
    }
    fired = true;
    callback({ data, error });
  };
}

/**
 * Retrieves the CPU temperature.
 * @param callback A function that receives { data, error }, where `data` is the CPU temperature or null.
 */
export function getCPUTemperature(
  callback: (response: SystemInfo<number>) => void,
): void {
  try {
    const regex = /temp=([^'C]+)/;
    const cmd = spawn("/usr/bin/vcgencmd", ["measure_temp"]);
    const finish = once<number>(callback);

    cmd.stdout.once("data", (data) => {
      const match = data.toString("utf8").match(regex);
      finish(
        match ? parseFloat(match[1]) : null,
        match ? null : "Failed to parse CPU temperature",
      );
    });

    cmd.stderr.once("data", () =>
      finish(null, "Failed to read CPU temperature"),
    );

    cmd.once("error", (err: NodeJS.ErrnoException) =>
      finish(
        null,
        err.code === "ENOENT" ? "vcgencmd executable not found" : err.message,
      ),
    );
  } catch (e) {
    callback({ data: null, error: "Failed to read CPU temperature" });
  }
}

/**
 * Retrieves the memory usage.
 * @param callback A function that receives { data, error }, where `data` is the MemoryUsageResult or null.
 */
export function getMemoryUsage(
  callback: (response: SystemInfo<MemoryUsageResult>) => void,
): void {
  try {
    const cmd = spawn("free");
    const finish = once<MemoryUsageResult>(callback);

    cmd.stdout.once("data", (data) => {
      const lines = data.toString("utf8").split("\n");
      const memLine = lines[1];
      if (!memLine) {
        finish(null, "Unable to parse memory usage");
        return;
      }

      const usages = memLine.replace(/( +)/g, " ").split(" ");
      const [total, used, free, shared, buffCache, available] = usages
        .splice(1)
        .map((usage: string) => parseFloat(usage));

      finish({ total, used, free, shared, buffCache, available }, null);
    });

    cmd.stderr.once("data", () => finish(null, "Failed to read memory usage"));

    cmd.once("error", (err) => finish(null, err.message));
  } catch (e) {
    callback({ data: null, error: "Failed to read memory usage" });
  }
}

/**
 * Retrieves the disk usage.
 * @param callback A function that receives { data, error }, where `data` is an array of DiskUsageResult or null.
 */
export function getDiskUsage(
  callback: (response: SystemInfo<DiskUsageResult[]>) => void,
): void {
  try {
    const cmd = spawn("df");
    const finish = once<DiskUsageResult[]>(callback);

    cmd.stdout.once("data", (data) => {
      const lines = data.toString("utf8").split("\n").filter(Boolean);
      const usageLines = lines.splice(1);

      if (!usageLines.length) {
        finish(null, "No disk usage data found");
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

      finish(results, null);
    });

    cmd.stderr.once("data", () => finish(null, "Failed to read disk usage"));

    cmd.once("error", (err) => finish(null, err.message));
  } catch (e) {
    callback({ data: null, error: "Failed to read disk usage" });
  }
}

/**
 * Retrieves the voltage.
 * @param callback A function that receives { data, error }, where `data` is the voltage or null.
 */
export function getVoltage(
  callback: (response: SystemInfo<number>) => void,
): void {
  try {
    const regex = /volt=([^V]+)/;
    const cmd = spawn("/usr/bin/vcgencmd", ["measure_volts"]);
    const finish = once<number>(callback);

    cmd.stdout.once("data", (data) => {
      const match = data.toString("utf8").match(regex);
      finish(
        match ? parseFloat(match[1]) : null,
        match ? null : "Failed to parse voltage",
      );
    });

    cmd.stderr.once("data", () => finish(null, "Failed to read voltage"));

    cmd.once("error", (err: NodeJS.ErrnoException) =>
      finish(
        null,
        err.code === "ENOENT" ? "vcgencmd executable not found" : err.message,
      ),
    );
  } catch (e) {
    callback({ data: null, error: "Failed to read voltage" });
  }
}

/**
 * Retrieves all clock frequencies.
 * @param callback A function that receives { data, error }, where `data` is an array of ClockFrequencyResult or null.
 */
export function getClockFrequencies(
  callback: (response: SystemInfo<ClockFrequencyResult[]>) => void,
): void {
  try {
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
      callback({ data: null, error: "No clock names provided" });
      return;
    }

    const tryFinish = () => {
      if (--pending === 0) {
        callback({ data: results, error: null });
      }
    };

    for (const clock of clockNames) {
      const cmd = spawn("/usr/bin/vcgencmd", ["measure_clock", clock]);
      let handled = false;

      const record = (frequency: number | null) => {
        if (handled) return;
        handled = true;
        results.push({ clock, frequency });
        tryFinish();
      };

      cmd.stdout.once("data", (data) => {
        const match = data.toString("utf8").match(/frequency\(\d+\)=(\d+)/);
        record(match ? parseInt(match[1]) : null);
      });

      cmd.stderr.once("data", () => record(null));

      cmd.once("error", () => record(null));
    }
  } catch (e) {
    callback({ data: null, error: "Failed to read clock frequencies" });
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
  try {
    const cmd = spawn("/usr/bin/vcgencmd", ["measure_clock", clock]);
    const finish = once<number>(callback);

    cmd.stdout.once("data", (data) => {
      const match = data.toString("utf8").match(/frequency\(\d+\)=(\d+)/);
      finish(
        match ? parseInt(match[1]) : null,
        match ? null : `Failed to parse clock frequency for ${clock}`,
      );
    });

    cmd.stderr.once("data", () =>
      finish(null, `Failed to read clock frequency for ${clock}`),
    );

    cmd.once("error", (err: NodeJS.ErrnoException) =>
      finish(
        null,
        err.code === "ENOENT" ? "vcgencmd executable not found" : err.message,
      ),
    );
  } catch (e) {
    callback({ data: null, error: "Failed to read clock frequency" });
  }
}

/**
 * Retrieves the CPU usage by analyzing the "Cpu(s)" line from the `top` command.
 * @param callback A function that receives { data, error }, where `data` is the CPU usage percentage or null.
 */
export function getCPUUsage(
  callback: (response: SystemInfo<number>) => void,
): void {
  try {
    const cmd = spawn("bash", [
      "-c",
      `top -bn10 -d 0.1 | grep "Cpu(s)" | awk '{ print 100 - $8 }'`,
    ]);
    const finish = once<number>(callback);

    cmd.stdout.once("data", (data) => {
      const lines = data.toString("utf8").split("\n").filter(Boolean);
      if (!lines.length) {
        finish(null, "No CPU usage data retrieved");
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

      finish(usage, null);
    });

    cmd.stderr.once("data", () => finish(null, "Failed to read CPU usage"));

    cmd.once("error", (err) => finish(null, err.message));
  } catch (e) {
    callback({ data: null, error: "Failed to read CPU usage" });
  }
}

/**
 * Retrieves the system uptime in milliseconds.
 * @param callback A function that receives { data, error }, where `data` is the uptime in milliseconds or null.
 */
export function getUptime(
  callback: (response: SystemInfo<number>) => void,
): void {
  try {
    const cmd = spawn("awk", ["{print $1*1000}", "/proc/uptime"]);
    const finish = once<number>(callback);

    cmd.stdout.once("data", (data) => {
      const uptime = parseInt(data.toString("utf8"), 10);
      finish(
        isNaN(uptime) ? null : uptime,
        isNaN(uptime) ? "Failed to parse uptime" : null,
      );
    });

    cmd.stderr.once("data", () => finish(null, "Failed to read uptime"));

    cmd.once("error", (err) => finish(null, err.message));
  } catch (e) {
    callback({ data: null, error: "Failed to read uptime" });
  }
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
      func(...args, (response: SystemInfo<T>) => resolve(response));
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

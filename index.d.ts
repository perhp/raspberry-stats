export interface MemoryUsage {
  /** Total memory */
  total: number;
  /** Used memory */
  used: number;
  /** Free memory */
  free: number;
  /** Shared memory */
  shared: number;
  /** Buffers + cache */
  buffCache: number;
  /** Available memory */
  available: number;
}

export interface DiskUsage {
  /** Filesystem path or identifier */
  filesystem: string;
  /** Size in 1K blocks */
  oneKBlocks: number;
  /** Used space */
  used: number;
  /** Available space */
  available: number;
  /** Usage percentage (0 - 100) */
  usePercentage: number;
  /** Mount point */
  mountedOn: string;
}

export interface ClockFrequency {
  /** Name of the clock (arm, core, h264, etc.) */
  clock: string;
  /** Frequency */
  frequency: number;
}

/**
 * Reads the CPU temperature by running `vcgencmd measure_temp`.
 * @param callback Callback with temperature in °C, or `null` on error.
 */
export function getCPUTemperature(
  callback: (temperature: number | null) => void,
): void;

/**
 * Asynchronous version of `getCPUTemperature`.
 * @returns A Promise that resolves with the CPU temperature in °C, or rejects on error.
 */
export function getCPUTemperatureAsync(): Promise<number>;

/**
 * Reads memory usage via the `free` command.
 * @param callback Callback with a `MemoryUsage` object, or `null` on error.
 */
export function getMemoryUsage(
  callback: (usage: MemoryUsage | null) => void,
): void;

/**
 * Asynchronous version of `getMemoryUsage`.
 * @returns A Promise that resolves with a `MemoryUsage` object, or rejects on error.
 */
export function getMemoryUsageAsync(): Promise<MemoryUsage>;

/**
 * Reads disk usage info via the `df` command.
 * @param callback Callback with an array of `DiskUsage` objects, or `null` on error.
 */
export function getDiskUsage(
  callback: (usages: DiskUsage[] | null) => void,
): void;

/**
 * Asynchronous version of `getDiskUsage`.
 * @returns A Promise that resolves with an array of `DiskUsage` objects, or rejects on error.
 */
export function getDiskUsageAsync(): Promise<DiskUsage[]>;

/**
 * Reads the core voltage by running `vcgencmd measure_volts`.
 * @param callback Callback with voltage in Volts, or `null` on error.
 */
export function getVoltage(callback: (voltage: number | null) => void): void;

/**
 * Asynchronous version of `getVoltage`.
 * @returns A Promise that resolves with the voltage in Volts, or rejects on error.
 */
export function getVoltageAsync(): Promise<number>;

/**
 * Reads multiple clock frequencies (arm, core, h264, etc.) by running `vcgencmd measure_clock`.
 * @param callback Callback with an array of `ClockFrequency` objects, or `null` on error.
 */
export function getClockFrequencies(
  callback: (frequencies: ClockFrequency[] | null) => void,
): void;

/**
 * Asynchronous version of `getClockFrequencies`.
 * @returns A Promise that resolves with an array of `ClockFrequency` objects, or rejects on error.
 */
export function getClockFrequenciesAsync(): Promise<ClockFrequency[]>;

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
 * Reads the specified clock frequency by running `vcgencmd measure_clock`.
 * @param callback Callback with the frequency, or `null` on error.
 */
export function getClockFrequency(
  clock: Clock,
  callback: (frequency: number | null) => void,
): void;

/**
 * Asynchronous version of `getClockFrequency`
 * @returns A Promise that resolves with the frequency, or rejects on error.
 */
export function getClockFrequencyAsync(clock: Clock): Promise<number | null>;

/**
 * Reads CPU usage by running `top`.
 * @param callback Callback with the CPU usage in %, or `null` on error.
 */
export function getCPUUsage(callback: (usage: number | null) => void): void;

/**
 * Asynchronous version of `getCPUUsage`.
 * @returns A Promise that resolves with the CPU usage in %, or rejects on error.
 */
export function getCPUUsageAsync(): Promise<number>;

/**
 * Reads uptime by running `awk '{print $1 * 1000}' /proc/uptime`.
 * @param callback Callback with the uptime in milliseconds, or `null` on error.
 */
export function getUptime(callback: (uptime: number | null) => void): void;

/**
 * Asynchronous version of `getUptime`.
 * @returns A Promise that resolves with the uptime in milliseconds, or rejects on error.
 */
export function getUptimeAsync(): Promise<number>;

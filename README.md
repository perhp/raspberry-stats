# Raspberry Stats

A Node.js module for retrieving system information from a Raspberry Pi.  
It uses the `child_process.spawn` command to read various parameters, including CPU temperature, memory usage, disk usage, voltage, and clock frequencies.  
Synchronous (callback-based) and asynchronous (promise-based) APIs are provided for each method.

> **Note:** This module relies on `vcgencmd` and other system commands that are typically available on Raspberry Pi OS. It may not work on other platforms or distributions where these commands are unavailable.

---

## Table of Contents

- [Raspberry Stats](#raspberry-stats)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [Return Format Overview](#return-format-overview)
    - [getCPUTemperature / getCPUTemperatureAsync](#getcputemperature--getcputemperatureasync)
    - [getCPUUsage / getCPUUsageAsync](#getcpuusage--getcpuusageasync)
    - [getMemoryUsage / getMemoryUsageAsync](#getmemoryusage--getmemoryusageasync)
    - [getDiskUsage / getDiskUsageAsync](#getdiskusage--getdiskusageasync)
    - [getVoltage / getVoltageAsync](#getvoltage--getvoltageasync)
    - [getClockFrequencies / getClockFrequenciesAsync](#getclockfrequencies--getclockfrequenciesasync)
    - [getClockFrequency / getClockFrequencyAsync](#getclockfrequency--getclockfrequencyasync)
    - [getUptime / getUptimeAsync](#getuptime--getuptimeasync)
  - [Error Handling](#error-handling)
  - [License](#license)

---

## Installation

With [npm](https://www.npmjs.com/):

    npm install raspberry-stats

With [yarn](https://yarnpkg.com/):

    yarn add raspberry-stats

With [pnpm](https://pnpm.io/):

    pnpm add raspberry-stats

With [bun](https://bun.sh/):

    bun add raspberry-stats

---

## Usage

Example using both callback-based and async/await methods:

    import {
      getCPUTemperature,
      getCPUTemperatureAsync,
      getMemoryUsage,
      getMemoryUsageAsync,
      // ... other imports
    } from "raspberry-stats";

    // --- Using callback-based methods ---
    // Each callback now receives a SystemInfo<T> object containing { data, error }

    // Example 1: CPU Temperature
    getCPUTemperature((info) => {
      if (info.error) {
        console.error("Failed to retrieve CPU temperature:", info.error);
      } else {
        console.log(`CPU Temperature: ${info.data}°C`);
      }
    });

    // Example 2: Memory Usage
    getMemoryUsage((info) => {
      if (info.error) {
        console.error("Failed to retrieve memory usage:", info.error);
      } else {
        console.log("Memory usage:", info.data);
      }
    });

    // --- Using promise-based methods (Async/Await) ---
    // Each async function returns a Promise<SystemInfo<T>>

    (async () => {
      try {
        // Example 1: CPU Temperature
        const tempInfo = await getCPUTemperatureAsync();
        if (tempInfo.error) {
          console.error("Failed to retrieve CPU temperature:", tempInfo.error);
        } else {
          console.log(`CPU Temperature: ${tempInfo.data}°C`);
        }

        // Example 2: Memory Usage
        const memInfo = await getMemoryUsageAsync();
        if (memInfo.error) {
          console.error("Failed to retrieve memory usage:", memInfo.error);
        } else {
          console.log("Memory usage:", memInfo.data);
        }
      } catch (error) {
        console.error(error);
      }
    })();

---

## API

### Return Format Overview

All callback-based functions now receive a single parameter of type `SystemInfo<T>`:

    interface SystemInfo<T> {
      data: T | null;
      error: string | null;
    }

- `data` contains the successfully retrieved value (e.g. `number`, `object`, or `array`) if everything went well, otherwise `null`.
- `error` is a string describing the problem if something failed, otherwise `null`.

Similarly, all promise-based functions resolve with `SystemInfo<T>` instead of just the raw data or throwing an error.  
Hence, if `error` is non-null, you can handle it accordingly in your async flow.

---

### getCPUTemperature / getCPUTemperatureAsync

**Signature (Callback):**

    getCPUTemperature(callback: (info: SystemInfo<number>) => void): void;

- **description**  
  Reads the CPU temperature by running `vcgencmd measure_temp`.
- **callback**  
  Receives an object of type `SystemInfo<number>`.
  - `info.data` is the temperature (in °C) if successful, otherwise `null`.
  - `info.error` contains an error message if something went wrong, otherwise `null`.

**Signature (Async):**

    getCPUTemperatureAsync(): Promise<SystemInfo<number>>;

- **description**  
  Asynchronous/promise-based version of the above function.  
  Resolves with `SystemInfo<number>`—check `info.error` to see if it succeeded.

---

### getCPUUsage / getCPUUsageAsync

**Signature (Callback):**

    getCPUUsage(callback: (info: SystemInfo<number>) => void): void;

- **description**  
  Runs `top` repeatedly (e.g., 10 iterations at 0.1-second intervals) and gathers the CPU usage values.  
  It parses the CPU usage, calculates an average from the samples, and then invokes the callback with the final usage percentage (e.g., 17.2 for ~17.2% usage).
- **callback**  
  Receives an object of type `SystemInfo<number>`.
  - `info.data` is the CPU usage or `null` if it fails.
  - `info.error` is an error message if it fails.

**Signature (Async):**

    getCPUUsageAsync(): Promise<SystemInfo<number>>;

- **description**  
  Promise-based version.  
  Resolves with `SystemInfo<number>`—check `info.error` to see if it succeeded.

---

### getMemoryUsage / getMemoryUsageAsync

**Signature (Callback):**

    getMemoryUsage(callback: (info: SystemInfo<MemoryUsageResult>) => void): void;

Where `MemoryUsageResult` is:

    interface MemoryUsageResult {
      total: number;
      used: number;
      free: number;
      shared: number;
      buffCache: number;
      available: number;
    }

- **description**  
  Reads memory usage via the `free` command.
- **callback**  
  Receives an object of type `SystemInfo<MemoryUsageResult>`.
  - `info.data` is a `MemoryUsageResult` object if successful, otherwise `null`.
  - `info.error` is an error message if something went wrong, otherwise `null`.

**Signature (Async):**

    getMemoryUsageAsync(): Promise<SystemInfo<MemoryUsageResult>>;

- **description**  
  Promise-based version.  
  Resolves with `SystemInfo<MemoryUsageResult>`—check `info.error` to see if it succeeded.

---

### getDiskUsage / getDiskUsageAsync

**Signature (Callback):**

    getDiskUsage(callback: (info: SystemInfo<DiskUsageResult[]>) => void): void;

Where `DiskUsageResult` is:

    interface DiskUsageResult {
      filesystem: string;
      oneKBlocks: number;
      used: number;
      available: number;
      usePercentage: number;
      mountedOn: string;
    }

- **description**  
  Reads disk usage info via the `df` command.
- **callback**  
  Receives an object of type `SystemInfo<DiskUsageResult[]>`.
  - `info.data` is an array of disk usage objects if successful, otherwise `null`.
  - `info.error` is an error message if it fails.

**Signature (Async):**

    getDiskUsageAsync(): Promise<SystemInfo<DiskUsageResult[]>>;

- **description**  
  Promise-based version.  
  Resolves with `SystemInfo<DiskUsageResult[]>`—check `info.error` on result.

---

### getVoltage / getVoltageAsync

**Signature (Callback):**

    getVoltage(callback: (info: SystemInfo<number>) => void): void;

- **description**  
  Reads the core voltage by running `vcgencmd measure_volts`.
- **callback**  
  Receives an object of type `SystemInfo<number>`.
  - `info.data` is the voltage (in Volts) if successful, otherwise `null`.
  - `info.error` is an error message if it fails.

**Signature (Async):**

    getVoltageAsync(): Promise<SystemInfo<number>>;

- **description**  
  Promise-based version.  
  Resolves with `SystemInfo<number>`—check `info.error` to see if it succeeded.

---

### getClockFrequencies / getClockFrequenciesAsync

**Signature (Callback):**

    getClockFrequencies(
      callback: (info: SystemInfo<ClockFrequencyResult[]>) => void
    ): void;

Where `ClockFrequencyResult` is:

    interface ClockFrequencyResult {
      clock: string;
      frequency: number | null; // in Hz
    }

- **description**  
  Reads multiple clock frequencies (arm, core, h264, etc.) by running `vcgencmd measure_clock`.
- **callback**  
  Receives an object of type `SystemInfo<ClockFrequencyResult[]>`.
  - `info.data` is an array of clock/frequency objects if successful, otherwise `null`.
  - `info.error` is an error message if it fails.

**Signature (Async):**

    getClockFrequenciesAsync(): Promise<SystemInfo<ClockFrequencyResult[]>>;

- **description**  
  Promise-based version.  
  Resolves with `SystemInfo<ClockFrequencyResult[]>`—check `info.error` on result.

---

### getClockFrequency / getClockFrequencyAsync

**Signature (Callback):**

    getClockFrequency(
      clock: Clock,
      callback: (info: SystemInfo<number>) => void
    ): void;

Where `Clock` is an enum:

    enum Clock {
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

- **description**  
  Reads the specified clock frequency by running `vcgencmd measure_clock`.
- **callback**  
  Receives an object of type `SystemInfo<number>`.
  - `info.data` is the frequency (in Hz) if successful, otherwise `null`.
  - `info.error` is an error message if it fails.

**Signature (Async):**

    getClockFrequencyAsync(clock: Clock): Promise<SystemInfo<number>>;

- **description**  
  Promise-based version.  
  Resolves with `SystemInfo<number>`—check `info.error` on result.

---

### getUptime / getUptimeAsync

**Signature (Callback):**

    getUptime(callback: (info: SystemInfo<number>) => void): void;

- **description**  
  Reads the system uptime by running `awk '{print $1 * 1000}' /proc/uptime`.
- **callback**  
  Receives an object of type `SystemInfo<number>`.
  - `info.data` is the uptime in milliseconds if successful, otherwise `null`.
  - `info.error` is an error message if something went wrong.

**Signature (Async):**

    getUptimeAsync(): Promise<SystemInfo<number>>;

- **description**  
  Promise-based version.  
  Resolves with `SystemInfo<number>`—check `info.error` on result.

> **Note:** The uptime is returned in milliseconds but is based on the system’s uptime in seconds.

---

## Error Handling

Because all the functions return a `SystemInfo<T>` object, **there is no more "rejecting" or passing `null`**—the callback or promise resolves with an object which may contain an error message:

- For **callback-based methods**, check `info.error`.  
  If `info.error` is not `null`, an error occurred; otherwise `info.data` contains the good value.
- For **async methods**, check the returned object’s `.error` property.  
  If `error` is non-empty, handle it accordingly; if not, `.data` contains the requested information.

Example:

    // Async example: getCPUTemperatureAsync
    (async () => {
      const info = await getCPUTemperatureAsync();
      if (info.error) {
        // something went wrong
        console.error("Failed to read CPU temperature:", info.error);
      } else {
        // success
        console.log(`CPU Temperature: ${info.data}°C`);
      }
    })();

---

## License

[ISC](https://opensource.org/licenses/ISC)

Feel free to open issues, PRs, or contribute in any way you see fit!

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
    - [getCPUTemperature / getCPUTemperatureAsync](#getcputemperature--getcputemperatureasync)
    - [getMemoryUsage / getMemoryUsageAsync](#getmemoryusage--getmemoryusageasync)
    - [getDiskUsage / getDiskUsageAsync](#getdiskusage--getdiskusageasync)
    - [getVoltage / getVoltageAsync](#getvoltage--getvoltageasync)
    - [getClockFrequencies / getClockFrequenciesAsync](#getclockfrequencies--getclockfrequenciesasync)
    - [getClockFrequency / getClockFrequencyAsync](#getclockfrequency--getclockfrequencyasync)
    - [getCPUUsage / getCPUUsageAsync](#getcpuusage--getcpuusageasync)
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

```js
const {
  getCPUTemperature,
  getCPUTemperatureAsync,
  getMemoryUsage,
  getMemoryUsageAsync,
} = require("raspberry-stats");

// --- Using callback-based methods ---

// Example 1: CPU Temperature
getCPUTemperature((temperature) => {
  if (temp !== null) {
    console.log(`CPU Temperature: ${temperature}°C`);
  } else {
    console.error("Failed to retrieve CPU temperature");
  }
});

// Example 2: Memory Usage
getMemoryUsage((memoryUsage) => {
  if (memoryUsage !== null) {
    console.log("Memory usage:", memoryUsage);
  } else {
    console.error("Failed to retrieve memory usage");
  }
});

// --- Using promise-based methods (Async/Await) ---

(async () => {
  try {
    // Example 1: CPU Temperature
    const temperature = await getCPUTemperatureAsync();
    console.log(`CPU Temperature: ${temperature}°C`);

    // Example 2: Memory Usage
    const memoryUsage = await getMemoryUsageAsync();
    console.log("Memory usage:", memoryUsage);
  } catch (error) {
    console.error(error.message);
  }
})();
```

---

## API

### getCPUTemperature / getCPUTemperatureAsync

**Signature (Callback):**  
`getCPUTemperature(callback: (temperature: number | null) => void): void;`

- **description**  
  Reads the CPU temperature by running `vcgencmd measure_temp`.
- **callback**  
  Called with the temperature (in °C) if successful, or `null` if an error occurred.

**Signature (Async):**  
`getCPUTemperatureAsync(): Promise<number>;`

- **description**  
  Asynchronous/promise-based version of the above function.  
  Resolves with the CPU temperature in °C, or rejects if an error occurred.

---

### getMemoryUsage / getMemoryUsageAsync

**Signature (Callback):**  
`getMemoryUsage(callback: (usage: MemoryUsage | null) => void): void;`

Where `MemoryUsage` is an object of the following shape:

```ts
interface MemoryUsage {
  total: number;
  used: number;
  free: number;
  shared: number;
  buffCache: number;
  available: number;
}
```

- **description**  
  Reads memory usage via the `free` command.
- **callback**  
  Called with a `MemoryUsage` object or `null` if an error occurred.

**Signature (Async):**  
`getMemoryUsageAsync(): Promise<MemoryUsage>;`

- **description**  
  Asynchronous/promise-based version of the above function.  
  Resolves with a `MemoryUsage` object, or rejects if an error occurred.

---

### getDiskUsage / getDiskUsageAsync

**Signature (Callback):**  
`getDiskUsage(callback: (usage: DiskUsage[] | null) => void): void;`

Where `DiskUsage` is an object of the following shape:

```ts
interface DiskUsage {
  filesystem: string;
  oneKBlocks: number;
  used: number;
  available: number;
  usePercentage: number;
  mountedOn: string;
}
```

- **description**  
  Reads disk usage info via the `df` command.
- **callback**  
  Called with an array of `DiskUsage` objects for each filesystem or `null` if an error occurred.

**Signature (Async):**  
`getDiskUsageAsync(): Promise<DiskUsage[]>;`

- **description**  
  Asynchronous/promise-based version of the above function.  
  Resolves with an array of `DiskUsage` objects, or rejects if an error occurred.

---

### getVoltage / getVoltageAsync

**Signature (Callback):**  
`getVoltage(callback: (voltage: number | null) => void): void;`

- **description**  
  Reads the core voltage by running `vcgencmd measure_volts`.
- **callback**  
  Called with the voltage (in Volts) or `null` if an error occurred.

**Signature (Async):**  
`getVoltageAsync(): Promise<number>;`

- **description**  
  Asynchronous/promise-based version of the above function.  
  Resolves with the voltage in Volts, or rejects if an error occurred.

---

### getClockFrequencies / getClockFrequenciesAsync

**Signature (Callback):**  
`getClockFrequencies(callback: (frequencies: ClockFrequency[] | null) => void): void;`

Where `ClockFrequency` is an object of the following shape:

```ts
interface ClockFrequency {
  clock: string;
  frequency: number; // in Hz
}
```

- **description**  
  Reads multiple clock frequencies (arm, core, h264, etc.) by running `vcgencmd measure_clock`.
- **callback**  
  Called with an array of clock/frequency objects or `null` if an error occurred.

**Signature (Async):**  
`getClockFrequenciesAsync(): Promise<ClockFrequency[]>;`

- **description**  
  Asynchronous/promise-based version of the above function.  
  Resolves with an array of clock/frequency objects, or rejects if an error occurred.

---

### getClockFrequency / getClockFrequencyAsync

**Signature (Callback):**  
`getClockFrequency(clock: Clock, callback: (frequency: number | null) => void): void;`

Where `Clock` is one of the following strings:

```ts
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
```

- **description**  
  Reads the specified clock frequency by running `vcgencmd measure_clock`.
- **callback**  
  Called with the frequency or `null` if an error occurred.

**Signature (Async):**  
`getClockFrequencyAsync(): Promise<number>;`

- **description**  
  Asynchronous/promise-based version of the above function.  
  Resolves with the frequency, or rejects if an error occurred.

---

### getCPUUsage / getCPUUsageAsync

**Signature (Callback):**  
`getCPUUsage(callback: (usage: number | null) => void): void;`

- **description**  
  Runs `top` repeatedly (in this example, 10 iterations at 0.1-second intervals) and gathers the CPU usage values. It uses `grep` and `awk` to parse the CPU usage, calculates an average from the collected samples, and then invokes the callback with the final usage percentage (e.g., 17.2 for ~17.2% usage). If an error occurs, it invokes the callback with `null`.
- **callback**  
  Called with the CPU usage or `null` if an error occurred.

**Signature (Async):**  
`getCPUUsageAsync(): Promise<number>;`

- **description**  
  Asynchronous/promise-based version of the above function.  
  Resolves with the CPU usage, or rejects if an error occurred.

---

## Error Handling

For the callback-based methods, if an error occurs, the callback is passed `null`.  
For the async/await methods, an `Error` is thrown with a descriptive message.

**Example**:

```js
try {
  const temp = await getCPUTemperatureAsync();
  console.log(`CPU Temperature: ${temp}°C`);
} catch (error) {
  console.error(error.message); // => "Failed to read CPU temperature"
}
```

---

## License

[ISC](https://opensource.org/licenses/ISC)

Feel free to open issues, PRs, or contribute in any way you see fit!

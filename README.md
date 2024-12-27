# Raspberry Pi System Info

A Node.js module for retrieving system information from a Raspberry Pi.  
It uses the `child_process.spawn` command to read various parameters, including CPU temperature, memory usage, disk usage, voltage, and clock frequencies.  
Synchronous (callback-based) and asynchronous (promise-based) APIs are provided for each method.

> **Note:** This module relies on `vcgencmd` and other system commands that are typically available on Raspberry Pi OS. It may not work on other platforms or distributions where these commands are unavailable.

---

## Table of Contents

- [Raspberry Pi System Info](#raspberry-pi-system-info)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [getCPUTemperature / getCPUTemperatureAsync](#getcputemperature--getcputemperatureasync)
    - [getMemoryUsage / getMemoryUsageAsync](#getmemoryusage--getmemoryusageasync)
    - [getDiskUsage / getDiskUsageAsync](#getdiskusage--getdiskusageasync)
    - [getVoltage / getVoltageAsync](#getvoltage--getvoltageasync)
    - [getClockFrequency / getClockFrequencyAsync](#getclockfrequency--getclockfrequencyasync)
  - [Error Handling](#error-handling)
  - [License](#license)

---

## Installation

Install via [npm](https://www.npmjs.com/):

    npm install raspberry-stats

---

## Usage

Example using both callback-based and async/await methods:

    const {
      getCPUTemperature,
      getCPUTemperatureAsync,
      getMemoryUsage,
      getMemoryUsageAsync,
      getDiskUsage,
      getDiskUsageAsync,
      getVoltage,
      getVoltageAsync,
      getClockFrequency,
      getClockFrequencyAsync
    } = require('your-package-name');

    // --- Using callback-based methods ---

    // Example 1: CPU Temperature
    getCPUTemperature((temp) => {
      if (temp !== null) {
        console.log(`CPU Temperature: ${temp}°C`);
      } else {
        console.error('Failed to retrieve CPU temperature');
      }
    });

    // Example 2: Memory Usage
    getMemoryUsage((usage) => {
      if (usage !== null) {
        console.log('Memory usage:', usage);
      } else {
        console.error('Failed to retrieve memory usage');
      }
    });

    // --- Using promise-based methods (Async/Await) ---

    (async () => {
      try {
        // Example 1: CPU Temperature
        const temp = await getCPUTemperatureAsync();
        console.log(`CPU Temperature: ${temp}°C`);

        // Example 2: Memory Usage
        const memUsage = await getMemoryUsageAsync();
        console.log('Memory usage:', memUsage);
      } catch (error) {
        console.error(error.message);
      }
    })();

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

    interface MemoryUsage {
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

    interface DiskUsage {
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

### getClockFrequency / getClockFrequencyAsync

**Signature (Callback):**  
`getClockFrequency(callback: (frequencies: ClockFrequency[] | null) => void): void;`

Where `ClockFrequency` is an object of the following shape:

    interface ClockFrequency {
      clock: string;
      frequency: number; // in Hz
    }

- **description**  
  Reads multiple clock frequencies (arm, core, h264, etc.) by running `vcgencmd measure_clock`.
- **callback**  
  Called with an array of clock/frequency objects or `null` if an error occurred.

**Signature (Async):**  
`getClockFrequencyAsync(): Promise<ClockFrequency[]>;`

- **description**  
  Asynchronous/promise-based version of the above function.  
  Resolves with an array of clock/frequency objects, or rejects if an error occurred.

---

## Error Handling

For the callback-based methods, if an error occurs, the callback is passed `null`.  
For the async/await methods, an `Error` is thrown with a descriptive message.

**Example**:

    try {
      const temp = await getCPUTemperatureAsync();
      console.log(`CPU Temperature: ${temp}°C`);
    } catch (error) {
      console.error(error.message); // => "Failed to read CPU temperature"
    }

---

## License

[MIT](https://opensource.org/licenses/MIT)

Feel free to open issues, PRs, or contribute in any way you see fit!

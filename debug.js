const stats = require("./index.js");

(async () => {
  // stats.getCPUTemperature(console.log);
  // const temp = await stats.getCPUTemperatureAsync();
  // console.log(temp);

  // stats.getMemoryUsage(console.log);
  // const memory = await stats.getMemoryUsageAsync();
  // console.log(memory);

  // stats.getDiskUsage(console.log);
  // const disk = await stats.getDiskUsageAsync();
  // console.log(disk);

  // stats.getVoltage(console.log);
  // const voltage = await stats.getVoltageAsync();
  // console.log(voltage);

  stats.getClockFrequency("arm", console.log);
  const clock = await stats.getClockFrequencyAsync("arm");
  console.log(clock);
})();

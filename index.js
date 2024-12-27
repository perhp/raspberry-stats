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

function getCPUTemperatureAsync() {
    return new Promise((resolve, reject) => {
        getCPUTemperature((temp) => {
            if (temp === null) {
                reject(new Error("Failed to read temperature"))
            }

            resolve(temp);
        });
    });
}

function getMemoryUsage(callback) {
    const cmd = spawn("free");

    cmd.stdout.once("data", (data) => {
        const usages = data.toString("utf8").split("\n")[1].replace(/( +)/g, " ").split(" ");
        const [total, used, free, shared, buffCache, available] = usages.splice(1).map(usage => parseFloat(usage))

        callback({ total, used, free, shared, buffCache, available });
    });
    
    cmd.stderr.once("data", () => {
        callback(null);
    });
}

function getMemoryUsageAsync() {
    return new Promise((resolve, reject) => {
        getMemoryUsage((usage) => {
            if (usage === null) {
                reject(new Error("Failed to read memory usage"))
            }

            resolve(usage);
        });
    });
}

module.exports = {
    getCPUTemperature,
    getCPUTemperatureAsync,
    getMemoryUsage,
    getMemoryUsageAsync,
}

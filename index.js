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

module.exports = {
    getCPUTemperature,
    getCPUTemperatureAsync,
}

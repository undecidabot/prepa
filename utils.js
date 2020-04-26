const fs = require("fs");
const path = require("path");

exports.walkDir = walkDir;
exports.humanSize = humanSize;
exports.humanDuration = humanDuration;
exports.urlPath = urlPath;

function* walkDir(directory) {
    for (let file of fs.readdirSync(directory, { withFileTypes: true })) {
        let filePath = path.join(directory, file.name);

        if (file.isFile()) {
            yield filePath;
        } else if (file.isDirectory()) {
            yield* walkDir(filePath);
        } else {
            throw new Error(`unexpected file "${filePath}"`);
        }
    }
}

function humanSize(bytes) {
    let size = bytes;
    let unit = null;

    for (let u of ["KiB", "MiB", "GiB"]) {
        if (size < 1024) {
            break;
        }

        size /= 1024;
        unit = u;
    }

    return unit == null ? `${size} byte(s)` : `${size.toFixed(2)} ${unit}`;
}

function humanDuration(nanoseconds) {
    let smallDuration = 0n;
    let smallUnit = "ms";
    let bigDuration = nanoseconds / 1_000_000n;
    let bigUnit = "ms";

    for (let [u, factor] of [["s", 1000n], ["m", 60n], ["h", 60n]]) {
        if (bigDuration < factor) {
            break;
        }

        smallDuration = bigDuration % factor;
        smallUnit = bigUnit;
        bigDuration = bigDuration / factor;
        bigUnit = u;
    }

    return `${bigDuration}${bigUnit}` + (smallUnit == "ms" ? "" : `${smallDuration}${smallUnit}`);
}

function urlPath(baseDir, p) {
    let result = path.relative(baseDir, p);
    if (process.platform === "win32") {
        result = result.replace(/\\/g, "/");
    }

    return path.posix.resolve("/", result);
}

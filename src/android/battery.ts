import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";

const createBatterySVG = (level: number, charging = false) => {
    const clampedLevel = Math.max(0, Math.min(100, level));

    const bodyWidth = 128;
    const bodyHeight = 120;
    const bodyX = 5;
    const bodyY = 5;

    // fill height
    const fillHeight = (clampedLevel / 100) * (bodyHeight - 10);

    let fillColor, textColor, boltColor;
    if (clampedLevel > 60) {
        fillColor = "#4caf50";  // green
        textColor = "#fff";
        boltColor = "#fff";
    } else if (clampedLevel > 40) {
        fillColor = "#ffeb3b"; // yellow
        textColor = "#333";
        boltColor = "#000";
    } else if (clampedLevel > 20) {
        fillColor = "#ff9800"; // orange
        textColor = "#fff";
        boltColor = "#fff";
    } else {
        fillColor = "#f44336"; // red
        textColor = "#fff";
        boltColor = "#fff";
    }

    // battery terminal
    const terminalWidth = 30;
    const terminalHeight = 10;
    const terminalX = bodyX + (bodyWidth / 2) - (terminalWidth / 2);
    const terminalY = 0;

    const textX = bodyX + bodyWidth / 2;
    const textY = bodyY + bodyHeight / 2;

    const boltPath = `
      M ${textX + 23},${textY - 32}
      L ${textX - 15},${textY - 2}
      L ${textX},${textY - 2}
      L ${textX - 23},${textY + 32}
      L ${textX + 15},${textY + 2}
      L ${textX},${textY + 2}
      Z
    `;

    const svg = `
        <svg width="${bodyWidth + 10}" height="${bodyHeight + 20}" viewBox="0 0 ${bodyWidth + 10} ${bodyHeight + 20}" xmlns="http://www.w3.org/2000/svg">
        <!-- Battery outline -->
        <rect x="${bodyX}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" stroke="#fff" stroke-width="3" fill="none" rx="6" ry="6"/>
        <!-- Battery terminal -->
        <rect x="${terminalX}" y="${terminalY}" width="${terminalWidth}" height="${terminalHeight}" fill="#fff" rx="3" ry="3"/>
        <!-- Battery fill indicating charge -->
        <rect x="${bodyX + 3}" y="${bodyY + bodyHeight - fillHeight - 3}" width="${bodyWidth - 6}" height="${fillHeight}" fill="${fillColor}" rx="4" ry="4"/>
        ${charging ?
            `<path d="${boltPath}" fill="${boltColor}" stroke="none"/>` :
            `<text x="${textX}" y="${textY}" font-family="sans-serif" font-size="28" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
                ${clampedLevel}%
            </text>`
        }
        </svg>
    `;
    return svg;
};

const svgToPng = async (svgCode: string) => {
    const rsvg = spawn('rsvg-convert', ['--format', 'png']);

    return new Promise<Buffer>((resolve, reject) => {
        const output: Buffer[] = [];
        rsvg.stdout.on('data', (data) => output.push(data));
        rsvg.on('close', (code) => {
            if (code === 0) {
                resolve(Buffer.concat(output));
            } else {
                reject(new Error(`rsvg-convert exited with code ${code}`));
            }
        });

        rsvg.stdin.write(svgCode);
        rsvg.stdin.end();
    });
}

export const getBatteryInfo = async () => {
    const [percentage, status, health, timeToFull, temp, chargeFull, currentNow] = await Promise.all([
        readFile("/sys/class/power_supply/battery/capacity", "utf-8"),
        readFile("/sys/class/power_supply/battery/status", "utf-8"),
        readFile("/sys/class/power_supply/battery/health", "utf-8"),
        readFile("/sys/class/power_supply/battery/time_to_full_now", "utf-8"),
        readFile("/sys/class/power_supply/battery/temp", "utf-8"),
        readFile("/sys/class/power_supply/battery/charge_full", "utf-8"),
        readFile("/sys/class/power_supply/battery/current_now", "utf-8"),
    ]);

    const batteryPercentage = parseInt(percentage, 10);
    const tempC = parseInt(temp, 10);
    const chargeFullInt = parseInt(chargeFull, 10);
    const currentNowInt = parseInt(currentNow, 10);

    const chargeNow = (chargeFullInt * batteryPercentage) / 100;
    const hoursRemaining = Math.round(chargeNow / Math.abs(currentNowInt));

    return {
        percentage: batteryPercentage,
        status: status.trim(),
        health: health.trim(),
        temp: `${Math.ceil(tempC / 10)}°C`,
        timeToFull: `${Math.ceil(parseInt(timeToFull, 10) / 60)} mins`,
        hoursRemaining,
        svg: await svgToPng(createBatterySVG(batteryPercentage, status.trim() === "Charging")),
    };
}

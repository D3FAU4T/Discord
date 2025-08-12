import sharp from "sharp";
import { readFile } from "node:fs/promises";

const createBatterySVG = (level: number, includeText: boolean = true) => {
    const clampedLevel = Math.max(0, Math.min(100, level));

    const bodyWidth = 128; // 60
    const bodyHeight = 128; // 120
    const bodyX = 5;
    const bodyY = 5;

    // padding
    const fillHeight = (clampedLevel / 100) * (bodyHeight - 10);

    let fillColor, textColor;

    if (clampedLevel > 60) {
        fillColor = "#4caf50";  // green
        textColor = "#ffffff";     // white
    }

    else if (clampedLevel > 40) {
        fillColor = "#ffeb3b";  // yellow
        textColor = "#333333";     // dark gray for contrast on yellow
    }

    else if (clampedLevel > 20) {
        fillColor = "#ff9800";  // orange
        textColor = "#ffffff";     // white
    }

    else {
        fillColor = "#f44336";  // red
        textColor = "#ffffff";     // white
    }

    // Battery terminal
    const terminalWidth = 30;
    const terminalHeight = 10;
    const terminalX = bodyX + (bodyWidth / 2) - (terminalWidth / 2);
    const terminalY = 0;

    const textX = bodyX + bodyWidth / 2;
    const textY = bodyY + bodyHeight / 2;

    const textElement = includeText ? `
      <!-- Battery percentage label -->
      <text x="${textX}" y="${textY}" font-family="DejaVu Sans, Liberation Sans, Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="central" style="font-family: monospace, sans-serif;">
        ${clampedLevel}%
      </text>` : '';

    const svg = `
    <svg width="${bodyWidth + 10}" height="${bodyHeight + 20}" viewBox="0 0 ${bodyWidth + 10} ${bodyHeight + 20}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .battery-text {
            font-family: "DejaVu Sans", "Liberation Sans", Arial, Helvetica, monospace, sans-serif;
            font-size: 14px;
            font-weight: bold;
            text-anchor: middle;
            dominant-baseline: central;
          }
        </style>
      </defs>
      <!-- Battery outline -->
      <rect x="${bodyX}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" stroke="#fff" stroke-width="3" fill="none" rx="6" ry="6"/>
      <!-- Battery terminal -->
      <rect x="${terminalX}" y="${terminalY}" width="${terminalWidth}" height="${terminalHeight}" fill="#fff" rx="3" ry="3"/>
      <!-- Battery fill indicating charge -->
      <rect x="${bodyX + 3}" y="${bodyY + bodyHeight - fillHeight - 3}" width="${bodyWidth - 6}" height="${fillHeight}" fill="${fillColor}" rx="4" ry="4"/>
      ${textElement}
    </svg>
  `;
    return svg;
}


const svgToPng = async (svg: string, width = 60, height = 120) => {
    return await sharp(Buffer.from(svg))
        .resize(width, height)
        .png({
            quality: 100,
            compressionLevel: 0
        })
        .toBuffer();
}

export const getBatteryInfo = async () => {
    const percentage = await readFile("/sys/class/power_supply/battery/capacity", "utf-8");
    const status = await readFile("/sys/class/power_supply/battery/status", "utf-8");
    const health = await readFile("/sys/class/power_supply/battery/health", "utf-8");

    const batteryPercentage = parseInt(percentage, 10);

    return {
        percentage: batteryPercentage,
        status: status.trim(),
        health: health.trim(),
        svg: await svgToPng(createBatterySVG(batteryPercentage), 128, 128)
    };
}

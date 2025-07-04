export function getLuminance(hex: string): number {
    const c = hex.charAt(0) === '#' ? hex.substring(1) : hex;
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    const [R, G, B] = [r, g, b].map((ch) =>
        ch <= 0.03928 ? ch / 12.92 : Math.pow((ch + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getContrastTextColor(bgHex: string): 'black' | 'white' {
    const luminance = getLuminance(bgHex);
    return luminance > 0.179 ? 'black' : 'white';
}
const isColorSupported = !process.env.NO_COLOR && process.stdout.isTTY !== false;

const colorize = (code, endCode = 39) => (text) => {
  if (!isColorSupported) return String(text);
  return `\x1b[${code}m${text}\x1b[${endCode}m`;
};

const colors = {
  reset: isColorSupported ? '\x1b[0m' : '',
  bold: colorize(1, 22),
  dim: colorize(2, 22),
  italic: colorize(3, 23),
  underline: colorize(4, 24),
  red: colorize(31),
  green: colorize(32),
  yellow: colorize(33),
  blue: colorize(34),
  magenta: colorize(35),
  cyan: colorize(36),
  white: colorize(37),
  gray: colorize(90),
  bgRed: colorize(41, 49),
  bgGreen: colorize(42, 49),
  bgYellow: colorize(43, 49)
};

module.exports = colors;

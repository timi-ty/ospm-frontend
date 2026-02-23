const noop = () => {};
const logger = {
  trace: noop, debug: noop, info: noop, warn: noop, error: noop, fatal: noop,
  child: () => logger, level: "silent", isLevelEnabled: () => false,
};
function pino() { return logger; }
pino.destination = noop;
pino.transport = noop;
pino.multistream = noop;
pino.levels = { values: {}, labels: {} };
pino.stdTimeFunctions = {};
module.exports = pino;
module.exports.default = pino;

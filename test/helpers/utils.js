const { Signale } = require("signale");

const signaleOpts = {
  disabled: false,
  interactive: false,
  logLevel: 'info',
  scope: '',
  secrets: [],
  stream: process.stdout,
  types: {
    log: {
      badge: 'đŦ',
      color: 'grey',
      label: 'LOG',
      logLevel: 'debug'
    },
    debug: {
      badge: 'đ',
      color: 'yellow',
      label: 'DEBUG',
      logLevel: 'debug'
    },
    warn: {
      badge: 'â ī¸',
      color: 'yellow',
      label: 'WARNING',
      logLevel: 'warning'
    },
    info: {
      badge: 'âšī¸',
      color: 'cyan',
      label: 'INFO',
      logLevel: 'info'
    },
    success: {
      badge: 'âī¸',
      color: 'green',
      label: 'SUCCESS',
      logLevel: 'info'
    },
    error: {
      badge: 'âī¸',
      color: 'red',
      label: 'ERROR',
      logLevel: 'error'
    }
  }
};

const log = new Signale(signaleOpts);

const getAnyClass = (obj) => {
  if (typeof obj === "undefined") return "undefined";
  if (obj === null) return "null";
  return obj.constructor.name;
}
const toReadable = (logObject) => {
  switch (getAnyClass(logObject)) {
    case 'Array':
      return logObject.map((n) => {
        switch (getAnyClass(n)) {
          case 'BN':
            return n.toString();
          case 'Array':
            return toReadable(n);
          default:
            return n;
        }
      });
    case 'Object':
    case 'Result':
      return (() => {
        var logObj = {};
        Object.keys(logObject).forEach((key) => {
          switch (getAnyClass(logObject[key])) {
            case 'BN':
              logObj[key] = logObject[key].toString();
              break;
            case 'Array':
              logObj[key] = toReadable(logObject[key]);
              break;
            default:
              logObj[key] = logObject[key];
              break;
          }
        });
        return logObj;
      })();
    case 'BN':
      return logObject.toString();
    default:
      return logObject;
  }
};

module.exports = {
  log,
  toReadable
}
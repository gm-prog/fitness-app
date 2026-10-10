const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const log = (level, message, data = {}) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };

  // Console output
  const consoleOutput = `[${timestamp}] ${level}: ${message}`;
  if (Object.keys(data).length > 0) {
    console.log(consoleOutput, data);
  } else {
    console.log(consoleOutput);
  }

  // File output (in production)
  if (process.env.NODE_ENV === 'production') {
    const logFile = path.join(logDir, `${level.toLowerCase()}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
};

module.exports = {
  info: (message, data) => log('INFO', message, data),
  error: (message, data) => log('ERROR', message, data),
  warn: (message, data) => log('WARN', message, data),
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      log('DEBUG', message, data);
    }
  },
};

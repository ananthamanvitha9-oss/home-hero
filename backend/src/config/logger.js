const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const formatConfig = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  // console logger formatting (colorized output for standard logs)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Production builds rotate log files daily to save local storage capacity
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d' // Keep logs for 30 days
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d' // Keep combined logs for 14 days
    })
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: formatConfig,
  defaultMeta: { service: 'homehero-backend' },
  transports
});

module.exports = logger;

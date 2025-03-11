const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' 
    ? { 
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      } 
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  }
});

module.exports = { logger };
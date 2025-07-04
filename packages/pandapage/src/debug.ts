// Debug logging utility that respects LOG_LEVEL environment variable
// LOG_LEVEL can be: None, Fatal, Error, Warning, Info, AI, Debug, Trace, All
const getLogLevel = () => {
  // Check if we're in a browser environment
  if (typeof process === 'undefined' || !process.env) {
    // In browser, check for a global LOG_LEVEL variable
    return (typeof window !== 'undefined' && (window as any).LOG_LEVEL?.toLowerCase()) || 'error';
  }
  // In Node.js
  return process.env.LOG_LEVEL?.toLowerCase() || 'error';
};

const logLevel = getLogLevel();
const isDebugEnabled = ['debug', 'trace', 'all'].includes(logLevel);
const isAiEnabled = ['ai', 'debug', 'trace', 'all'].includes(logLevel);

export const debug = {
  log: (...args: any[]) => {
    if (isDebugEnabled) {
      console.debug(...args);
    }
  },
  ai: (...args: any[]) => {
    if (isAiEnabled) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Log errors unless LOG_LEVEL is None
    if (logLevel !== 'none') {
      console.error(...args);
    }
  }
};
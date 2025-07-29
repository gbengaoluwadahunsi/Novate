// Production security utilities
// Prevents debugging and information leakage in production

export const disableDebugging = () => {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Disable console methods
    const noop = () => {};
    console.log = noop;
    console.debug = noop;
    console.info = noop;
    console.warn = noop;
    console.error = noop;
    console.table = noop;
    console.trace = noop;
    console.group = noop;
    console.groupEnd = noop;
    console.groupCollapsed = noop;
    console.time = noop;
    console.timeEnd = noop;
    console.count = noop;
    console.countReset = noop;
    console.clear = noop;
    console.dir = noop;
    console.dirxml = noop;
    console.assert = noop;

    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        return false;
      }
    });

    // Disable text selection (optional - might affect UX)
    // document.addEventListener('selectstart', (e) => {
    //   e.preventDefault();
    //   return false;
    // });

    // Detect DevTools opening
    let devtools = {
      open: false,
      orientation: null
    };

    const threshold = 160;
    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          // Redirect or show warning
          window.location.href = '/';
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }
};

// Safe console methods that work only in development
export const devConsole = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args);
    }
  }
}; 
// src/setupReact19.js
import React from 'react';

// 禁用 React 19 ref 警告
if (process.env.NODE_ENV === 'development') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Accessing element.ref was removed in React 19')
    ) {
      return; // 屏蔽 ref 警告
    }
    originalConsoleWarn(...args);
  };
}
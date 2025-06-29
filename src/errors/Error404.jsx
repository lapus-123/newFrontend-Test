import React from 'react';
import {
  ShieldX,      // 403
  SearchX,      // 404
  TimerOff,     // 408
  ServerCrash,  // 500
  Network,      // 502
  Construction, // 503
  Timer,        // 504
  AlertTriangle // default
} from 'lucide-react';

const errorConfig = {
  403: {
    Icon: ShieldX,
    title: '403 Forbidden',
    message: 'Access denied. You do not have permission to view this page.',
  },
  404: {
    Icon: SearchX,
    title: '404 Not Found',
    message: 'Oops! The page you’re looking for doesn’t exist.',
  },
  408: {
    Icon: TimerOff,
    title: '408 Request Timeout',
    message: 'Your request took too long. Please try again.',
  },
  500: {
    Icon: ServerCrash,
    title: '500 Internal Server Error',
    message: 'Something went wrong on our end.',
  },
  502: {
    Icon: Network,
    title: '502 Bad Gateway',
    message: 'The server received an invalid response.',
  },
  503: {
    Icon: Construction,
    title: '503 Service Unavailable',
    message: 'We are currently undergoing maintenance. Please come back later.',
  },
  504: {
    Icon: Timer,
    title: '504 Gateway Timeout',
    message: 'The server didn’t respond in time. Please try again.',
  },
  default: {
    Icon: AlertTriangle,
    title: 'Unexpected Error',
    message: 'An unknown error occurred. Please refresh the page or try again later.',
  },
};

export default function Error404({ code = 404 }) {
  const { Icon, title, message } = errorConfig[code] || errorConfig.default;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
      <Icon className="w-24 h-24 text-red-500 mb-6" />
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-600 mt-2 max-w-md">{message}</p>
    </div>
  );
}

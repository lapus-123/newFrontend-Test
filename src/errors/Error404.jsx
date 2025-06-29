import React from 'react';
import error404Img from './images/Error 404.png';

export default function Error404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
      <img src={error404Img} alt="Error 404" className="max-w-full w-[400px] mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">Oops! Page not found.</h2>
    </div>
  );
}

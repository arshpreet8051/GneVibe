import React from "react";

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center">
        <h1 className="text-white text-5xl font-bold mb-4 animate-bounce">
          Welcome to the Dashboard
        </h1>
        <p className="text-white text-lg opacity-80 animate-fade-in">
          Manage your activities here.
        </p>
        <button className="mt-6 px-6 py-3 bg-white text-blue-500 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;

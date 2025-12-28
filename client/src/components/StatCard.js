import React from 'react';

const StatCard = ({ icon: Icon, title, value, color }) => {
  const colors = {
    blue: 'from-blue-600 to-blue-400',
    yellow: 'from-yellow-600 to-yellow-400',
    red: 'from-red-600 to-red-400',
    purple: 'from-purple-600 to-purple-400'
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;


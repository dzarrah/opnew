
import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  trendValue?: string;
  color: string;
  progress: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, trend = "up", trendValue = "", color, progress }) => {
  const isUp = trend === 'up';
  
  return (
    <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-200 dark:border-[#283639] shadow-sm relative overflow-hidden group transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${color.replace('bg-', 'bg-opacity-10 text-')} dark:${color.replace('bg-', 'bg-opacity-10 text-')}`}>
          <span className={`material-symbols-outlined ${color.replace('bg-', 'text-')}`}>{icon}</span>
        </div>
        <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${isUp ? 'text-green-600 bg-green-50 dark:text-success dark:bg-success/10' : 'text-red-600 bg-red-50 dark:text-danger dark:bg-danger/10'}`}>
          <span className="material-symbols-outlined text-[14px] mr-1">{isUp ? 'trending_up' : 'trending_down'}</span>
          {trendValue}
        </span>
      </div>
      <h3 className="text-gray-500 dark:text-[#9db4b9] text-sm font-medium mb-1">{label}</h3>
      <p className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
        {value}
        {subValue && <span className="text-lg text-gray-400 dark:text-[#5a7075] font-normal ml-1">{subValue}</span>}
      </p>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-[#283639]">
        <div 
          className={`h-full ${color.split(' ')[0]} rounded-r-full transition-all duration-500`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StatCard;

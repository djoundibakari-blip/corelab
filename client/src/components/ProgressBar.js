import React from 'react';

const ProgressBar = ({ current, total, score, passed }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progression: {current}/{total} questions
        </span>
        {score !== null && (
          <span className={`text-sm font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}>
            Score: {score}/20 {passed ? '✓ Réussi' : '✗ Échec'}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;

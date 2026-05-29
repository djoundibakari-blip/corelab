import React from 'react';

const FailureAlert = ({ score, passingScore, onRetry }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Quiz non réussi
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              Votre score: <strong>{score}/20</strong> (Minimum requis: {passingScore}/20)
            </p>
            <p className="mt-1">
              Ne vous découragez pas ! Révisez le cours et réessayez.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={onRetry}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Réessayer le quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailureAlert;

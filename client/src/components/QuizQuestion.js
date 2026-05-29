import React from 'react';

const QuizQuestion = ({ question, index, selectedAnswer, onAnswerChange }) => {
  return (
    <div className="quiz-question mb-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        Question {index + 1}: {question.question}
      </h3>
      <div className="space-y-2">
        {question.options.map((option, optionIndex) => (
          <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name={`question-${index}`}
              value={optionIndex}
              checked={selectedAnswer === optionIndex}
              onChange={() => onAnswerChange(index, optionIndex)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuizQuestion;

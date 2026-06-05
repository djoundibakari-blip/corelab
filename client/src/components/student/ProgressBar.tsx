import type { Progress } from '@/types';

interface ProgressBarProps {
  progress: Progress;
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Progression du cours</h3>
        <span className="text-2xl font-black text-blue-600">{progress.percentage}%</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden">
        <div
          className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{progress.completedLessons.length} leçons complétées</span>
        <span>sur {progress.totalLessons} au total</span>
      </div>
    </div>
  );
};

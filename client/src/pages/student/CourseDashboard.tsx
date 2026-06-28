import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Course, Progress } from '@/types';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { ProgressBar } from '@/components/student/ProgressBar';

export const CourseDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch {
        setCourses([
          {
            _id: '1',
            title: 'Fondamentaux JavaScript',
            description: 'Apprenez les bases de JavaScript, ES6+ et les bonnes pratiques.',
            lessons: [
              { _id: '1-1', courseId: '1', title: 'Introduction à JavaScript', htmlContent: '', order: 1 },
              { _id: '1-2', courseId: '1', title: 'Variables et Types', htmlContent: '', order: 2 },
              { _id: '1-3', courseId: '1', title: 'Fonctions et Portée', htmlContent: '', order: 3 },
            ]
          },
          {
            _id: '2',
            title: 'React pour Débutants',
            description: 'Maîtrisez React, Hooks et la création de composants modernes.',
            lessons: [
              { _id: '2-1', courseId: '2', title: 'Introduction à React', htmlContent: '', order: 1 },
              { _id: '2-2', courseId: '2', title: 'JSX et Composants', htmlContent: '', order: 2 },
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgress(response.data);
      } catch {
        setProgress([
          { _id: 'p1', userId: '507f1f77bcf86cd799439011', courseId: '1', completedLessons: ['1-1'], totalLessons: 3, percentage: 33 }
        ]);
      }
    };

    fetchCourses();
    fetchProgress();
  }, []);

  const getCourseProgress = (courseId: string) => progress.find(p => p.courseId === courseId);

  if (loading) return <div className="text-center py-8 text-[#AACBC4]">Chargement des cours...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#707D7D] mb-1">Espace Étudiant</p>
        <h2 className="text-xl font-bold text-white">Mes Cours</h2>
        <p className="text-sm text-[#AACBC4] mt-1">Continuez votre apprentissage et passez les quiz de validation.</p>
      </div>

      <div className="grid gap-4">
        {courses.map((course) => {
          const courseProgress = getCourseProgress(course._id);
          return (
            <div key={course._id}
              className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl p-6 hover:border-[#00DF81]/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                  <p className="text-sm text-[#AACBC4] mb-4">{course.description}</p>
                </div>
                {courseProgress && (
                  <div className="ml-4 flex-shrink-0 text-right">
                    <p className="text-2xl font-black text-[#00DF81]">{courseProgress.percentage}%</p>
                    <p className="text-xs text-[#707D7D]">Complété</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-[#AACBC4]">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.lessons.length} leçons</span>
                </div>
                {courseProgress && (
                  <div className="flex items-center gap-1.5 text-sm text-[#AACBC4]">
                    <CheckCircle2 className="w-4 h-4 text-[#00DF81]" />
                    <span>{courseProgress.completedLessons.length} complétées</span>
                  </div>
                )}
              </div>

              {courseProgress && <ProgressBar progress={courseProgress} />}

              <div className="flex gap-3 mt-4">
                <Link to={`/student/lessons/${course.lessons[0]?._id}`}
                  className="flex-1 bg-[#00DF81] hover:bg-[#2CC295] text-[#021B1A] font-bold py-2.5 rounded-lg text-sm text-center transition-colors">
                  Continuer le cours
                </Link>
                {courseProgress && courseProgress.percentage > 0 && (
                  <Link to={`/student/quiz/${course.lessons[courseProgress.completedLessons.length]?._id}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-[#03624C] rounded-lg text-sm font-medium text-[#AACBC4] hover:bg-[#021B1A]/50 hover:text-white transition-colors">
                    <Clock className="w-4 h-4" />
                    Passer le Quiz
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

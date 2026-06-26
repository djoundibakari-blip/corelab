import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import type { Lesson } from '@/types';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';

export const LessonView = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLesson(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement de la leçon:', error);
        // Fallback to mock data
        setLesson({
          _id: lessonId,
          courseId: '1',
          title: 'Introduction à JavaScript',
          htmlContent: `
            <h1>Introduction à JavaScript</h1>
            <p>JavaScript est un langage de programmation de scripts principalement utilisé dans les navigateurs web.</p>
            <h2>Caractéristiques principales</h2>
            <ul>
              <li>Langage interprété</li>
              <li>Orienté objet</li>
              <li>Fonctionnel</li>
              <li>Dynamique</li>
            </ul>
            <h2>Variables</h2>
            <p>En JavaScript, vous pouvez déclarer des variables avec <code>let</code>, <code>const</code> et <code>var</code>.</p>
            <pre><code>let x = 5;
const y = 10;
var z = 15;</code></pre>
          `,
          order: 1
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleCompleteLesson = () => {
    if (!lesson) return;
    navigate(`/student/quiz/${lesson._id}`);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement de la leçon...</div>;
  }

  if (!lesson) {
    return <div className="text-center py-8">Leçon non trouvée</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          to="/student/courses"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">
            Leçon {lesson.order}
          </p>
          <h2 className="text-xl font-bold text-gray-900">{lesson.title}</h2>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.htmlContent) }} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCompleteLesson}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Marquer comme terminé et passer au Quiz
        </button>
        <Link
          to={`/student/quiz/${lesson._id}`}
          className="flex items-center gap-1.5 px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Passer le Quiz
        </Link>
      </div>
    </div>
  );
};

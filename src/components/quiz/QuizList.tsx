import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Trophy, Clock, ChevronRight } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  subject_id: string;
}

interface QuizAttempt {
  quiz_id: string;
  score: number;
  total_questions: number;
}

interface QuizListProps {
  subjectId: string;
}

const QuizList = ({ subjectId }: QuizListProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Record<string, QuizAttempt>>({});
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, [subjectId, user]);

  const fetchQuizzes = async () => {
    try {
      // Fetch quizzes for this subject
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('subject_id', subjectId);

      if (quizzesError) throw quizzesError;
      setQuizzes(quizzesData || []);

      // Fetch question counts for each quiz
      if (quizzesData && quizzesData.length > 0) {
        const counts: Record<string, number> = {};
        for (const quiz of quizzesData) {
          const { count } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id);
          counts[quiz.id] = count || 0;
        }
        setQuestionCounts(counts);
      }

      // Fetch user's best attempts
      if (user && quizzesData && quizzesData.length > 0) {
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('quiz_attempts')
          .select('quiz_id, score, total_questions')
          .eq('user_id', user.id)
          .in('quiz_id', quizzesData.map(q => q.id))
          .order('score', { ascending: false });

        if (!attemptsError && attemptsData) {
          const bestAttempts: Record<string, QuizAttempt> = {};
          for (const attempt of attemptsData) {
            if (!bestAttempts[attempt.quiz_id]) {
              bestAttempts[attempt.quiz_id] = attempt;
            }
          }
          setAttempts(bestAttempts);
        }
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card className="glass-card border-border/30">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No quizzes available for this subject yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {quizzes.map((quiz) => {
        const attempt = attempts[quiz.id];
        const questionCount = questionCounts[quiz.id] || 0;
        const percentage = attempt 
          ? Math.round((attempt.score / attempt.total_questions) * 100) 
          : null;

        return (
          <Card 
            key={quiz.id} 
            className="glass-card border-border/30 hover:border-primary/30 transition-all cursor-pointer group"
            onClick={() => navigate(`/subject/${subjectId}/quiz/${quiz.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {quiz.title}
                    </CardTitle>
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {quiz.description}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {questionCount} questions
                  </span>
                </div>
                {percentage !== null && (
                  <Badge 
                    variant={percentage >= 70 ? 'default' : percentage >= 40 ? 'secondary' : 'destructive'}
                    className="flex items-center gap-1"
                  >
                    <Trophy className="w-3 h-3" />
                    Best: {percentage}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuizList;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
}

interface QuizData {
  id: string;
  title: string;
  description: string | null;
  subject_id: string;
}

const Quiz = () => {
  const { id: subjectId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    if (!quizId) return;

    try {
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId);

      if (questionsError) throw questionsError;

      const formattedQuestions = questionsData.map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
      }));

      setQuestions(formattedQuestions);
      setSelectedAnswers(new Array(formattedQuestions.length).fill(null));
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    const score = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correct_answer ? 1 : 0);
    }, 0);

    // Save attempt to database
    if (user && quiz) {
      try {
        await supabase.from('quiz_attempts').insert({
          user_id: user.id,
          quiz_id: quiz.id,
          score,
          total_questions: questions.length,
          answers: selectedAnswers,
        });
      } catch (error) {
        console.error('Error saving attempt:', error);
      }
    }

    setShowResults(true);
  };

  const handleRetry = () => {
    setSelectedAnswers(new Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setShowResults(false);
  };

  const getScore = () => {
    return selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correct_answer ? 1 : 0);
    }, 0);
  };

  const getScorePercentage = () => {
    return Math.round((getScore() / questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-card border-border/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Quiz not found or has no questions.</p>
            <Button onClick={() => navigate(`/subject/${subjectId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subject
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const score = getScore();
    const percentage = getScorePercentage();

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="glass-card border-border/30">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${percentage >= 70 ? 'bg-green-500/20' : percentage >= 40 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                <Trophy className={`w-12 h-12 ${percentage >= 70 ? 'text-green-500' : percentage >= 40 ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>
            </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <p className="text-muted-foreground">{quiz.title}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary mb-2">{percentage}%</p>
              <p className="text-muted-foreground">
                You got {score} out of {questions.length} questions correct
              </p>
            </div>

            <Progress value={percentage} className="h-3" />

            {/* Review Answers */}
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold text-lg">Review Answers</h3>
              {questions.map((q, index) => {
                const isCorrect = selectedAnswers[index] === q.correct_answer;
                return (
                  <div key={q.id} className="p-4 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-2">{q.question}</p>
                        <p className="text-sm text-muted-foreground">
                          Your answer: {q.options[selectedAnswers[index] ?? 0] || 'Not answered'}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-500">
                            Correct: {q.options[q.correct_answer]}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Quiz
              </Button>
              <Button onClick={() => navigate(`/subject/${subjectId}`)} className="flex-1 gradient-purple">
                Back to Subject
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="glass-card border-border/30">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/subject/${subjectId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-6">{currentQ.question}</h3>
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-xl border transition-all ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <span className="font-medium mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswers.some((a) => a === null)}
                className="gradient-purple"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;

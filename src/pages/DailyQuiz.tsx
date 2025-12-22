import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Trophy,
  Loader2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface Subject {
  id: string;
  name: string;
  code: string;
  icon: string | null;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const DailyQuiz = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code, icon')
        .order('name');
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (subject: Subject) => {
    setSelectedSubject(subject);
    setGenerating(true);
    
    // Check localStorage for cached quiz
    const cacheKey = `quiz_${subject.id}_${new Date().toISOString().split('T')[0]}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        setQuestions(cachedData.questions);
        setGenerating(false);
        return;
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            subjectName: subject.name,
            subjectCode: subject.code,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      setQuestions(data.questions);
      
      // Cache the quiz
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate quiz');
      setSelectedSubject(null);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const getScore = () => {
    return questions.reduce((score, q, idx) => {
      return score + (selectedAnswers[idx] === q.correctAnswer ? 1 : 0);
    }, 0);
  };

  const resetQuiz = () => {
    setSelectedSubject(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const retryQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Subject selection screen
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-purple shadow-glow mb-4">
                <Brain className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('quiz')}</h1>
              <p className="text-muted-foreground">
                Select a subject to start today's quiz. New questions every day!
              </p>
              <Badge variant="secondary" className="mt-2 gap-1">
                <Sparkles className="w-3 h-3" />
                AI-Generated Daily
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="glass-card border-border/30 hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => generateQuiz(subject)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">{subject.code}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {subjects.length === 0 && (
              <Card className="glass-card border-border/30">
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No subjects available yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading quiz questions
  if (generating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Generating Quiz</h2>
          <p className="text-muted-foreground">AI is creating questions for {selectedSubject.name}...</p>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const score = getScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="glass-card border-border/30 mb-6">
              <CardContent className="p-8 text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  percentage >= 70 ? 'bg-green-500/20' : percentage >= 40 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                }`}>
                  <Trophy className={`w-10 h-10 ${
                    percentage >= 70 ? 'text-green-500' : percentage >= 40 ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</h2>
                <p className="text-4xl font-bold text-primary mb-2">{score}/{questions.length}</p>
                <p className="text-muted-foreground mb-4">{percentage}% correct</p>
                <Progress value={percentage} className="h-3 mb-6" />
                
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={resetQuiz}>
                    Choose Another Subject
                  </Button>
                  <Button onClick={retryQuiz}>
                    Retry Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Answer Review */}
            <h3 className="text-lg font-semibold text-foreground mb-4">Review Answers</h3>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                return (
                  <Card key={idx} className={`border ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {isCorrect ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
                        </div>
                        <p className="text-foreground font-medium">{q.question}</p>
                      </div>
                      <div className="ml-9 space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Your answer: <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                            {q.options[selectedAnswers[idx]] || 'Not answered'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-green-500">
                            Correct: {q.options[q.correctAnswer]}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-muted-foreground mt-2 italic">{q.explanation}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz question screen
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={resetQuiz} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Exit
            </Button>
            <Badge variant="secondary">{selectedSubject.name}</Badge>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="glass-card border-border/30 mb-6">
            <CardHeader>
              <CardTitle className="text-lg leading-relaxed">{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full p-4 rounded-xl text-left transition-all border ${
                    selectedAnswers[currentQuestion] === idx
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30 text-foreground'
                  }`}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('previous')}
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length !== questions.length}
                className="gap-2"
              >
                {t('submit')}
                <Check className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2">
                {t('next')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuiz;

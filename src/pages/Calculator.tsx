import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator as CalcIcon, Plus, Trash2, GraduationCap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

interface Semester {
  id: string;
  name: string;
  sgpa: number;
  credits: number;
}

const gradePoints: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'P': 4,
  'F': 0,
};

const Calculator = () => {
  // SGPA State
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: '', credits: 3, grade: '' },
  ]);
  const [sgpa, setSgpa] = useState<number | null>(null);

  // CGPA State
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: '1', name: 'Semester 1', sgpa: 0, credits: 20 },
  ]);
  const [cgpa, setCgpa] = useState<number | null>(null);

  // SGPA Functions
  const addSubject = () => {
    setSubjects([
      ...subjects,
      { id: Date.now().toString(), name: '', credits: 3, grade: '' },
    ]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((s) => s.id !== id));
    }
  };

  const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const calculateSGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    for (const subject of subjects) {
      if (subject.grade && subject.credits) {
        totalCredits += subject.credits;
        totalPoints += subject.credits * (gradePoints[subject.grade] || 0);
      }
    }

    if (totalCredits > 0) {
      setSgpa(Number((totalPoints / totalCredits).toFixed(2)));
    }
  };

  // CGPA Functions
  const addSemester = () => {
    setSemesters([
      ...semesters,
      {
        id: Date.now().toString(),
        name: `Semester ${semesters.length + 1}`,
        sgpa: 0,
        credits: 20,
      },
    ]);
  };

  const removeSemester = (id: string) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter((s) => s.id !== id));
    }
  };

  const updateSemester = (id: string, field: keyof Semester, value: string | number) => {
    setSemesters(
      semesters.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const calculateCGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    for (const semester of semesters) {
      if (semester.sgpa && semester.credits) {
        totalCredits += semester.credits;
        totalPoints += semester.credits * semester.sgpa;
      }
    }

    if (totalCredits > 0) {
      setCgpa(Number((totalPoints / totalCredits).toFixed(2)));
    }
  };

  const getGradeColor = (grade: string) => {
    const point = gradePoints[grade] || 0;
    if (point >= 9) return 'bg-apple-green/10 text-apple-green border-apple-green/20';
    if (point >= 7) return 'bg-apple-blue/10 text-apple-blue border-apple-blue/20';
    if (point >= 5) return 'bg-apple-orange/10 text-apple-orange border-apple-orange/20';
    return 'bg-apple-red/10 text-apple-red border-apple-red/20';
  };

  const getCGPAGrade = (value: number) => {
    if (value >= 9) return { label: 'Outstanding', color: 'text-apple-green' };
    if (value >= 8) return { label: 'Excellent', color: 'text-apple-blue' };
    if (value >= 7) return { label: 'Very Good', color: 'text-apple-teal' };
    if (value >= 6) return { label: 'Good', color: 'text-apple-orange' };
    if (value >= 5) return { label: 'Average', color: 'text-warning' };
    return { label: 'Below Average', color: 'text-apple-red' };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-apple"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">VTU Calculator</h1>
                <p className="text-xs text-muted-foreground">SGPA & CGPA</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="sgpa" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-secondary rounded-2xl">
              <TabsTrigger
                value="sgpa"
                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-apple-sm"
              >
                SGPA Calculator
              </TabsTrigger>
              <TabsTrigger
                value="cgpa"
                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-apple-sm"
              >
                CGPA Calculator
              </TabsTrigger>
            </TabsList>

            {/* SGPA Calculator */}
            <TabsContent value="sgpa" className="space-y-6 animate-fade-in">
              <Card className="border-0 shadow-apple-lg rounded-3xl overflow-hidden">
                <CardHeader className="bg-secondary/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
                      <CalcIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Semester GPA</CardTitle>
                      <CardDescription>Calculate your SGPA for a semester</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {subjects.map((subject, index) => (
                    <div
                      key={subject.id}
                      className="flex gap-3 items-end p-4 bg-secondary/30 rounded-2xl animate-scale-in"
                    >
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs text-muted-foreground">Subject {index + 1}</Label>
                        <Input
                          placeholder="Subject name (optional)"
                          value={subject.name}
                          onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                          className="rounded-xl bg-background border-border/50"
                        />
                      </div>
                      <div className="w-24 space-y-2">
                        <Label className="text-xs text-muted-foreground">Credits</Label>
                        <Select
                          value={subject.credits.toString()}
                          onValueChange={(v) => updateSubject(subject.id, 'credits', parseInt(v))}
                        >
                          <SelectTrigger className="rounded-xl bg-background border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map((c) => (
                              <SelectItem key={c} value={c.toString()}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24 space-y-2">
                        <Label className="text-xs text-muted-foreground">Grade</Label>
                        <Select
                          value={subject.grade}
                          onValueChange={(v) => updateSubject(subject.id, 'grade', v)}
                        >
                          <SelectTrigger className="rounded-xl bg-background border-border/50">
                            <SelectValue placeholder="--" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(gradePoints).map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade} ({gradePoints[grade]})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSubject(subject.id)}
                        disabled={subjects.length === 1}
                        className="rounded-xl text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addSubject}
                    className="w-full rounded-xl border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>

                  <Button onClick={calculateSGPA} className="w-full rounded-xl h-12 text-base">
                    Calculate SGPA
                  </Button>

                  {sgpa !== null && (
                    <div className="p-6 bg-secondary/50 rounded-2xl text-center animate-scale-in">
                      <p className="text-sm text-muted-foreground mb-2">Your SGPA</p>
                      <p className="text-5xl font-bold text-foreground mb-2">{sgpa}</p>
                      <Badge className={getCGPAGrade(sgpa).color + ' bg-transparent'}>
                        {getCGPAGrade(sgpa).label}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CGPA Calculator */}
            <TabsContent value="cgpa" className="space-y-6 animate-fade-in">
              <Card className="border-0 shadow-apple-lg rounded-3xl overflow-hidden">
                <CardHeader className="bg-secondary/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-apple-purple/10">
                      <GraduationCap className="w-6 h-6 text-apple-purple" />
                    </div>
                    <div>
                      <CardTitle>Cumulative GPA</CardTitle>
                      <CardDescription>Calculate your overall CGPA</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {semesters.map((semester, index) => (
                    <div
                      key={semester.id}
                      className="flex gap-3 items-end p-4 bg-secondary/30 rounded-2xl animate-scale-in"
                    >
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs text-muted-foreground">Semester {index + 1}</Label>
                        <Input
                          placeholder="Semester name"
                          value={semester.name}
                          onChange={(e) => updateSemester(semester.id, 'name', e.target.value)}
                          className="rounded-xl bg-background border-border/50"
                        />
                      </div>
                      <div className="w-24 space-y-2">
                        <Label className="text-xs text-muted-foreground">SGPA</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          placeholder="0.00"
                          value={semester.sgpa || ''}
                          onChange={(e) =>
                            updateSemester(semester.id, 'sgpa', parseFloat(e.target.value) || 0)
                          }
                          className="rounded-xl bg-background border-border/50"
                        />
                      </div>
                      <div className="w-24 space-y-2">
                        <Label className="text-xs text-muted-foreground">Credits</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="20"
                          value={semester.credits || ''}
                          onChange={(e) =>
                            updateSemester(semester.id, 'credits', parseInt(e.target.value) || 0)
                          }
                          className="rounded-xl bg-background border-border/50"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSemester(semester.id)}
                        disabled={semesters.length === 1}
                        className="rounded-xl text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addSemester}
                    className="w-full rounded-xl border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Semester
                  </Button>

                  <Button onClick={calculateCGPA} className="w-full rounded-xl h-12 text-base">
                    Calculate CGPA
                  </Button>

                  {cgpa !== null && (
                    <div className="p-6 bg-secondary/50 rounded-2xl text-center animate-scale-in">
                      <p className="text-sm text-muted-foreground mb-2">Your CGPA</p>
                      <p className="text-5xl font-bold text-foreground mb-2">{cgpa}</p>
                      <Badge className={getCGPAGrade(cgpa).color + ' bg-transparent'}>
                        {getCGPAGrade(cgpa).label}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grade Reference */}
              <Card className="border-0 shadow-apple-md rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">VTU Grade Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(gradePoints).map(([grade, point]) => (
                      <div
                        key={grade}
                        className={`p-3 rounded-xl text-center border ${getGradeColor(grade)}`}
                      >
                        <p className="font-semibold">{grade}</p>
                        <p className="text-xs opacity-80">{point} pts</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Calculator;
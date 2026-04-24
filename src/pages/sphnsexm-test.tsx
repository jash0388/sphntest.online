import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { gradeExam } from "@/lib/gemini";
import {
  Shield, AlertCircle, Eye, EyeOff, Mail, Lock, ArrowLeft, RefreshCw,
  LogOut, Activity, Target, ShieldAlert, Award, FileText, Clock, PlayCircle, History, AlertTriangle,
  CheckCircle2, BrainCircuit, XCircle, ChevronLeft
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// ==========================================
// 1. AUTH VIEW (Exact Replit UI)
// ==========================================
function DetailsView({ onAuthSuccess, onSetUserDetails }: any) {
  const [formData, setFormData] = useState({
    name: "", phone: "", fathersName: "", fathersPhone: "", college: ""
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetUserDetails(formData);
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-[0.04]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="credentials"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-sm z-10"
        >
          <Card className="border-border bg-card/90 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-3 pb-5 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">EMCET MOCK WEB TEST</CardTitle>
                <CardDescription className="text-muted-foreground mt-1 text-sm">
                  Please enter your details to begin
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-wider">Name</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="bg-background focus:ring-primary/50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="bg-background focus:ring-primary/50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fathersName" className="text-xs text-muted-foreground uppercase tracking-wider">Father's Name</Label>
                  <Input id="fathersName" value={formData.fathersName} onChange={e => setFormData({...formData, fathersName: e.target.value})} required className="bg-background focus:ring-primary/50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fathersPhone" className="text-xs text-muted-foreground uppercase tracking-wider">Father's Phone Number</Label>
                  <Input id="fathersPhone" type="tel" value={formData.fathersPhone} onChange={e => setFormData({...formData, fathersPhone: e.target.value})} required className="bg-background focus:ring-primary/50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="college" className="text-xs text-muted-foreground uppercase tracking-wider">College</Label>
                  <Input id="college" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} required className="bg-background focus:ring-primary/50" />
                </div>
                <Button type="submit" size="lg" className="w-full h-11 mt-4">
                  Proceed to Dashboard
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 2. DASHBOARD VIEW (Exact Replit UI)
// ==========================================
function DashboardView({ exams, submissions, onStartExam, onLogout, user }: any) {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  };

  const stats = {
    totalAttempts: submissions.length,
    averageScore: submissions.length > 0 ? submissions.reduce((a:any, b:any) => a + (b.score/b.total_marks)*100, 0) / submissions.length : 0,
    highestScore: submissions.length > 0 ? Math.max(...submissions.map((s:any) => s.score/s.total_marks*100)) : 0
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="w-5 h-5 text-primary shrink-0" />
            <span className="font-semibold tracking-tight text-sm sm:text-base">EMCET MOCK WEB TEST</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className="text-xs text-muted-foreground hidden sm:inline-block truncate max-w-[200px]">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground shrink-0 px-2 sm:px-3">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Change User</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 mt-6 sm:mt-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 sm:space-y-10">
          
          <motion.div variants={item}>
            <h2 className="text-base sm:text-xl font-medium tracking-tight mb-3 sm:mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Telemetry
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="bg-card/50 border-border">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between text-muted-foreground mb-3">
                    <span className="text-xs sm:text-sm font-medium">Exams Taken</span>
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">{stats.totalAttempts}</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between text-muted-foreground mb-3">
                    <span className="text-xs sm:text-sm font-medium">Avg. Score</span>
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {stats.totalAttempts > 0 ? `${Math.round(stats.averageScore)}%` : '--'}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between text-muted-foreground mb-3">
                    <span className="text-xs sm:text-sm font-medium">High Score</span>
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {stats.totalAttempts > 0 ? `${Math.round(stats.highestScore)}%` : '--'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div variants={item} className="lg:col-span-2 space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-xl font-medium tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Active Deployments
              </h2>
              {exams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {exams.map((exam: any) => {
                    const isCompleted = submissions.some((s: any) => s.exam_id === exam.id);
                    return (
                    <Card key={exam.id} className={`bg-card transition-colors border-border flex flex-col group relative overflow-hidden ${isCompleted ? 'opacity-60 saturate-50' : 'hover:bg-card/80'}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${isCompleted ? 'bg-muted' : 'bg-primary/40 group-hover:bg-primary'}`} />
                      <CardHeader className="pb-3 pl-5">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="text-xs uppercase tracking-wider font-mono bg-background">
                            Assessment
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground font-mono">
                            <Clock className="w-3 h-3 mr-1" />
                            {exam.duration_minutes}m
                          </div>
                        </div>
                        <CardTitle className="text-base sm:text-lg leading-tight">{exam.title}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2">
                          {exam.description || 'No description provided.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3 mt-auto pl-5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">
                            Marks: <span className="text-foreground font-medium">100</span>
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="pl-5">
                        <Button 
                          className={`w-full text-sm ${isCompleted ? 'bg-muted text-muted-foreground border-transparent cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20'}`}
                          onClick={() => !isCompleted && onStartExam(exam)}
                          disabled={isCompleted}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Initialize Exam
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  )})}
                </div>
              ) : (
                <Card className="bg-background border-dashed border-border/50">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Shield className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No active deployments available.</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div variants={item} className="space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-xl font-medium tracking-tight flex items-center gap-2">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Attempt Log
              </h2>
              <Card className="bg-card/50 border-border">
                <ScrollArea className="h-[320px] sm:h-[400px]">
                  {submissions.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {submissions.map((attempt: any) => (
                        <div key={attempt.id} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="font-medium text-sm leading-tight mb-1 truncate">{attempt.exam_title || attempt.exams?.title}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {format(new Date(attempt.created_at), 'MMM d, yyyy HH:mm')}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-primary text-sm">
                                {Math.round((attempt.score / (attempt.total_marks || 1)) * 100)}%
                              </span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No logs found.
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ==========================================
// 3. EXAM TAKING VIEW (Exact Replit UI)
// ==========================================
function ExamTakingView({ exam, questions, onSubmit, user }: any) {
  const [timeLeft, setTimeLeft] = useState((exam?.duration_minutes || 60) * 60);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const isSubmittingRef = useRef(false);

  const processSubmit = useCallback((auto = false) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsProcessing(true);
    onSubmit(answers, auto, 0, (exam?.duration_minutes || 60) * 60 - timeLeft);
  }, [answers, timeLeft, exam, onSubmit]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); processSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, processSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col cursor-default select-none">
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
            <h1 className="text-2xl font-bold tracking-tight mb-2">Analyzing Responses</h1>
            <p className="text-muted-foreground">Evaluating your answers...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-card border-b border-border/50 select-none">
        <div className="flex items-center justify-between px-4 pt-3 pb-2 sm:hidden">
          <span className="font-bold text-sm truncate max-w-[55%]">{exam.title}</span>
        </div>
        <div className="flex items-center justify-between px-4 pb-3 sm:hidden">
          <div className="flex items-center gap-1.5 font-mono font-bold text-lg tracking-wider">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={timeLeft < 300 ? "text-destructive animate-pulse" : "text-primary"}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary/90 font-bold text-xs" onClick={() => processSubmit(false)}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> SUBMIT
          </Button>
        </div>

        <div className="hidden sm:flex items-center justify-between py-3 px-6">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-bold tracking-tight text-base truncate max-w-xs">{exam.title}</span>
            <div className="h-4 w-px bg-border" />
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 text-xl font-mono font-bold tracking-wider">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className={timeLeft < 300 ? "text-destructive animate-pulse" : "text-primary"}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={() => processSubmit(false)}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> SUBMIT EXAM
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-10 pb-24">
        {questions.map((q: any, idx: number) => (
          <div key={q.id} className="space-y-4">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-bold font-mono border border-border mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex justify-between items-start gap-3">
                  <h3 className="text-base sm:text-lg font-medium leading-relaxed">{q.question}</h3>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded border border-border shrink-0">
                    {q.marks} pts
                  </span>
                </div>

                {(() => {
                  const isMcq = q.question_type?.toLowerCase() === 'mcq' || (Array.isArray(q.options) && q.options.length > 0 && q.options[0] !== "");
                  return isMcq ? (
                  <RadioGroup 
                    className="space-y-2 mt-3" 
                    value={answers[q.id] || ""} 
                    onValueChange={(val) => setAnswers(p => ({ ...p, [q.id]: val }))}
                  >
                    {(Array.isArray(q.options) ? q.options : []).map((opt: string, i: number) => (
                      <div 
                        key={i} 
                        className="flex items-center space-x-3 bg-card p-3 sm:p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" 
                        onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                      >
                        <RadioGroupItem value={opt} id={`q${q.id}-opt${i}`} />
                        <Label htmlFor={`q${q.id}-opt${i}`} className="flex-1 text-sm sm:text-base cursor-pointer font-normal leading-relaxed">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  ) : (
                  <Textarea 
                    className="min-h-[160px] sm:min-h-[200px] mt-3 bg-card border-border/50 focus-visible:ring-primary text-sm sm:text-base leading-relaxed font-sans resize-y"
                    placeholder="Enter your answer here or write code..."
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                  />
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

// ==========================================
// 4. RESULTS VIEW (Exact Replit UI)
// ==========================================
function ResultsView({ result, onBack }: any) {
  const percentage = Math.round((result.score / result.total) * 100);
  const isPass = percentage >= 50;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground -ml-2 px-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="text-sm">Dashboard</span>
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary opacity-50" />
            <span className="font-medium text-xs sm:text-sm text-muted-foreground">Analysis Report</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 mt-6 sm:mt-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-2 mb-8 sm:mb-12">
            <motion.div variants={item} className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-card border border-border shadow-2xl mb-4 relative">
              <div className={`absolute inset-0 rounded-full border-4 ${isPass ? 'border-primary' : 'border-destructive'} opacity-20`} />
              <span className="text-2xl sm:text-3xl font-bold">{percentage}%</span>
            </motion.div>
            <motion.h1 variants={item} className="text-xl sm:text-3xl font-bold tracking-tight px-4">
              {result.title}
            </motion.h1>
            <motion.p variants={item} className="text-muted-foreground font-mono text-xs sm:text-sm uppercase tracking-wider">
              Status:{" "}
              {isPass ? <span className="text-primary font-bold">PASSED</span> : <span className="text-destructive font-bold">FAILED</span>}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <motion.div variants={item}>
              <Card className="bg-card border-border">
                <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Final Score</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {Math.round(result.score)} <span className="text-sm sm:text-lg text-muted-foreground font-normal">/ {result.total} pts</span>
                    </p>
                  </div>
                  <Award className={`w-7 h-7 sm:w-8 sm:h-8 ${isPass ? 'text-primary' : 'text-muted-foreground'}`} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {result.breakdown && (
            <motion.div variants={item} className="space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-xl font-medium tracking-tight flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Evaluation Breakdown
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {result.breakdown.map((b: any, i: number) => (
                  <Card key={i} className="bg-card/50 border-border overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="flex flex-col items-center gap-2 pt-0.5 shrink-0">
                          {b.score > 0 ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <XCircle className="w-5 h-5 text-destructive" />}
                          <Badge variant="outline" className="font-mono text-[10px] px-1.5 bg-background">Q{i + 1}</Badge>
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0 space-y-3">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Question</p>
                                <p className="text-sm font-medium leading-relaxed">{b.question || "Unknown Question"}</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Your Answer</p>
                                  <div className={`p-2 rounded border text-xs sm:text-sm ${b.score > 0 ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-destructive/5 border-destructive/20 text-destructive'}`}>
                                    {b.user_answer || <span className="italic opacity-50">No answer provided</span>}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Correct Answer</p>
                                  <div className="p-2 rounded border bg-muted/40 border-border text-xs sm:text-sm text-foreground">
                                    {b.correct_answer || <span className="italic opacity-50">N/A</span>}
                                  </div>
                                </div>
                              </div>
                              {b.feedback && b.feedback !== "PASSED" && b.feedback !== "FAILED" && b.feedback !== "GRADE_OK" && (
                                <div className="bg-background/50 p-2 sm:p-3 rounded border border-border/50 mt-2">
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">AI Context & Feedback</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{b.feedback}</p>
                                </div>
                              )}
                            </div>
                            <span className="font-mono font-bold text-xs bg-muted px-2 py-1 rounded border border-border shrink-0">{b.score} pts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
// ==========================================
// MAIN CONTROLLER
// ==========================================
export default function SphnsExmTest() {
  const { toast } = useToast();
  const [userDetails, setUserDetails] = useState<any>(null);
  
  const [phase, setPhase] = useState<"auth" | "dashboard" | "exam" | "results" | "error">("auth");
  const [insertErrorData, setInsertErrorData] = useState<string>("");
  const [exams, setExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedEx, setSelectedEx] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [confirmData, setConfirmData] = useState({ name: "", roll: "" });
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current && userDetails) {
      hasInitializedRef.current = true;
      fetchData();
      setPhase("dashboard");
    } else if (!userDetails) {
      hasInitializedRef.current = false;
      setPhase("auth");
    }
  }, [userDetails]);


  const fetchData = async () => {
    const { data } = await (supabaseAdmin || supabase).from("exams").select("*").eq("is_active", true).order("created_at", { ascending: false });
    if (data) setExams(data); else setExams([]);
    setSubmissions([]); // Skip loading past submissions for anonymous test
  };

  const handleStartExam = async (ex: any) => {
    setSelectedEx(ex);
    setConfirmData({
      name: userDetails?.name || "",
      roll: userDetails?.phone || ""
    });
    setShowConfirmStart(true);
  };

  const finalizeStartExam = async () => {
    if (!selectedEx) return;
    const { data: qData } = await (supabaseAdmin || supabase).from("exam_questions").select("*").eq("exam_id", selectedEx.id).order("sort_order", { ascending: true });
    if (qData) {
      setQuestions(shuffleArray(qData.map(q => ({ ...q, options: typeof q.options === "string" ? JSON.parse(q.options) : (q.options || []) }))));
      setShowConfirmStart(false);
      setPhase("exam");
    }
  };

  const handleSubmitExam = async (answers: Record<number, string>, auto: boolean, violations: number, timeTakenSeconds: number) => {
    let score = 0; let total = 0; const results: any[] = []; const aiItems: any[] = [];
    questions.forEach((q, i) => {
      total += q.marks; 
      const ans = (answers[q.id] || "").trim(); 
      const cor = (q.correct_answer || "").trim();
      const isMcq = q.question_type?.toLowerCase() === 'mcq' || (Array.isArray(q.options) && q.options.length > 0 && q.options[0] !== "");
      
      if (isMcq) {
        const match = cor.toLowerCase().split("|").some((a: string) => a.trim() === ans.toLowerCase());
        const s = match ? q.marks : 0; score += s;
        // Map to exact index for breakdown UI alignment
        results[i] = { question: q.question, user_answer: ans, correct_answer: cor, score: s, max: q.marks, feedback: s > 0 ? "PASSED" : "FAILED" };
      } else {
        // Only use AI if NO correct_answer matches perfectly first
        // If they provided a correct answer and no options, standard regex first
        if (cor && cor.toLowerCase() === ans.toLowerCase()) {
           score += q.marks;
           results[i] = { question: q.question, user_answer: ans, correct_answer: cor, score: q.marks, max: q.marks, feedback: "GRADE_OK" };
        } else {
           aiItems.push({ question: q.question, correctAnswer: cor, userAnswer: ans, maxMarks: q.marks, arrayIndex: i });
        }
      }
    });

    try {
      if (aiItems.length > 0) {
        toast({ title: "Grading Exam...", description: "AI is verifying qualitative answers." });
        const aiResults = await gradeExam(aiItems);
        aiItems.forEach((item, idx) => { 
          const r = aiResults[idx]; const s = r?.score || 0; score += s; 
          results[item.arrayIndex] = { question: item.question, user_answer: item.userAnswer, correct_answer: item.correctAnswer, score: s, max: item.maxMarks, feedback: r?.feedback || "GRADE_OK" }; 
        });
      }
      
      // Filter out any undefined slots just in case
      const compactResults = results.filter(Boolean);
      
      // Use Admin Client if available to bypass RLS issues during submission
      const adminClient = supabaseAdmin || supabase;
      
      const insertPromise = adminClient.from("exam_submissions").insert({
        exam_id: selectedEx?.id,
        user_id: null,
        score,
        total_marks: total,
        time_used_seconds: timeTakenSeconds,
        status: auto ? "auto_submitted" : "completed",
        answers: { ...answers, _breakdown: compactResults, student_details: userDetails },
        violations: violations,
        exam_title: selectedEx?.title,
        student_name: confirmData.name || "Student",
        roll_number: confirmData.roll || "Unknown"
      });

      const { data: _data, error: insertErr } = await Promise.race([
        insertPromise,
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Database connection timed out during submission.")), 15000))
      ]);
      
      if (insertErr) {
        console.error("[Submit] Insertion error: ", insertErr);
        // If it's a specific column error, we might want to know
        toast({ 
          variant: "destructive", 
          title: "Submission Error", 
          description: insertErr.message || "Failed to save submission." 
        });
        setInsertErrorData(JSON.stringify(insertErr, null, 2));
        setPhase("error");
        return;
      }
      
      console.log("[Submit] Success, switching to results");
      setEvalResult({ score, total, violations, title: selectedEx?.title, breakdown: compactResults });
      setPhase("results");
      
      // Force immediate refresh of telemetry
      setTimeout(() => fetchData(), 500);
    } catch (e: any) {
      console.error("[Submit] Fatal error: ", e);
      toast({ variant: "destructive", title: "Fatal Error", description: e.message });
      setPhase("dashboard");
    }
  };

  const handleLogout = async () => {
    setUserDetails(null);
    setPhase("auth");
  };

  return (
    <>
      {phase === "auth" && <DetailsView onAuthSuccess={() => setPhase("dashboard")} onSetUserDetails={setUserDetails} />}
      {phase === "dashboard" && <DashboardView exams={exams} submissions={submissions} onStartExam={handleStartExam} onLogout={handleLogout} user={userDetails} />}
      {phase === "exam" && <ExamTakingView exam={selectedEx} questions={questions} onSubmit={handleSubmitExam} user={userDetails} />}
      {phase === "results" && <ResultsView result={evalResult} onBack={() => { setEvalResult(null); setPhase("dashboard"); }} />}
      
      <Dialog open={showRegDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Profile Registration</DialogTitle>
            <DialogDescription>
              Complete your profile identification to proceed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegSubmit} className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label htmlFor="reg-name">Full Name</Label>
              <Input id="reg-name" required value={regData.full_name} onChange={e => setRegData({...regData, full_name: e.target.value})} placeholder="Ex: Jashwanth Singh" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reg-roll">Roll Number / ID</Label>
              <Input id="reg-roll" required value={regData.roll_number} onChange={e => setRegData({...regData, roll_number: e.target.value})} placeholder="Ex: 24N81A6..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="reg-year">Year</Label>
                <select 
                  id="reg-year"
                  required
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-sm"
                  value={regData.year}
                  onChange={e => setRegData({...regData, year: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-section">Section</Label>
                <Input id="reg-section" required value={regData.section} onChange={e => setRegData({...regData, section: e.target.value})} placeholder="A" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="reg-dept">Department</Label>
              <Input id="reg-dept" required value={regData.department} onChange={e => setRegData({...regData, department: e.target.value})} placeholder="CSE" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reg-college">College</Label>
              <Input id="reg-college" required value={regData.college} onChange={e => setRegData({...regData, college: e.target.value})} placeholder="College Name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reg-phone">Phone Number</Label>
              <Input id="reg-phone" required value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} placeholder="+91..." />
            </div>
            <Button type="submit" className="w-full">Save Profile</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmStart} onOpenChange={setShowConfirmStart}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Confirm Identity</DialogTitle>
            <DialogDescription>
              Verify your details before starting <strong>{selectedEx?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label htmlFor="confirm-name">Full Name</Label>
              <Input 
                id="confirm-name" 
                value={confirmData.name} 
                onChange={e => setConfirmData({...confirmData, name: e.target.value})} 
                placeholder="Ex: Jashwanth Singh"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-roll">Roll Number (ID)</Label>
              <Input 
                id="confirm-roll" 
                value={confirmData.roll} 
                onChange={e => setConfirmData({...confirmData, roll: e.target.value})} 
                placeholder="Ex: 24N81A6..."
              />
            </div>
            <Button onClick={finalizeStartExam} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              START EXAM
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {phase === "error" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
          <div className="bg-destructive/10 text-destructive p-8 rounded-lg max-w-2xl w-full font-mono whitespace-pre-wrap break-words shadow-xl border border-destructive/30">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              DATABASE INSERTION ERROR
            </h2>
            <p>Please screenshot this and show it to the AI:</p>
            <div className="mt-4 p-4 bg-background border border-destructive/20 rounded shadow-inner text-sm text-foreground overflow-auto">
              {insertErrorData}
            </div>
            <Button className="mt-6" onClick={() => setPhase("dashboard")}>Return to Dashboard</Button>
          </div>
        </div>
      )}
    </>
  );
}


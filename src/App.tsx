import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AIChatbot from "@/components/AIChatbot";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Subject from "./pages/Subject";
import AdminUpload from "./pages/AdminUpload";
import AdminPanel from "./pages/AdminPanel";
import Calculator from "./pages/Calculator";
import Games from "./pages/Games";
import SnakeGame from "./pages/SnakeGame";
import FlappyBirdGame from "./pages/FlappyBirdGame";
import Game2048 from "./pages/Game2048";
import DailyQuiz from "./pages/DailyQuiz";
import Timetable from "./pages/Timetable";
import ExamDates from "./pages/ExamDates";
import Announcements from "./pages/Announcements";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/games" element={<Games />} />
                <Route path="/games/snake" element={<SnakeGame />} />
                <Route path="/games/flappy-bird" element={<FlappyBirdGame />} />
                <Route path="/games/2048" element={<Game2048 />} />
                <Route path="/quiz" element={<DailyQuiz />} />
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/subject/:id" element={<Subject />} />
                  <Route path="/timetable" element={<Timetable />} />
                  <Route path="/exam-dates" element={<ExamDates />} />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/admin/upload" element={<AdminUpload />} />
                  <Route path="/admin/panel" element={<AdminPanel />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AIChatbot />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
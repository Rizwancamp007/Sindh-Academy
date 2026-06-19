import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ParticleBackground } from './components/ParticleBackground';
import { Home } from './views/Home';
import { Login } from './views/Login';
import { Dashboard, StudentDashboardView, ClerkDashboardView, TeacherDashboardView, AdminDashboardView } from './views/Dashboard';
import { ExamEngine } from './views/ExamEngine';
import { About } from './views/About';
import { Lectures } from './views/Lectures';
import { Contact } from './views/Contact';
import { SearchMcqs } from './views/SearchMcqs';
import { Footer } from './components/Footer';
import './index.css';

const AppLayout = () => {
  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/lectures" element={<Lectures />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search-mcqs" element={<SearchMcqs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboardView />} />
          <Route path="/dashboard/clerk" element={<ClerkDashboardView />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboardView />} />
          <Route path="/dashboard/admin" element={<AdminDashboardView />} />
          <Route path="/exam/:id" element={<ExamEngine />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

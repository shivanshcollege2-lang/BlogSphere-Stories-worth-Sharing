import { Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import BlogEditorPage from './pages/BlogEditorPage.jsx';
import BlogDetailPage from './pages/BlogDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ErrorPage from './pages/ErrorPage.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create" element={<BlogEditorPage />} />
            <Route path="/blogs/:id/edit" element={<BlogEditorPage edit />} />
            <Route path="/profile" element={<ProfilePage own />} />
          </Route>
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="site-footer"><span>© {new Date().getFullYear()} BlogSphere</span><span>Thoughtful stories, shared.</span><a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back to top ↑</a></footer>
    </>
  );
}

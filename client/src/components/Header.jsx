import { BookOpen, Feather, LogOut, Menu, Plus, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Header() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
      toast('You are signed out.');
      navigate('/');
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="BlogSphere home">
          <span className="brand-mark"><BookOpen size={19} /></span>
          <span>blog<span className="brand-accent">sphere</span></span>
        </Link>
        <button className="mobile-menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Explore</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>My stories</NavLink>
              <Link className="nav-write" to="/create"><Plus size={16} /> Write a story</Link>
              <Link className="avatar-link" to="/profile"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><span className="profile-name">{user.name.split(' ')[0]}</span></Link>
              <button className="nav-icon-button" onClick={handleSignOut} aria-label="Sign out"><LogOut size={17} /></button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link className="nav-write" to="/register"><Feather size={15} /> Join the community</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

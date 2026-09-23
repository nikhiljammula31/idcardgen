import React, { useState, useEffect, useRef } from 'react';
import CardForm from './components/CardForm';
import CardPreview from './components/CardPreview';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import StudentManagement from './components/StudentManagement';
import VerificationPage from './components/VerificationPage';
import SplashScreen from './components/SplashScreen';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 🌌 Live Frosted Glass Background Component with Interactive Blue Cursor Glow
const LiveBackground = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }

    const glowEl = glowRef.current;
    if (!glowEl) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isVisible = false;
    let animationFrameId;

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        glowEl.style.opacity = '1';
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      glowEl.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      glowEl.style.opacity = '1';
    };

    const updatePosition = () => {
      // Smooth linear interpolation (lerp) for natural floating/lagging feel
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      glowEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="live-bg-container" aria-hidden="true">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>
      <div className="bg-orb orb-4"></div>
      <div ref={glowRef} className="cursor-glow"></div>
    </div>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme_preference');
    if (saved) return saved;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [adminToken, setAdminToken] = useState(() => {
    return (
      sessionStorage.getItem('admin_token') ||
      localStorage.getItem('admin_token') ||
      ''
    );
  });

  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    rollNo: '',
    collegeName: "Vignan's University",
    department: '',
    batch: '',
    bloodGroup: '',
    phoneNumber: '',
    residenceType: '',
    fatherName: '',
    address: '',
    status: 'ACTIVE',
    photo: ''
  });

  const [savedCards, setSavedCards] = useState([]);
  const [notification, setNotification] = useState({ text: '', type: '' });
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    fullName: '',
    rollNo: '',
    collegeName: "Vignan's University",
    department: '',
    batch: '',
    bloodGroup: '',
    phoneNumber: '',
    residenceType: '',
    fatherName: '',
    address: '',
    status: 'ACTIVE',
    photo: ''
  });

  // Apply theme to body
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme_preference', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Navigation helper
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch cards from backend
  const fetchBackendCards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cards`);
      if (response.ok) {
        const data = await response.json();
        setSavedCards(data);
        localStorage.setItem('digital_id_cards', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch cards from backend:', err);
      const localData = localStorage.getItem('digital_id_cards');
      if (localData) {
        try {
          setSavedCards(JSON.parse(localData));
        } catch {
          setSavedCards([]);
        }
      }
    }
  };

  useEffect(() => {
    fetchBackendCards();
  }, []);

  const showNotification = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification({ text: '', type: '' });
    }, 4000);
  };

  const handleLoginSuccess = (token) => {
    const t = token || 'admin-session-' + Date.now();
    setAdminToken(t);
    sessionStorage.setItem('admin_token', t);
    localStorage.setItem('admin_token', t);
    showNotification('Logged in successfully.', 'success');
    navigate('/admin');
  };

  const handleLogout = () => {
    setAdminToken('');
    sessionStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token');
    showNotification('Logged out successfully.', 'info');
    navigate('/admin/login');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        photo: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFormReset = () => {
    setFormData({
      id: '',
      fullName: '',
      rollNo: '',
      collegeName: "Vignan's University",
      department: '',
      batch: '',
      bloodGroup: '',
      phoneNumber: '',
      residenceType: '',
      fatherName: '',
      address: '',
      status: 'ACTIVE',
      photo: ''
    });
  };

  const handleSaveToDatabase = async () => {
    if (!formData.fullName || !formData.rollNo) {
      alert('Please fill out at least Student Name and Roll Number.');
      return;
    }

    if (!formData.residenceType) {
      alert('Please select a Residence / Student Type (Day Scholar or Hostler).');
      return;
    }

    const existingCard = savedCards.find(
      (card) =>
        card.rollNo?.toLowerCase() === formData.rollNo.toLowerCase()
    );

    const cardToSave = {
      ...formData,
      status: formData.status || 'ACTIVE',
      id: formData.id || existingCard?.id || crypto.randomUUID()
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cards/${cardToSave.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardToSave)
        }
      );

      if (!response.ok) {
        throw new Error('Unable to save ID card to backend.');
      }

      const result = await response.json();
      const savedCard = result.card;

      setFormData(savedCard);
      await fetchBackendCards();
      showNotification('ID card saved successfully!', 'success');
      return savedCard;
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to save ID card.');
      throw error;
    }
  };

  const prepareCardForDownload = async () => {
    if (!formData.fullName || !formData.rollNo) {
      throw new Error('Please enter the student name and roll number.');
    }

    if (!formData.residenceType) {
      throw new Error('Please select a Residence / Student Type (Day Scholar or Hostler).');
    }

    const existingCard = savedCards.find(
      (card) =>
        card.rollNo?.toLowerCase() === formData.rollNo.toLowerCase()
    );

    const cardToSave = {
      ...formData,
      status: formData.status || 'ACTIVE',
      id: formData.id || existingCard?.id || crypto.randomUUID()
    };

    const response = await fetch(
      `${API_BASE_URL}/api/cards/${cardToSave.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardToSave)
      }
    );

    if (!response.ok) {
      throw new Error('Unable to save student verification data.');
    }

    const result = await response.json();
    const savedCard = result.card;

    setFormData(savedCard);
    await fetchBackendCards();
    return savedCard;
  };

  // Admin New Student handler
  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudentData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewStudentImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewStudentData((prev) => ({
        ...prev,
        photo: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewStudent = async (e) => {
    e.preventDefault();
    if (!newStudentData.fullName || !newStudentData.rollNo) {
      showNotification('Please fill out Name and Roll Number.', 'error');
      return;
    }

    if (!newStudentData.residenceType) {
      showNotification('Please select a Residence / Student Type (Day Scholar or Hostler).', 'error');
      return;
    }

    try {
      const studentToCreate = {
        ...newStudentData,
        id: crypto.randomUUID(),
        status: newStudentData.status || 'ACTIVE'
      };

      const response = await fetch(`${API_BASE_URL}/api/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentToCreate)
      });

      if (!response.ok) {
        throw new Error('Failed to create student on backend.');
      }

      showNotification('Student added successfully.', 'success');
      setIsAddStudentOpen(false);
      setNewStudentData({
        fullName: '',
        rollNo: '',
        collegeName: "Vignan's University",
        department: '',
        batch: '',
        bloodGroup: '',
        phoneNumber: '',
        residenceType: '',
        fatherName: '',
        address: '',
        status: 'ACTIVE',
        photo: ''
      });
      await fetchBackendCards();
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'Failed to add student.', 'error');
    }
  };

  // 1. Verification Page Route: /verify/:cardId
  const verifyMatch = currentPath.match(/^\/verify\/([^/]+)$/);
  if (verifyMatch) {
    return (
      <>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <LiveBackground />
        <VerificationPage
          cardId={decodeURIComponent(verifyMatch[1])}
          apiBaseUrl={API_BASE_URL}
        />
      </>
    );
  }

  // 2. Admin Login Route: /admin/login
  if (currentPath === '/admin/login') {
    if (adminToken) {
      navigate('/admin');
      return null;
    }

    return (
      <div className="app-container">
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <LiveBackground />
        <nav className="nav-bar">
          <div className="nav-logo" onClick={() => navigate('/')}>
            🎓 <span>ID PORTAL</span>
          </div>
          <div className="nav-actions">
            <button
              className="nav-btn"
              onClick={() => navigate('/')}
            >
              Public Generator
            </button>
            <button
              className="nav-btn active"
              onClick={() => navigate('/admin/login')}
            >
              Admin Login 🔑
            </button>
            <button
              className="nav-btn btn-theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>

        {notification.text && (
          <div className={`status-banner ${notification.type}-banner`}>
            {notification.text}
          </div>
        )}

        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          apiBaseUrl={API_BASE_URL}
        />
      </div>
    );
  }

  // 3. Protected Admin Routes: /admin and /admin/students
  if (currentPath.startsWith('/admin')) {
    if (!adminToken) {
      navigate('/admin/login');
      return null;
    }

    return (
      <div className="app-container">
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <LiveBackground />
        {/* Admin Navigation */}
        <nav className="nav-bar admin-nav">
          <div className="nav-logo" onClick={() => navigate('/admin')}>
            🛡️ <span>ADMIN PANEL</span>
          </div>

          <div className="nav-actions">
            <button
              className={`nav-btn ${
                currentPath === '/admin' ? 'active' : ''
              }`}
              onClick={() => navigate('/admin')}
            >
              Dashboard
            </button>
            <button
              className={`nav-btn ${
                currentPath === '/admin/students' ? 'active' : ''
              }`}
              onClick={() => navigate('/admin/students')}
            >
              Students
            </button>
            <button
              className="nav-btn"
              onClick={() => navigate('/')}
              title="Go to Public Generator"
            >
              Public Generator ↗
            </button>
            <button
              className="nav-btn btn-theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              className="nav-btn btn-logout"
              onClick={handleLogout}
            >
              Logout 🔒
            </button>
          </div>
        </nav>

        {notification.text && (
          <div className={`status-banner ${notification.type}-banner`}>
            {notification.text}
          </div>
        )}

        {/* Admin Dashboard */}
        {currentPath === '/admin' && (
          <AdminDashboard
            students={savedCards}
            onNavigate={navigate}
            onOpenAddModal={() => setIsAddStudentOpen(true)}
          />
        )}

        {/* Student Management */}
        {currentPath === '/admin/students' && (
          <StudentManagement
            students={savedCards}
            onRefresh={fetchBackendCards}
            apiBaseUrl={API_BASE_URL}
            onShowMessage={showNotification}
          />
        )}

        {/* Global Add Student Modal for Admin */}
        {isAddStudentOpen && (
          <div
            className="modal-backdrop"
            onClick={() => setIsAddStudentOpen(false)}
          >
            <div
              className="modal-content modal-edit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Add New Student</h3>
                <button
                  className="btn-close-modal"
                  onClick={() => setIsAddStudentOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <CardForm
                  formData={newStudentData}
                  handleChange={handleNewStudentChange}
                  handleImageUpload={handleNewStudentImageUpload}
                  handleReset={() =>
                    setNewStudentData({
                      fullName: '',
                      rollNo: '',
                      collegeName: "Vignan's University",
                      department: '',
                      batch: '',
                      bloodGroup: '',
                      phoneNumber: '',
                      residenceType: '',
                      fatherName: '',
                      address: '',
                      status: 'ACTIVE',
                      photo: ''
                    })
                  }
                  handleSave={handleSaveNewStudent}
                  isAdmin={true}
                  onCancel={() => setIsAddStudentOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. Default Route: Public Student Generator (/)
  return (
    <div className="app-container">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <LiveBackground />
      <nav className="nav-bar">
        <div className="nav-logo" onClick={() => navigate('/')}>
          🎓 <span>ID PORTAL</span>
        </div>

        <div className="nav-actions">
          <button
            className="nav-btn active"
            onClick={() => navigate('/')}
          >
            Public Generator
          </button>

          {adminToken ? (
            <>
              <button
                className="nav-btn"
                onClick={() => navigate('/admin')}
              >
                Admin Dashboard 🛡️
              </button>
              <button
                className="nav-btn btn-logout"
                onClick={handleLogout}
              >
                Logout 🔒
              </button>
            </>
          ) : (
            <button
              className="nav-btn btn-login-nav"
              onClick={() => navigate('/admin/login')}
            >
              Admin Login 🔑
            </button>
          )}

          <button
            className="nav-btn btn-theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <header className="app-header">
        <h1>Digital ID Card Generator</h1>
        <p>Fill out your details to preview and download your credentials.</p>
      </header>

      {notification.text && (
        <div className={`status-banner ${notification.type}-banner`}>
          {notification.text}
        </div>
      )}

      <div className="main-content">
        <CardForm
          formData={formData}
          handleChange={handleFormChange}
          handleImageUpload={handleFormImageUpload}
          handleReset={handleFormReset}
          handleSave={handleSaveToDatabase}
          isAdmin={false}
        />

        <CardPreview
          formData={formData}
          onPrepareDownload={prepareCardForDownload}
        />
      </div>
    </div>
  );
}

export default App;
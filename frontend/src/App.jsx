import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import './App.css';

const API = 'https://demonicade-ai-content-moderator.hf.space';

const AVATARS = [
  { id: 1, char: '🦊', label: 'Neon Fox', bg: 'linear-gradient(135deg, #ff6b6b, #ff8e53)' },
  { id: 2, char: '🦁', label: 'Gold Lion', bg: 'linear-gradient(135deg, #ffe066, #f59f00)' },
  { id: 3, char: '🐼', label: 'Slate Panda', bg: 'linear-gradient(135deg, #adb5bd, #495057)' },
  { id: 4, char: '🐨', label: 'Cool Koala', bg: 'linear-gradient(135deg, #d0ebff, #228be6)' },
  { id: 5, char: '🦄', label: 'Magic Unicorn', bg: 'linear-gradient(135deg, #f3d9fa, #b197fc)' },
  { id: 6, char: '🐉', label: 'Emerald Dragon', bg: 'linear-gradient(135deg, #c3fae8, #12b886)' },
  { id: 7, char: '🦖', label: 'Lime Rex', bg: 'linear-gradient(135deg, #e2f9b8, #82c91e)' },
  { id: 8, char: '🦉', label: 'Wise Owl', bg: 'linear-gradient(135deg, #dbe4ff, #4c6ef5)' },
  { id: 9, char: '🐯', label: 'Sunset Tiger', bg: 'linear-gradient(135deg, #ffe8cc, #fd7e14)' },
  { id: 10, char: '🐸', label: 'Teal Frog', bg: 'linear-gradient(135deg, #e6fffa, #00c9a7)' },
  { id: 11, char: '🐙', label: 'Coral Octopus', bg: 'linear-gradient(135deg, #ffe3e3, #ff6b6b)' },
  { id: 12, char: '🐬', label: 'Azure Dolphin', bg: 'linear-gradient(135deg, #e3fafc, #15aabf)' },
  { id: 13, char: '🦅', label: 'Bronze Eagle', bg: 'linear-gradient(135deg, #f8f9fa, #868e96)' },
  { id: 14, char: '🐝', label: 'Honey Bee', bg: 'linear-gradient(135deg, #fff9db, #fab005)' },
  { id: 15, char: '🦋', label: 'Pink Butterfly', bg: 'linear-gradient(135deg, #fff0f6, #f783ac)' },
  { id: 16, char: '🐺', label: 'Midnight Wolf', bg: 'linear-gradient(135deg, #e8f4fd, #1c7ed6)' },
];

const GOOGLE_CLIENT_ID = "889169728880-cmvg520dv4nlf5tgimcpsrl78ldom54v.apps.googleusercontent.com"; // Production client ID with Vercel domain authorized
const USE_REAL_GOOGLE_LOGIN = true; // Set to true after deploying to enable actual Google login popup

const ADMIN_EMAILS = [
  'kushwahaabhay828@gmail.com',
  'abhay.kushwaha2021@vitbhopal.ac.in',
  'kushwahaabhay829@gmail.com',
  'ayushimishra.engg@gmail.com'
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [isLightMode, setIsLightMode] = useState(true);

  // Initialize Real Google Sign-In (GSI) with Invisible Overlay Button
  useEffect(() => {
    if (!USE_REAL_GOOGLE_LOGIN) return;
    
    /* global google */
    const renderGoogleBtn = () => {
      if (window.google && document.getElementById("google-signin-btn-container")) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              try {
                const token = response.credential;
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const googleUser = JSON.parse(jsonPayload);
                
                // Map Google OAuth returned details to our local application state
                const dynamicUser = {
                  username: googleUser.email.split('@')[0],
                  firstName: googleUser.given_name || googleUser.name.split(' ')[0] || 'User',
                  surname: googleUser.family_name || googleUser.name.split(' ')[1] || '',
                  email: googleUser.email.toLowerCase(),
                  mobile: '',
                  country: 'India',
                  avatarId: 4, // Slate Panda / Koala as default cool styling
                  picture: googleUser.picture
                };

                const isUserAdmin = ADMIN_EMAILS.includes(dynamicUser.email.toLowerCase());
                const finalUser = { ...dynamicUser, isAdmin: isUserAdmin };

                // Sync to local registered users list so system recognizes them seamlessly
                const registeredUsersList = JSON.parse(localStorage.getItem('registered_users') || '[]');
                const existingIdx = registeredUsersList.findIndex(u => u.email.toLowerCase() === finalUser.email.toLowerCase());
                if (existingIdx === -1) {
                  registeredUsersList.push({ ...finalUser, password: 'google_oauth_bypass' });
                  localStorage.setItem('registered_users', JSON.stringify(registeredUsersList));
                } else {
                  registeredUsersList[existingIdx].isAdmin = isUserAdmin;
                  localStorage.setItem('registered_users', JSON.stringify(registeredUsersList));
                }

                setCurrentUser(finalUser);
                setIsAuthenticated(true);
                const userHistory = JSON.parse(localStorage.getItem('history_' + finalUser.email) || '[]');
                setSubmissions(userHistory);
                setError(null);
                
                if (isUserAdmin) {
                  setRegisteredUsers(registeredUsersList);
                }
              } catch (err) {
                console.error("JWT Decode Error:", err);
                setError("Failed to decode Google Sign-In details.");
              }
            }
          });

          // Render the official Google button inside our invisible container
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-btn-container"),
            { 
              theme: "outline", 
              size: "large", 
              width: document.getElementById("google-signin-btn-container").offsetWidth || 300 
            }
          );
        } catch (err) {
          console.error("Google Client Init/Render Error:", err);
        }
      }
    };

    // Try rendering immediately, or wait a bit if window.google is loading asynchronously
    renderGoogleBtn();
    const interval = setInterval(() => {
      if (window.google && document.getElementById("google-signin-btn-container")) {
        renderGoogleBtn();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isAuthenticated, showGooglePopup]);

  const handleContinueWithGoogleClick = () => {
    if (!USE_REAL_GOOGLE_LOGIN || !window.google) {
      setShowGooglePopup(true);
    }
  };
  const [currentUser, setCurrentUser] = useState({
    username: 'abhayk',
    firstName: 'Abhay',
    surname: 'Kushwaha',
    email: 'kushwahaabhay829@gmail.com',
    mobile: '+91 9876543210',
    country: 'India',
    avatarId: 1,
    isAdmin: true
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('connectors');
  const [tempFullName, setTempFullName] = useState('Abhay Kushwaha');
  const [tempEmail, setTempEmail] = useState('kushwahaabhay829@gmail.com');
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [dataCollection, setDataCollection] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Sync temp variables when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setTempFullName(`${currentUser.firstName || ''} ${currentUser.surname || ''}`.trim());
      setTempEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleUpdateProfile = () => {
    if (!tempFullName.trim() || !tempEmail.trim()) {
      alert("Please fill in all fields!");
      return;
    }
    const parts = tempFullName.trim().split(' ');
    const firstName = parts[0] || '';
    const surname = parts.slice(1).join(' ') || '';
    
    setCurrentUser({
      ...currentUser,
      firstName: firstName,
      surname: surname,
      email: tempEmail
    });
    setSettingsMessage("Profile updated successfully!");
    setTimeout(() => setSettingsMessage(null), 3000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("⚠️ Danger! Are you absolutely sure you want to permanently delete your account? This action cannot be undone.")) {
      setCurrentUser(null);
      setShowSettings(false);
      setSettingsMessage(null);
    }
  };

  const handleDownloadMyData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      user: currentUser,
      stats: {
        totalScans: stats?.totalScans || 0,
        safePercentage: stats?.safePercentage || 100
      },
      history: submissions || [],
      preferences: {
        apiLanguage: apiLang,
        notifications: notificationsEnabled,
        dataCollection: dataCollection,
        saveHistory: saveHistory
      }
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `content_moderation_ai_user_data_${currentUser?.username || 'user'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSettingsMessage("Your personal data backup has been generated and downloaded!");
    setTimeout(() => setSettingsMessage(null), 4000);
  };
  const [activeDocSection, setActiveDocSection] = useState('overview');
  const [apiLang, setApiLang] = useState('python');
  
  const [authMode, setAuthMode] = useState('signup'); // Default to signup
  const [signupStep, setSignupStep] = useState(1);
  const [authForm, setAuthForm] = useState({
    username: '',
    firstName: '',
    surname: '',
    email: '',
    mobile: '',
    country: '',
    avatarId: 1,
    password: ''
  });

  // Admin Portal Specific States
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    username: '',
    firstName: '',
    surname: '',
    email: '',
    mobile: '',
    country: '',
    avatarId: 1,
    password: ''
  });

  const [tab, setTab] = useState('home');
  const [modType, setModType] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  
  const [results, setResults] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedStatFilter, setSelectedStatFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chars, setChars] = useState(0);



  const handleNextSignupStep = (e) => {
    e.preventDefault();
    if (!authForm.username || !authForm.firstName || !authForm.surname || !authForm.mobile || !authForm.country || !authForm.email) {
      setError("Please fill in all details first.");
      return;
    }
    setError(null);
    setSignupStep(2);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!authForm.password) {
      setError("Please create a password.");
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    if (registeredUsers.some(u => u.email.toLowerCase() === authForm.email.toLowerCase())) {
      setError("Email already registered. Please log in.");
      return;
    }

    const newUser = {
      username: authForm.username,
      firstName: authForm.firstName,
      surname: authForm.surname,
      email: authForm.email,
      mobile: authForm.mobile,
      country: authForm.country,
      avatarId: authForm.avatarId,
      password: authForm.password
    };

    registeredUsers.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(registeredUsers));

    alert("Registration Successful! Please log in with your registered email and password.");
    setAuthMode('login');
    setSignupStep(1);
    setAuthForm({
      username: '',
      firstName: '',
      surname: '',
      email: '',
      mobile: '',
      country: '',
      avatarId: 1,
      password: ''
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    let registeredUsersList = JSON.parse(localStorage.getItem('registered_users') || '[]');
    
    // Safety sync: Ensure admins are seeded in list before login check
    const seedAdmins = [
      { username: 'abhayk828', firstName: 'Abhay', surname: 'Kushwaha', email: 'kushwahaabhay828@gmail.com', mobile: '+91 9876543210', country: 'India', avatarId: 1, password: 'admin', isAdmin: true },
      { username: 'abhay21', firstName: 'Abhay', surname: 'Kushwaha', email: 'abhay.kushwaha2021@vitbhopal.ac.in', mobile: '+91 9999999999', country: 'India', avatarId: 2, password: 'admin', isAdmin: true },
      { username: 'abhayk829', firstName: 'Abhay', surname: 'Kushwaha', email: 'kushwahaabhay829@gmail.com', mobile: '+91 8888888888', country: 'India', avatarId: 3, password: 'admin', isAdmin: true },
      { username: 'ayushi', firstName: 'Ayushi', surname: 'Mishra', email: 'ayushimishra.engg@gmail.com', mobile: '+91 7777777777', country: 'India', avatarId: 5, password: 'admin', isAdmin: true }
    ];

    let changed = false;
    seedAdmins.forEach(seed => {
      const idx = registeredUsersList.findIndex(u => u.email.toLowerCase() === seed.email.toLowerCase());
      if (idx === -1) {
        registeredUsersList.push(seed);
        changed = true;
      } else {
        if (!registeredUsersList[idx].isAdmin || registeredUsersList[idx].password !== 'admin') {
          registeredUsersList[idx].isAdmin = true;
          registeredUsersList[idx].password = 'admin'; // Force-reset password to default 'admin'
          changed = true;
        }
      }
    });
    if (changed) {
      localStorage.setItem('registered_users', JSON.stringify(registeredUsersList));
    }

    const enteredEmail = (authForm.email || '').trim().toLowerCase();
    const enteredPassword = (authForm.password || '').trim();

    const user = registeredUsersList.find(u => u.email.toLowerCase().trim() === enteredEmail && u.password.trim() === enteredPassword);

    if (user) {
      const isUserAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
      if (isAdminLogin && !isUserAdmin) {
        setError("Access Denied: You do not have administrator privileges.");
        return;
      }
      
      const loggedInUser = { ...user, isAdmin: isUserAdmin };
      setCurrentUser(loggedInUser);
      setIsAuthenticated(true);
      setError(null);
      
      const userHistory = JSON.parse(localStorage.getItem('history_' + user.email) || '[]');
      setSubmissions(userHistory);
      
      if (isUserAdmin) {
        setRegisteredUsers(registeredUsersList);
      }
    } else {
      setError("Invalid Email ID or Password.");
    }
  };

  const handleGoogleLoginMock = (selectedMockUser) => {
    const mockUser = selectedMockUser || {
      username: 'abhayk',
      firstName: 'Abhay',
      surname: 'Kushwaha',
      email: 'kushwahaabhay829@gmail.com',
      mobile: '+91 9876543210',
      country: 'India',
      avatarId: 1
    };
    
    const isUserAdmin = ADMIN_EMAILS.includes(mockUser.email.toLowerCase());
    const finalUser = { ...mockUser, isAdmin: isUserAdmin };
    
    // Auto register if not exists in registered list
    const registeredUsersList = JSON.parse(localStorage.getItem('registered_users') || '[]');
    if (!registeredUsersList.some(u => u.email.toLowerCase() === finalUser.email.toLowerCase())) {
      registeredUsersList.push({ ...finalUser, password: 'password' });
      localStorage.setItem('registered_users', JSON.stringify(registeredUsersList));
    } else {
      // update role in DB if already registered
      const idx = registeredUsersList.findIndex(u => u.email.toLowerCase() === finalUser.email.toLowerCase());
      if (idx !== -1) {
        registeredUsersList[idx].isAdmin = isUserAdmin;
        localStorage.setItem('registered_users', JSON.stringify(registeredUsersList));
      }
    }

    setCurrentUser(finalUser);
    setIsAuthenticated(true);
    const userHistory = JSON.parse(localStorage.getItem('history_' + finalUser.email) || '[]');
    setSubmissions(userHistory);
    setShowGooglePopup(false);
    
    if (isUserAdmin) {
      setRegisteredUsers(registeredUsersList);
    }
  };

  // Helper CRUD functions
  const fetchAllRegisteredUsers = () => {
    const list = JSON.parse(localStorage.getItem('registered_users') || '[]');
    setRegisteredUsers(list);
  };

  const handleAdminAddUser = (e) => {
    e.preventDefault();
    if (!addUserForm.username || !addUserForm.firstName || !addUserForm.surname || !addUserForm.email || !addUserForm.password || !addUserForm.mobile || !addUserForm.country) {
      setError("Please fill in all user details.");
      return;
    }

    const list = JSON.parse(localStorage.getItem('registered_users') || '[]');
    if (list.some(u => u.email.toLowerCase() === addUserForm.email.toLowerCase())) {
      setError("Email already registered.");
      return;
    }

    const isNewUserAdmin = ADMIN_EMAILS.includes(addUserForm.email.toLowerCase());
    const newUser = {
      username: addUserForm.username,
      firstName: addUserForm.firstName,
      surname: addUserForm.surname,
      email: addUserForm.email,
      mobile: addUserForm.mobile,
      country: addUserForm.country,
      avatarId: addUserForm.avatarId,
      password: addUserForm.password,
      isAdmin: isNewUserAdmin
    };

    list.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(list));
    setRegisteredUsers(list);
    setShowAddUserForm(false);
    setAddUserForm({
      username: '',
      firstName: '',
      surname: '',
      email: '',
      mobile: '',
      country: '',
      avatarId: 1,
      password: ''
    });
    alert("New user added successfully!");
  };

  const handleAdminEditUserSubmit = (e) => {
    e.preventDefault();
    if (!editingUser.username || !editingUser.firstName || !editingUser.surname || !editingUser.email || !editingUser.password) {
      setError("Username, Name, Email, and Password are required.");
      return;
    }

    const list = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const index = list.findIndex(u => u.email.toLowerCase() === editingUser.originalEmail.toLowerCase());
    
    if (index === -1) {
      setError("User not found.");
      return;
    }

    // Check if new email is taken by another user
    if (editingUser.email.toLowerCase() !== editingUser.originalEmail.toLowerCase()) {
      if (list.some((u, idx) => idx !== index && u.email.toLowerCase() === editingUser.email.toLowerCase())) {
        setError("Email already in use by another account.");
        return;
      }
    }

    const isUpdatedUserAdmin = ADMIN_EMAILS.includes(editingUser.email.toLowerCase());
    const updatedUser = {
      username: editingUser.username,
      firstName: editingUser.firstName,
      surname: editingUser.surname,
      email: editingUser.email,
      mobile: editingUser.mobile,
      country: editingUser.country,
      avatarId: editingUser.avatarId,
      password: editingUser.password,
      isAdmin: isUpdatedUserAdmin
    };

    list[index] = updatedUser;
    localStorage.setItem('registered_users', JSON.stringify(list));
    setRegisteredUsers(list);
    
    // If editing themselves, update currentUser state
    if (currentUser.email.toLowerCase() === editingUser.originalEmail.toLowerCase()) {
      setCurrentUser(updatedUser);
    }

    setShowEditUserModal(false);
    setEditingUser(null);
    alert("User details updated successfully!");
  };

  const handleAdminDeleteUser = (email) => {
    if (email.toLowerCase() === currentUser.email.toLowerCase()) {
      alert("Safety Lock: You cannot delete your own logged-in administrator account!");
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete the user account for ${email}? This action is permanent.`);
    if (!confirmDelete) return;

    const list = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const updated = list.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem('registered_users', JSON.stringify(updated));
    setRegisteredUsers(updated);
    alert("User deleted successfully!");
  };

  // Auto-seed admin accounts
  useEffect(() => {
    const seedAdmins = [
      {
        username: 'abhayk828',
        firstName: 'Abhay',
        surname: 'Kushwaha',
        email: 'kushwahaabhay828@gmail.com',
        mobile: '+91 9876543210',
        country: 'India',
        avatarId: 1,
        password: 'admin',
        isAdmin: true
      },
      {
        username: 'abhay21',
        firstName: 'Abhay',
        surname: 'Kushwaha',
        email: 'abhay.kushwaha2021@vitbhopal.ac.in',
        mobile: '+91 9999999999',
        country: 'India',
        avatarId: 2,
        password: 'admin',
        isAdmin: true
      },
      {
        username: 'abhayk829',
        firstName: 'Abhay',
        surname: 'Kushwaha',
        email: 'kushwahaabhay829@gmail.com',
        mobile: '+91 8888888888',
        country: 'India',
        avatarId: 3,
        password: 'admin',
        isAdmin: true
      },
      {
        username: 'ayushi',
        firstName: 'Ayushi',
        surname: 'Mishra',
        email: 'ayushimishra.engg@gmail.com',
        mobile: '+91 7777777777',
        country: 'India',
        avatarId: 5,
        password: 'admin',
        isAdmin: true
      }
    ];

    const currentUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    let updated = [...currentUsers];
    let changed = false;

    seedAdmins.forEach(seed => {
      const existingIdx = updated.findIndex(u => u.email.toLowerCase() === seed.email.toLowerCase());
      if (existingIdx === -1) {
        updated.push(seed);
        changed = true;
      } else {
        if (!updated[existingIdx].isAdmin || updated[existingIdx].password !== 'admin') {
          updated[existingIdx].isAdmin = true;
          updated[existingIdx].password = 'admin'; // Force-reset password to default 'admin'
          changed = true;
        }
      }
    });

    if (changed) {
      localStorage.setItem('registered_users', JSON.stringify(updated));
    }
  }, []);

  const saveToUserHistory = (type, data) => {
    if (!currentUser || !currentUser.email) return;
    const userHistory = JSON.parse(localStorage.getItem('history_' + currentUser.email) || '[]');
    const newEntry = {
      id: data.submission_id || Date.now(),
      content_type: type,
      created_at: new Date().toISOString(),
      status: data.status || data.overall_status || 'Processed',
      results: data
    };

    userHistory.unshift(newEntry);
    localStorage.setItem('history_' + currentUser.email, JSON.stringify(userHistory));
    setSubmissions(userHistory);
  };

  const deleteSubmission = (id, e) => {
    if (e) e.stopPropagation();
    if (!currentUser || !currentUser.email) return;
    const userHistory = JSON.parse(localStorage.getItem('history_' + currentUser.email) || '[]');
    const updated = userHistory.filter(s => s.id !== id);
    localStorage.setItem('history_' + currentUser.email, JSON.stringify(updated));
    setSubmissions(updated);
  };

  const exportPDF = async () => {
    if (!results) return;
    const element = document.getElementById('pdf-content');
    
    // Add class to reveal PDF-specific headers for html2canvas
    element.classList.add('exporting-pdf');
    
    const opt = {
      margin: 0.5,
      filename: `Content_Moderation_Report.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1200 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    try {
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Content_Moderation_Report_${results.submission_id || 'AI'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      element.classList.remove('exporting-pdf');
    }
  };
  useEffect(() => {
    if (!submissions || submissions.length === 0) {
      setStats({
        total_submissions: 0,
        flagged: 0,
        approved: 0,
        needs_review: 0,
        approval_rate: '0%'
      });
      return;
    }

    const total = submissions.length;
    let flagged = 0;
    let approved = 0;
    let needs_review = 0;

    submissions.forEach(s => {
      const status = (s.status || '').toLowerCase();
      if (status === 'flagged') flagged++;
      else if (status === 'approved' || status === 'safe') approved++;
      else needs_review++;
    });

    const approval_rate = total > 0 ? `${Math.round((approved / total) * 100)}%` : '0%';

    setStats({
      total_submissions: total,
      flagged,
      approved,
      needs_review,
      approval_rate
    });
  }, [submissions]);

  const clearAllHistory = () => {
    if (!currentUser || !currentUser.email) return;
    const confirmClear = window.confirm("Are you sure you want to clear your entire submission history? This will also reset your dashboard stats.");
    if (confirmClear) {
      localStorage.setItem('history_' + currentUser.email, '[]');
      setSubmissions([]);
    }
  };

  useEffect(() => { if (error) { const t = setTimeout(() => setError(null), 6000); return () => clearTimeout(t); } }, [error]);
  useEffect(() => { 
    document.body.classList.toggle('dark-mode', !isLightMode); 
    document.body.classList.toggle('light-mode', isLightMode);
  }, [isLightMode]);
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;
    const historyKey = 'history_' + currentUser.email;
    const userHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    let migrated = false;
    userHistory.forEach(s => {
      if ((s.status === 'Processed' || !s.status) && s.results) {
        const actualStatus = s.results.status || s.results.overall_status;
        if (actualStatus) {
          s.status = actualStatus;
          migrated = true;
        }
      }
    });
    if (migrated) {
      localStorage.setItem(historyKey, JSON.stringify(userHistory));
      setSubmissions(userHistory);
    }
  }, [currentUser]);
  useEffect(() => {
    if (currentUser?.isAdmin && tab === 'admin') {
      fetchAllRegisteredUsers();
    }
  }, [tab, currentUser]);

  const fetchStats = () => {
    // Dynamically compiled inside react state hook
  };

  const fetchSubmissions = async () => {
    if (!currentUser || !currentUser.email) return;
    const userHistory = JSON.parse(localStorage.getItem('history_' + currentUser.email) || '[]');
    setSubmissions(userHistory);
  };

  // Build enabled_models string from toggle state
  const getEnabledModels = () => {
    const enabled = Object.entries(activeModels).filter(([, v]) => v).map(([k]) => k);
    return enabled.length > 0 ? enabled.join(',') : null;
  };

  // MODERATION HANDLERS
  const moderateText = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    try {
      setLoading(true); setError(null);
      const params = { text: textInput };
      const em = getEnabledModels();
      if (em) params.enabled_models = em;
      const r = await axios.post(`${API}/moderate/text`, null, { params });
      setResults(r.data); saveToUserHistory('text', r.data); setTextInput(''); setChars(0); setTab('results'); fetchStats();
    } catch (e) { setError(`Text analysis failed: ${e.response?.data?.detail || e.message}`); }
    finally { setLoading(false); }
  };

  const moderateImage = async () => {
    if (!imageFile) return;
    try {
      setLoading(true); setError(null);
      const fd = new FormData(); fd.append('file', imageFile);
      const em = getEnabledModels();
      const r = await axios.post(`${API}/moderate/image`, fd, { params: em ? { enabled_models: em } : {} });
      setResults(r.data); saveToUserHistory('image', r.data); setImageFile(null); setImagePreview(null); setTab('results'); fetchStats();
    } catch (e) { setError(`Image analysis failed: ${e.response?.data?.detail || e.message}`); }
    finally { setLoading(false); }
  };

  const moderateVideo = async () => {
    if (!videoFile) return;
    try {
      setLoading(true); setError(null);
      const fd = new FormData(); fd.append('file', videoFile);
      const em = getEnabledModels();
      const r = await axios.post(`${API}/moderate/video`, fd, { params: em ? { enabled_models: em } : {} });
      setResults(r.data); saveToUserHistory('video', r.data); setVideoFile(null); setVideoPreview(null); setTab('results'); fetchStats();
    } catch (e) { setError(`Video analysis failed: ${e.response?.data?.detail || e.message}`); }
    finally { setLoading(false); }
  };

  const moderateUrl = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    try {
      setLoading(true); setError(null);
      const params = { url: urlInput };
      const em = getEnabledModels();
      if (em) params.enabled_models = em;
      const r = await axios.post(`${API}/moderate/url`, null, { params });
      setResults(r.data); saveToUserHistory('url', r.data); setUrlInput(''); setTab('results'); fetchStats();
    } catch (e) { setError(`URL analysis failed: ${e.response?.data?.detail || e.message}`); }
    finally { setLoading(false); }
  };

  const moderateDocument = async () => {
    if (!documentFile) return;
    try {
      setLoading(true); setError(null);
      const fd = new FormData(); fd.append('file', documentFile);
      const em = getEnabledModels();
      const r = await axios.post(`${API}/moderate/document`, fd, { params: em ? { enabled_models: em } : {} });
      setResults(r.data); saveToUserHistory('document', r.data); setDocumentFile(null); setTab('results'); fetchStats();
    } catch (e) { setError(`Document analysis failed: ${e.response?.data?.detail || e.message}`); }
    finally { setLoading(false); }
  };



  const handleReview = async (action) => {
    if (!results || !results.submission_id) return;
    try {
      setLoading(true); setError(null);
      await axios.post(`${API}/moderate/review/${results.submission_id}?action=${action}`);
      setResults({ ...results, status: action });
      fetchStats();
    } catch (e) {
      setError(`Failed to manual review: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file, type) => {
    if (!file) return;
    if (type === 'image') {
      setImageFile(file);
      const r = new FileReader(); r.onload = (e) => setImagePreview(e.target.result); r.readAsDataURL(file);
    } else if (type === 'video') {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    } else if (type === 'document') {
      setDocumentFile(file);
    }
  };
  
  const viewSubmission = (id) => {
    if (!currentUser || !currentUser.email) return;
    const userHistory = JSON.parse(localStorage.getItem('history_' + currentUser.email) || '[]');
    const sub = userHistory.find(s => s.id === id);
    if (sub && sub.results) {
      setResults(sub.results);
      setTab('results');
    } else {
      setError("Failed to load details for this submission.");
    }
  };

  const getRiskColor = (s) => s >= 0.7 ? '#ef4444' : s >= 0.4 ? '#f59e0b' : '#22c55e';
  const statusClass = (s) => !s ? '' : s.toLowerCase() === 'approved' ? 'approved' : s.toLowerCase() === 'flagged' ? 'flagged' : 'needs-review';

  const classifiers = [
    { key: 'hate_speech', label: 'Hate Speech' },
    { key: 'toxicity', label: 'Toxicity' },
    { key: 'violence', label: 'Violence' },
    { key: 'misinformation', label: 'Misinfo' },
    { key: 'spam', label: 'Spam' },
    { key: 'self_harm', label: 'Self Harm' },
    { key: 'cyberbullying', label: 'Cyberbullying' },
    { key: 'extremism', label: 'Extremism' },
    { key: 'profanity', label: 'Profanity' },
    { key: 'sexual_content', label: 'Sexual Content' },
    { key: 'phishing', label: 'Phishing/Scams' },
    { key: 'defamation', label: 'Defamation' },
    { key: 'hate_symbols', label: 'Hate Symbols' },
    { key: 'pseudoscience', label: 'Pseudoscience' },
    { key: 'copyright', label: 'Copyright' },
    { key: 'nsfw', label: 'NSFW Image/Video' },
    { key: 'authenticity', label: 'Authenticity (AI)' },
    { key: 'plagiarism', label: 'Plagiarism' },
  ];

  const [activeModels, setActiveModels] = useState(
    classifiers.reduce((acc, curr) => ({ ...acc, [curr.key]: true }), {})
  );

  const features = [
    { id: 'hate_speech', icon: '\u{1F6E1}', title: 'Hate Speech', desc: 'Detects discriminatory, racist, sexist, and hate-based language', bg: 'rgba(239,68,68,.1)' },
    { id: 'toxicity', icon: '\u{2620}', title: 'Toxicity', desc: 'Identifies harmful, offensive, and abusive content', bg: 'rgba(249,115,22,.1)' },
    { id: 'violence', icon: '\u{1F534}', title: 'Violence', desc: 'Flags violent, graphic, and disturbing content', bg: 'rgba(220,38,38,.1)' },
    { id: 'misinformation', icon: '\u{1F4F0}', title: 'Misinformation', desc: 'Spots false, misleading, and unverified claims', bg: 'rgba(234,179,8,.1)' },
    { id: 'spam', icon: '\u{1F4E7}', title: 'Spam Detection', desc: 'Filters unwanted promotional content and scams', bg: 'rgba(139,92,246,.1)' },
    { id: 'self_harm', icon: '\u{1FA79}', title: 'Self Harm', desc: 'Identifies references to self-harm or suicidal intent', bg: 'rgba(239,68,68,.1)' },
    { id: 'cyberbullying', icon: '\u{1F4A2}', title: 'Cyberbullying', desc: 'Detects targeted harassment and bullying behavior', bg: 'rgba(249,115,22,.1)' },
    { id: 'extremism', icon: '\u{26A1}', title: 'Extremism', desc: 'Flags radical, extremist, and terror-related content', bg: 'rgba(220,38,38,.1)' },
    { id: 'profanity', icon: '\u{1F92C}', title: 'Profanity', desc: 'Detects explicit swearing and vulgar language', bg: 'rgba(234,179,8,.1)' },
    { id: 'sexual_content', icon: '\u{1F346}', title: 'Sexual Content', desc: 'Identifies explicit sexual text and erotica', bg: 'rgba(236,72,153,.1)' },
    { id: 'phishing', icon: '\u{1F3A3}', title: 'Phishing', desc: 'Detects scams, phishing attempts, and malicious links', bg: 'rgba(16,185,129,.1)' },
    { id: 'defamation', icon: '\u{1F5E3}', title: 'Defamation', desc: 'Spots libel, slander, and reputational damage', bg: 'rgba(59,130,246,.1)' },
    { id: 'hate_symbols', icon: '\u{1F6AB}', title: 'Hate Symbols', desc: 'Identifies text references to hate groups and symbols', bg: 'rgba(99,102,241,.1)' },
    { id: 'pseudoscience', icon: '\u{1F9EA}', title: 'Pseudoscience', desc: 'Flags unscientific health claims and hoaxes', bg: 'rgba(14,165,233,.1)' },
    { id: 'copyright', icon: '\u{00A9}', title: 'Copyright', desc: 'Detects potential piracy and copyright violations', bg: 'rgba(139,92,246,.1)' },
    { id: 'nsfw', icon: '\u{1F51E}', title: 'NSFW Image/Video', desc: 'Detects adult and inappropriate content in media', bg: 'rgba(236,72,153,.1)' },
    { id: 'authenticity', icon: '\u{1F916}', title: 'Authenticity', desc: 'Verifies if text is human-written or AI-generated', bg: 'rgba(59,130,246,.1)' },
    { id: 'plagiarism', icon: '\u{1F4DD}', title: 'Plagiarism', desc: 'Checks if content is original or copied', bg: 'rgba(16,185,129,.1)' },
  ];

  // ============ RENDER ============
  const selectedAvatar = AVATARS.find(a => a.id === currentUser.avatarId) || AVATARS[0];

  const backgroundElements = (
    <>
      <video autoPlay loop muted playsInline className="app-bg-video">
        <source src="https://cdn.dribbble.com/userupload/14351043/file/original-e8f92507edede186d6fa91bf0aec6760.mp4" type="video/mp4" />
      </video>
      <div className="app-bg-overlay" />
    </>
  );

  if (!isAuthenticated) {
    return (
      <>
        {backgroundElements}
        <div className="landing-container" style={{ background: 'transparent' }}>
          <div className="auth-box modern-auth" style={{ background: 'var(--card)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid var(--gb)' }}>
          <div className="auth-logo">🛡️</div>
          <h2>{isAdminLogin ? 'Admin Portal Login' : authMode === 'login' ? 'System Login' : 'Secure Registration'}</h2>
          <p className="auth-subtitle">Content Moderation AI Platform</p>
          
          {/* User vs Admin Access Mode Switcher */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.15)', padding: '4px', borderRadius: '8px', border: '1px solid var(--gb)' }}>
            <button 
              type="button" 
              onClick={() => { setIsAdminLogin(false); setAuthMode('login'); setError(null); }} 
              style={{ 
                flex: 1, 
                padding: '8px 12px', 
                borderRadius: '6px', 
                border: 'none', 
                background: !isAdminLogin ? 'var(--a1)' : 'transparent', 
                color: !isAdminLogin ? '#fff' : 'var(--t2)', 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                cursor: 'pointer',
                transition: 'var(--tr)'
              }}
            >
              👥 User Access
            </button>
            <button 
              type="button" 
              onClick={() => { setIsAdminLogin(true); setAuthMode('login'); setError(null); }} 
              style={{ 
                flex: 1, 
                padding: '8px 12px', 
                borderRadius: '6px', 
                border: 'none', 
                background: isAdminLogin ? 'var(--a1)' : 'transparent', 
                color: isAdminLogin ? '#fff' : 'var(--t2)', 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                cursor: 'pointer',
                transition: 'var(--tr)'
              }}
            >
              🔐 Admin Control
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '16px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              animation: 'slI 0.3s ease'
            }} onClick={() => setError(null)}>
              <span>⚠️</span>
              <span style={{ flex: 1 }}>{error}</span>
            </div>
          )}
          
          {!isAdminLogin && (
            <>
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                {/* Real official Google button, made invisible but clickable on top */}
                {USE_REAL_GOOGLE_LOGIN && (
                  <div 
                    id="google-signin-btn-container" 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      opacity: 0.01, 
                      zIndex: 10, 
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  />
                )}
                
                {/* Beautiful custom styled glassmorphic button */}
                <button type="button" className="google-btn" onClick={handleContinueWithGoogleClick} style={{ width: '100%', margin: 0 }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="g-icon" />
                  Continue with Google
                </button>
              </div>
              
              <div className="auth-divider">
                <span>OR</span>
              </div>
            </>
          )}

          <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleSignupSubmit} className="auth-form">
            {authMode === 'signup' && signupStep === 1 && !isAdminLogin && (
              <>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <input type="text" placeholder="Username" required value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} style={{ padding: '10px 12px' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: 8 }}>
                  <input type="text" placeholder="First Name" required value={authForm.firstName} onChange={e => setAuthForm({...authForm, firstName: e.target.value})} style={{ flex: 1, padding: '10px 12px' }} />
                  <input type="text" placeholder="Surname" required value={authForm.surname} onChange={e => setAuthForm({...authForm, surname: e.target.value})} style={{ flex: 1, padding: '10px 12px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <input type="text" placeholder="Mobile Number" required value={authForm.mobile} onChange={e => setAuthForm({...authForm, mobile: e.target.value})} style={{ padding: '10px 12px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <input type="text" placeholder="Country" required value={authForm.country} onChange={e => setAuthForm({...authForm, country: e.target.value})} style={{ padding: '10px 12px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <input type="email" placeholder="Enter your email" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} style={{ padding: '10px 12px' }} />
                </div>
                
                <button type="button" className="email-btn" onClick={handleNextSignupStep} style={{ marginTop: '8px', padding: '12px' }}>
                  Next: Choose Avatar
                </button>
              </>
            )}

            {authMode === 'signup' && signupStep === 2 && !isAdminLogin && (
              <>
                {/* Avatar Selection Grid */}
                <div style={{ margin: '6px 0', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--t1)', marginBottom: '6px', display: 'block' }}>Choose your Avatar</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', padding: '2px' }}>
                    {AVATARS.map(av => (
                      <div 
                        key={av.id}
                        onClick={() => setAuthForm({...authForm, avatarId: av.id})}
                        style={{ 
                          background: av.bg,
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          border: authForm.avatarId === av.id ? '3px solid #4f46e5' : '1px solid var(--gb)',
                          boxShadow: authForm.avatarId === av.id ? '0 0 8px rgba(79, 70, 229, 0.4)' : 'none',
                          transition: 'transform 0.15s',
                          transform: authForm.avatarId === av.id ? 'scale(1.1)' : 'none'
                        }}
                        title={av.label}
                      >
                        {av.char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 12, marginTop: 10 }}>
                  <input type="password" placeholder="Create Password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} style={{ padding: '10px 12px' }} />
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button type="button" className="google-btn" onClick={() => setSignupStep(1)} style={{ flex: 1, margin: 0, padding: '12px' }}>
                    Back
                  </button>
                  <button type="submit" className="email-btn" style={{ flex: 1, margin: 0, padding: '12px' }}>
                    Register Now
                  </button>
                </div>
              </>
            )}

            {authMode === 'login' && (
              <>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <input type="email" placeholder="Enter your email" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} style={{ padding: '10px 12px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <input type="password" placeholder="Password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} style={{ padding: '10px 12px' }} />
                </div>
                <button type="submit" className="email-btn" style={{ marginTop: '10px', padding: '12px' }}>
                  {isAdminLogin ? '🔐 Admin Sign In' : 'Sign In'}
                </button>
              </>
            )}
          </form>
          
          {!isAdminLogin && (
            <div className="auth-switch">
              {authMode === 'login' ? (
                <p>No clearance? <span onClick={() => { setAuthMode('signup'); setSignupStep(1); }}>Request Access</span></p>
              ) : (
                <p>Already registered? <span onClick={() => { setAuthMode('login'); setSignupStep(1); }}>Return to Login</span></p>
              )}
            </div>
          )}
        </div>

        {/* Mock Google Popup */}
        {showGooglePopup && (
          <div className="google-popup-overlay" onClick={() => setShowGooglePopup(false)}>
            <div className="google-popup" onClick={e => e.stopPropagation()}>
              <div className="g-popup-header">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" />
                <h3>Sign in with Google</h3>
              </div>
              <div className="g-popup-body">
                <h2>Choose an account</h2>
                <p>to continue to <strong>Content Moderation AI</strong></p>
                <div className="g-accounts-list">
                  <div className="g-account-item" onClick={() => handleGoogleLoginMock({
                    username: 'abhayk',
                    firstName: 'Abhay',
                    surname: 'Kushwaha',
                    email: 'kushwahaabhay828@gmail.com',
                    mobile: '+91 9876543210',
                    country: 'India',
                    avatarId: 1
                  })}>
                    <div className="g-avatar">A</div>
                    <div className="g-account-info">
                      <div className="g-name">Abhay Kushwaha</div>
                      <div className="g-email">kushwahaabhay828@gmail.com</div>
                    </div>
                  </div>
                  <div className="g-account-item" onClick={() => handleGoogleLoginMock({
                    username: 'abhay21',
                    firstName: 'Abhay',
                    surname: 'Kushwaha 21BAI10270',
                    email: 'abhay.kushwaha2021@vitbhopal.ac.in',
                    mobile: '+91 9999999999',
                    country: 'India',
                    avatarId: 2
                  })}>
                    <div className="g-avatar" style={{background: '#0ea5e9'}}>A</div>
                    <div className="g-account-info">
                      <div className="g-name" style={{textTransform: 'uppercase'}}>Abhay Kushwaha 21BAI10270</div>
                      <div className="g-email">abhay.kushwaha2021@vitbhopal.ac.in</div>
                    </div>
                  </div>
                  <div className="g-account-item" onClick={() => handleGoogleLoginMock({
                    username: 'abhayk829',
                    firstName: 'Abhay',
                    surname: 'Kushwaha',
                    email: 'kushwahaabhay829@gmail.com',
                    mobile: '+91 8888888888',
                    country: 'India',
                    avatarId: 3
                  })}>
                    <div className="g-avatar" style={{background: '#8b5cf6'}}>A</div>
                    <div className="g-account-info">
                      <div className="g-name">Abhay Kushwaha</div>
                      <div className="g-email">kushwahaabhay829@gmail.com</div>
                    </div>
                  </div>
                  <div className="g-account-item" onClick={() => handleGoogleLoginMock({
                    username: 'ayushi',
                    firstName: 'Ayushi',
                    surname: 'Mishra',
                    email: 'ayushimishra.engg@gmail.com',
                    mobile: '+91 7777777777',
                    country: 'India',
                    avatarId: 5
                  })}>
                    <div className="g-avatar" style={{background: '#ec4899'}}>A</div>
                    <div className="g-account-info">
                      <div className="g-name">Ayushi Mishra</div>
                      <div className="g-email">ayushimishra.engg@gmail.com</div>
                    </div>
                  </div>
                  <div className="g-account-item" style={{borderBottom: 'none'}} onClick={() => handleGoogleLoginMock()}>
                    <div className="g-avatar" style={{background: 'transparent', color: '#8ab4f8'}}>
                      <svg focusable="false" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></svg>
                    </div>
                    <div className="g-account-info">
                      <div className="g-name" style={{fontWeight: 500}}>Use another account</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="g-popup-footer">
                To continue, Google will share your name, email address, and profile picture with Content Moderation AI.
              </div>
            </div>
          </div>
        )}
      </div>
      </>
    );
  }

  return (
    <>
      {backgroundElements}
      <div className="app">
        <div className="header" style={{ padding: '28px 24px 18px', margin: '0 auto', textAlign: 'center' }}>
          <div className="header-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '0 0 6px 0' }}>
              <span style={{ fontSize: '2.8rem', display: 'inline-block', filter: 'drop-shadow(0 4px 12px rgba(37,99,235,0.18))', userSelect: 'none', transform: 'translateY(-2px)' }}>🛡️</span>
              <h1 style={{ margin: 0, fontSize: '2.8rem', fontWeight: 800, background: 'var(--t1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.04em', lineHeight: '1.1' }}>
                Content Moderation AI
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--t2)', maxWidth: '650px' }}>
              Advanced real-time safety detection across text, URLs, images, video, and documents
            </p>
          </div>
        </div>

      {/* Navbar */}
      <div className="navbar" style={{ padding: '10px 32px', display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
          {[
            { id: 'home', label: 'Home' },
            { id: 'moderate', label: 'Analyze' },
            { id: 'results', label: 'Results' },
            { id: 'submissions', label: 'History', fn: fetchSubmissions },
            { id: 'dashboard', label: 'Dashboard', fn: () => fetchStats() },
            { id: 'docs', label: 'Docs & API' },
            { id: 'about', label: 'Developers' },
            currentUser?.isAdmin && { id: 'admin', label: 'Admin Panel', fn: fetchAllRegisteredUsers }
          ].filter(Boolean).map(t => (
            <button key={t.id} className={`nav-link ${tab === t.id ? 'active' : ''}`}
              onClick={() => { setTab(t.id); t.fn?.(); }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle-btn"
            onClick={() => setIsLightMode(!isLightMode)}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--gb)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginRight: '12px',
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
            title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {isLightMode ? '🌙' : '☀️'}
          </button>
          <div className="profile-container" style={{ position: 'relative', top: 'auto', right: 'auto' }}>
            <div className="profile-avatar" 
                 onClick={() => setShowProfileMenu(!showProfileMenu)}
                 style={{ 
                   background: selectedAvatar.bg,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontSize: '1.2rem',
                   boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                 }}>
              {selectedAvatar.char}
            </div>
            {showProfileMenu && (
              <div className="profile-dropdown" style={{ top: '50px' }}>
                <div className="profile-dropdown-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--gb)' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    background: selectedAvatar.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem'
                  }}>
                    {selectedAvatar.char}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--t1)' }}>{currentUser.firstName} {currentUser.surname}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--t3)', display: 'block', marginTop: '1px' }}>@{currentUser.username}</span>
                  </div>
                </div>

                <div className="profile-dropdown-item" onClick={() => { setShowSettings(true); setShowProfileMenu(false); }}>
                  ⚙️ Settings
                </div>
                <div className="profile-dropdown-item" onClick={() => { setIsAuthenticated(false); setShowProfileMenu(false); }} style={{ color: '#ef4444' }}>
                  🚪 Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        {error && <div className="alert alert-error" onClick={() => setError(null)}>{'\u26A0'} {error}</div>}
        {loading && <div className="loading-overlay"><div className="spinner" /><span className="loading-text">Analyzing content...</span></div>}

        {/* ===== HOME PAGE ===== */}
        {tab === 'home' && !loading && (
          <div className="page">
            {/* Hero Stats */}
            <div className="hero-stats">
              <div className="hero-stat"><div className="num">{stats?.total_submissions || 0}</div><div className="lbl">Total Scans</div></div>
              <div className="hero-stat"><div className="num">{stats?.approval_rate || '0%'}</div><div className="lbl">Safe Content</div></div>
              <div className="hero-stat"><div className="num">6</div><div className="lbl">ML Models Active</div></div>
            </div>

            {/* Quick Introduction Banner */}
            <div className="card intro-banner" style={{ background: 'var(--card)', padding: '28px 36px', display: 'flex', gap: '24px', alignItems: 'center', borderRadius: 'var(--r)', border: '1px solid var(--gb)', marginBottom: '28px' }}>
              <div style={{ fontSize: '3rem', flexShrink: 0 }}>🧠</div>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--t1)' }}>Automated Content Safety Engine</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: '1.5', margin: 0 }}>
                  This web console provides real-time protective filtering for online communities, SaaS applications, and enterprise chats. Our core pipeline connects a transformer-based zero-shot semantic text agent and visual NSFW convolutional neural networks to detect 16 critical hazard categories.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button onClick={() => setTab('moderate')} style={{ border: 'none', background: 'var(--t1)', color: 'var(--bg)', fontSize: '0.78rem', fontWeight: 700, padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: 'var(--tr)' }}>⚡ Start a Scan</button>
                  <button onClick={() => { setTab('docs'); setActiveDocSection('overview'); }} style={{ border: '1px solid var(--gb)', background: 'transparent', color: 'var(--t2)', fontSize: '0.78rem', fontWeight: 700, padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: 'var(--tr)' }}>📖 Read Developer Guide</button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              {[
                { icon: '\u{1F4DD}', title: 'Text Analysis', desc: 'Check text for hate speech, toxicity & more', type: 'text' },
                { icon: '\u{1F5BC}', title: 'Image Scan', desc: 'Detect NSFW & inappropriate imagery', type: 'image' },
                { icon: '\u{1F3AC}', title: 'Video Check', desc: 'Analyze video frames for safety', type: 'video' },
                { icon: '\u{1F310}', title: 'URL Scanner', desc: 'Scan any webpage for harmful content', type: 'url' },
                { icon: '\u{1F4C4}', title: 'Document Scan', desc: 'Scan PDF, Word, Excel & PPT files', type: 'document' },
              ].map(a => (
                <div key={a.type} className="qa-card" onClick={() => { setTab('moderate'); setModType(a.type); }}>
                  <span className="qa-icon">{a.icon}</span>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>

            {/* Classifiers */}
            <div className="section-title">
              <h2>16 Advanced ML Classifiers</h2>
              <p>Industry-leading AI models working together to keep content safe</p>
            </div>
            <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {features.map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="f-icon" style={{ background: f.bg }}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="section-title">
              <h2>How It Works</h2>
              <p>Three simple steps to ensure content safety</p>
            </div>
            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <h3>Upload Content</h3>
                <p>Submit text, images, videos, documents, or URLs for analysis</p>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <h3>AI Analysis</h3>
                <p>6 ML classifiers process your content simultaneously</p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <h3>Get Results</h3>
                <p>Receive detailed safety report with confidence scores</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== MODERATE PAGE ===== */}
        {tab === 'moderate' && !loading && (
          <div className="page">
            <div className="card">
              <h2>{'\u{1F6E1}\u{FE0F}'} Content Analysis</h2>
              <div className="type-selector" style={{ flexWrap: 'wrap', gap: '8px', padding: '10px' }}>
                {['text', 'image', 'video', 'url', 'document'].map(t => (
                  <button key={t} className={`type-btn ${modType === t ? 'active' : ''}`} onClick={() => setModType(t)} style={{ flex: '1 1 auto', fontSize: '0.8rem' }}>
                    {t === 'text' ? '📝' : t === 'image' ? '🖼️' : t === 'video' ? '🎬' : t === 'document' ? '📄' : '🌐'} {t === 'document' ? 'Document' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* TEXT */}
              {modType === 'text' && (
                <form onSubmit={moderateText} className="form-group">
                  <label>Paste or type content to analyze</label>
                  <textarea value={textInput} onChange={e => { setTextInput(e.target.value); setChars(e.target.value.length); }}
                    placeholder="Enter text content to check for hate speech, toxicity, violence, misinformation, spam, and NSFW content..."
                    disabled={loading} style={{ minHeight: '160px' }} maxLength={5000} />
                  <small>{chars}/5000 characters</small>
                  <button type="submit" className="btn btn-primary" disabled={loading || !textInput.trim()} style={{ marginTop: 16 }}>
                    {'\u{1F50D}'} Analyze Text
                  </button>
                </form>
              )}

              {/* IMAGE */}
              {modType === 'image' && (
                <div className="form-group">
                  <label>Upload an image to analyze</label>
                  <div className={`drop-zone ${imagePreview ? 'has-file' : ''}`}
                    onClick={() => document.getElementById('img-input').click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0], 'image'); }}>
                    {imagePreview ? <img src={imagePreview} alt="Preview" /> : (
                      <><span style={{ fontSize: '2rem' }}>{'\u{1F4F7}'}</span><p>Drop an image or click to upload</p><p className="sub">JPG, PNG, GIF, WebP (Max 50MB)</p></>
                    )}
                  </div>
                  <input id="img-input" type="file" accept="image/*" onChange={e => handleFile(e.target.files[0], 'image')} style={{ display: 'none' }} />
                  {imagePreview && <button className="remove-btn" onClick={() => { setImageFile(null); setImagePreview(null); }}>Remove Image</button>}
                  <button className="btn btn-primary" onClick={moderateImage} disabled={loading || !imageFile} style={{ marginTop: 16 }}>
                    {'\u{1F50D}'} Analyze Image
                  </button>
                </div>
              )}

              {/* VIDEO */}
              {modType === 'video' && (
                <div className="form-group">
                  <label>Upload a video to analyze</label>
                  <div className={`drop-zone ${videoPreview ? 'has-file' : ''}`}
                    onClick={() => document.getElementById('vid-input').click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0], 'video'); }}>
                    {videoPreview ? <video src={videoPreview} controls style={{ width: '100%', maxHeight: 280, borderRadius: 10 }} /> : (
                      <><span style={{ fontSize: '2rem' }}>{'\u{1F3AC}'}</span><p>Drop a video or click to upload</p><p className="sub">MP4, AVI, MOV, WebM, MKV (Max 100MB)</p></>
                    )}
                  </div>
                  <input id="vid-input" type="file" accept="video/*" onChange={e => handleFile(e.target.files[0], 'video')} style={{ display: 'none' }} />
                  {videoPreview && <button className="remove-btn" onClick={() => { setVideoFile(null); setVideoPreview(null); }}>Remove Video</button>}
                  <button className="btn btn-primary" onClick={moderateVideo} disabled={loading || !videoFile} style={{ marginTop: 16 }}>
                    {'\u{1F50D}'} Analyze Video
                  </button>
                </div>
              )}

              {/* URL */}
              {modType === 'url' && (
                <form onSubmit={moderateUrl} className="form-group">
                  <label>Paste a website URL to analyze</label>
                  <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://example.com/article"
                    disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--gb)', background: 'var(--card-h)', color: 'var(--t1)', marginBottom: '16px' }} />
                  <button type="submit" className="btn btn-primary" disabled={loading || !urlInput.trim()}>
                    🔍 Analyze URL
                  </button>
                </form>
              )}

              {/* DOCUMENT */}
              {modType === 'document' && (
                <div className="form-group">
                  <label>Upload a document to analyze (PDF, DOCX, TXT, PPTX, XLSX)</label>
                  <div className={`drop-zone ${documentFile ? 'has-file' : ''}`}
                    onClick={() => document.getElementById('doc-input').click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0], 'document'); }}>
                    {documentFile ? (
                      <><span style={{ fontSize: '2rem' }}>📄</span><p>{documentFile.name}</p><p className="sub">{(documentFile.size / 1024).toFixed(1)} KB</p></>
                    ) : (
                      <><span style={{ fontSize: '2rem' }}>📄</span><p>Drop a document or click to upload</p><p className="sub">PDF, DOCX, TXT, PPTX, Excel (Max 50MB)</p></>
                    )}
                  </div>
                  <input id="doc-input" type="file" accept=".txt,.pdf,.docx,.pptx,.xlsx,.xls" onChange={e => handleFile(e.target.files[0], 'document')} style={{ display: 'none' }} />
                  {documentFile && <button className="remove-btn" onClick={() => setDocumentFile(null)}>Remove Document</button>}
                  <button className="btn btn-primary" onClick={moderateDocument} disabled={loading || !documentFile} style={{ marginTop: 16 }}>
                    🔍 Analyze Document
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== RESULTS ===== */}
        {tab === 'results' && !loading && (
          <div className="page">
            {results ? (
              <div className="card results-card" id="pdf-content">
                {/* PRINT ONLY HEADER */}
                <div className="print-header">
                  <div className="print-logo">
                    <span style={{ fontSize: '2rem', marginRight: 10 }}>{'\u{1F6E1}'}</span>
                    <div style={{ display: 'inline-block' }}>
                      <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#111' }}>Content Moderation AI</h1>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Automated Intelligence Report</p>
                    </div>
                  </div>
                  <div className="print-meta">
                    <p><strong>Report ID:</strong> {results.submission_id}</p>
                    <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
                  </div>
                </div>

                <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gb)', paddingBottom: 16, marginBottom: 20 }}>
                  <h2>{'\u{1F4CA}'} Analysis Report</h2>
                  <button onClick={exportPDF} className="btn" style={{ background: 'var(--a1)', border: 'none', padding: '8px 16px', borderRadius: 8, color: '#fff', fontSize: '.85rem', cursor: 'pointer' }}>
                    {'\u{1F4E5}'} Download PDF
                  </button>
                </div>
                
                {/* VERDICT BANNER FOR PRINT */}
                <div className={`print-verdict print-verdict-${results.status}`}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Final Verdict</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{results.status}</div>
                </div>

                <div className="overall-status">
                  <div>
                    <span style={{ color: 'var(--t3)', fontSize: '.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Content Type</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 2 }}>{results.content_type?.toUpperCase()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`status-pill ${statusClass(results.status)}`}>{results.status}</span>
                    {results.status === 'NEEDS_REVIEW' && (
                      <div className="review-actions" style={{ display: 'flex', gap: 8, marginLeft: 10, paddingLeft: 10, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => handleReview('APPROVED')} style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', padding: '6px 14px', fontSize: '.75rem', border: '1px solid #22c55e', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>✓ APPROVE</button>
                        <button onClick={() => handleReview('FLAGGED')} style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '6px 14px', fontSize: '.75rem', border: '1px solid #ef4444', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>✗ FLAG</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video extra info */}
                {results.content_type === 'video' && (
                  <div className="video-info">
                    <div><div className="vi-num">{results.frames_analyzed || 0}</div><div className="vi-lbl">Frames Analyzed</div></div>
                    <div><div className="vi-num">{results.duration || 0}s</div><div className="vi-lbl">Duration</div></div>
                    <div><div className="vi-num">{results.status}</div><div className="vi-lbl">Verdict</div></div>
                  </div>
                )}

                {/* URL extra info */}
                {results.content_type === 'url' && results.url && (
                  <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 10, border: '1px solid var(--gb)', marginBottom: 16, fontSize: '.82rem', color: 'var(--t2)', wordBreak: 'break-all' }}>
                    {'\u{1F517}'} {results.url} &middot; {results.text_length} chars analyzed
                  </div>
                )}

                {/* PDF extra info */}
                {results.content_type === 'pdf' && (
                  <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 10, border: '1px solid var(--gb)', marginBottom: 16, fontSize: '.82rem', color: 'var(--t2)' }}>
                    {'\u{1F4C4}'} {results.file_name} &middot; {results.pages} pages &middot; {results.text_length} chars extracted
                  </div>
                )}

                <h3 style={{ fontSize: '.75rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: 14 }}>
                  Classifier Breakdown
                </h3>
                <div className="classifiers-grid">
                  {classifiers.filter(c => activeModels[c.key]).map(c => {
                    const d = (results.results || results)[c.key];
                    const score = d?.score || 0;
                    return (
                      <div key={c.key} className="classifier-box" style={{ paddingBottom: d?.reason ? 12 : 18 }}>
                        <h4>{c.label}</h4>
                        <div className="score-bar"><div className="score-fill" style={{ width: `${Math.min(score * 100, 100)}%`, background: getRiskColor(score) }} /></div>
                        <div className="score-text">{(score * 100).toFixed(1)}%</div>
                        <p className="label-text" style={{ marginBottom: 8 }}>{d?.label || 'N/A'}</p>
                        {d?.reason && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--t3)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--gb)', lineHeight: 1.4 }}>
                            {d.reason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="submission-details">
                  <h3>Submission Details</h3>
                  <div className="details-grid">
                    <div><strong>ID</strong>{results.submission_id}</div>
                    <div><strong>Type</strong>{results.content_type?.toUpperCase()}</div>
                    <div><strong>Status</strong>{results.status}</div>
                    <div><strong>Time</strong>{new Date(results.timestamp).toLocaleString()}</div>
                  </div>
                </div>


              </div>
            ) : (
              <div className="card"><div className="empty-state"><div className="empty-icon">{'\u{1F4CA}'}</div><p>No results yet</p><p className="sub">Analyze content to see results here</p></div></div>
            )}
          </div>
        )}

        {/* ===== HISTORY ===== */}
        {tab === 'submissions' && !loading && (
          <div className="page">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0 }}>{'\u{1F4CB}'} Submission History</h2>
                {submissions.length > 0 && (
                  <button 
                    onClick={clearAllHistory} 
                    style={{ 
                      background: '#ef4444', 
                      color: '#ffffff', 
                      border: 'none', 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                      transition: 'transform 0.2s, background 0.2s'
                    }}
                    onMouseOver={e => {
                      e.target.style.background = '#dc2626';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={e => {
                      e.target.style.background = '#ef4444';
                      e.target.style.transform = 'none';
                    }}
                  >
                    🧹 Clear All History
                  </button>
                )}
              </div>
              {submissions.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">{'\u{1F4CB}'}</div><p>No submissions yet</p><p className="sub">Your moderation history will appear here</p></div>
              ) : (
                <div className="submissions-table">
                  <div className="table-header"><div>ID</div><div>Type</div><div>Date</div><div>Status</div><div style={{ textAlign: 'right' }}>Action</div></div>
                  {submissions.map(s => (
                    <div key={s.id} className="table-row" onClick={() => viewSubmission(s.id)} style={{ cursor: 'pointer' }} title="Click to view full report">
                      <div className="col col-id">#{String(s.id).substring(0, 8)}</div>
                      <div className="col col-type" style={{ textTransform: 'uppercase', fontWeight: 600 }}>{s.content_type}</div>
                      <div className="col col-date">{new Date(s.created_at).toLocaleDateString()}</div>
                      <div className="col col-status"><span className="status-badge">{s.status || 'Processed'}</span></div>
                      <div className="col col-action" style={{ textAlign: 'right' }}>
                        <button 
                          onClick={(e) => deleteSubmission(s.id, e)} 
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: '#ef4444', 
                            cursor: 'pointer', 
                            fontSize: '1.05rem', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            transition: 'all 0.2s' 
                          }}
                          title="Delete history entry"
                          onMouseOver={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                          onMouseOut={e => e.target.style.background = 'transparent'}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== DASHBOARD ===== */}
        {tab === 'dashboard' && !loading && (() => {
          const filteredSubmissions = submissions.filter(s => {
            if (selectedStatFilter === 'all') return true;
            const status = (s.status || '').toLowerCase();
            if (selectedStatFilter === 'flagged') return status === 'flagged';
            if (selectedStatFilter === 'approved') return status === 'approved' || status === 'safe';
            if (selectedStatFilter === 'needs_review') return status !== 'flagged' && status !== 'approved' && status !== 'safe';
            return true;
          });
          return (
            <div className="page">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0 }}>{'\u{1F4C8}'} Dashboard</h2>
                {submissions.length > 0 && (
                  <button 
                    onClick={clearAllHistory} 
                    style={{ 
                      background: '#ef4444', 
                      color: '#ffffff', 
                      border: 'none', 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                      transition: 'transform 0.2s, background 0.2s'
                    }}
                    onMouseOver={e => {
                      e.target.style.background = '#dc2626';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={e => {
                      e.target.style.background = '#ef4444';
                      e.target.style.transform = 'none';
                    }}
                  >
                    🧹 Clear History & Reset Stats
                  </button>
                )}
              </div>
              {stats && submissions.length > 0 ? (
                <>
                  {/* Dynamic Interactive Metrics Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }} className="db-layout-grid">
                    <div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--t3)', marginBottom: '14px', marginTop: 0 }}>
                        💡 Click on any metrics card below to filter and inspect specific scanned submissions in real time.
                      </p>
                      
                      <div className="stats-grid" style={{ gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                        <div 
                          className={`stat-card ${selectedStatFilter === 'all' ? 'active-all' : ''}`} 
                          onClick={() => setSelectedStatFilter('all')}
                          style={{ 
                            cursor: 'pointer',
                            border: selectedStatFilter === 'all' ? '2px solid #2563eb' : '1px solid var(--gb)',
                            transform: selectedStatFilter === 'all' ? 'translateY(-2px)' : 'none',
                            boxShadow: selectedStatFilter === 'all' ? '0 8px 24px rgba(37, 99, 235, 0.15)' : 'none',
                            transition: 'all 0.25s',
                            padding: '16px'
                          }}
                        >
                          <h3>Total Scans</h3>
                          <p className="stat-number" style={{ fontSize: '1.8rem', color: '#1e3a8a' }}>{stats.total_submissions || 0}</p>
                        </div>
                        
                        <div 
                          className={`stat-card flagged ${selectedStatFilter === 'flagged' ? 'active-flagged' : ''}`} 
                          onClick={() => setSelectedStatFilter('flagged')}
                          style={{ 
                            cursor: 'pointer',
                            border: selectedStatFilter === 'flagged' ? '2px solid #dc2626' : '1px solid var(--gb)',
                            transform: selectedStatFilter === 'flagged' ? 'translateY(-2px)' : 'none',
                            boxShadow: selectedStatFilter === 'flagged' ? '0 8px 24px rgba(220, 38, 38, 0.15)' : 'none',
                            transition: 'all 0.25s',
                            padding: '16px'
                          }}
                        >
                          <h3>Flagged</h3>
                          <p className="stat-number" style={{ fontSize: '1.8rem', color: '#dc2626' }}>{stats.flagged || 0}</p>
                        </div>
                        
                        <div 
                          className={`stat-card ${selectedStatFilter === 'approved' ? 'active-approved' : ''}`} 
                          onClick={() => setSelectedStatFilter('approved')}
                          style={{ 
                            cursor: 'pointer',
                            border: selectedStatFilter === 'approved' ? '2px solid #16a34a' : '1px solid var(--gb)',
                            transform: selectedStatFilter === 'approved' ? 'translateY(-2px)' : 'none',
                            boxShadow: selectedStatFilter === 'approved' ? '0 8px 24px rgba(22, 163, 74, 0.15)' : 'none',
                            transition: 'all 0.25s',
                            padding: '16px'
                          }}
                        >
                          <h3>Approved</h3>
                          <p className="stat-number" style={{ fontSize: '1.8rem', color: '#16a34a' }}>{stats.approved || 0}</p>
                        </div>
                        
                        <div 
                          className={`stat-card ${selectedStatFilter === 'needs_review' ? 'active-review' : ''}`} 
                          onClick={() => setSelectedStatFilter('needs_review')}
                          style={{ 
                            cursor: 'pointer',
                            border: selectedStatFilter === 'needs_review' ? '2px solid #ea580c' : '1px solid var(--gb)',
                            transform: selectedStatFilter === 'needs_review' ? 'translateY(-2px)' : 'none',
                            boxShadow: selectedStatFilter === 'needs_review' ? '0 8px 24px rgba(234, 88, 12, 0.15)' : 'none',
                            transition: 'all 0.25s',
                            padding: '16px'
                          }}
                        >
                          <h3>Needs Review</h3>
                          <p className="stat-number" style={{ fontSize: '1.8rem', color: '#ea580c' }}>{stats.needs_review || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Circular Interactive Safety Meter */}
                    <div style={{
                      background: 'rgba(255,255,255,0.7)',
                      borderRadius: '16px',
                      border: '1px solid var(--gb)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}>
                      <h3 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--t2)', margin: '0 0 12px 0' }}>Safety Index</h3>
                      <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                        <svg width="110" height="110" viewBox="0 0 110 110">
                          <circle cx="55" cy="55" r="46" fill="transparent" stroke="#e2e8f0" strokeWidth="8" />
                          <circle 
                            cx="55" cy="55" r="46" fill="transparent" 
                            stroke={parseInt(stats.approval_rate) > 75 ? '#16a34a' : parseInt(stats.approval_rate) > 40 ? '#ea580c' : '#dc2626'} 
                            strokeWidth="8" 
                            strokeDasharray={2 * Math.PI * 46}
                            strokeDashoffset={2 * Math.PI * 46 - (parseInt(stats.approval_rate) || 0) / 100 * (2 * Math.PI * 46)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
                          />
                        </svg>
                        <div style={{
                          position: 'absolute',
                          top: 0, left: 0, width: '110px', height: '110px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{stats.approval_rate || '0%'}</span>
                          <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Secure</span>
                        </div>
                      </div>
                      <span style={{ 
                        fontSize: '0.78rem', 
                        fontWeight: 600, 
                        marginTop: '12px', 
                        color: parseInt(stats.approval_rate) > 75 ? '#16a34a' : parseInt(stats.approval_rate) > 40 ? '#ea580c' : '#dc2626',
                        background: parseInt(stats.approval_rate) > 75 ? 'rgba(22, 163, 74, 0.1)' : parseInt(stats.approval_rate) > 40 ? 'rgba(234, 88, 12, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '20px'
                      }}>
                        {parseInt(stats.approval_rate) > 75 ? '🟢 High Security' : parseInt(stats.approval_rate) > 40 ? '🟠 Medium Alert' : '🔴 High Risk'}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Content Breakdown and AI Advice Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }} className="db-layout-grid">
                    {/* Content Type Breakdown Bars */}
                    <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', border: '1px solid var(--gb)', padding: '20px' }}>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📊 Content Type Breakdown
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: '📝 Text Analysis', count: submissions.filter(s => s.content_type === 'text').length, color: '#3b82f6' },
                          { label: '🖼️ Image Analysis', count: submissions.filter(s => s.content_type === 'image').length, color: '#10b981' },
                          { label: '🎥 Video Analysis', count: submissions.filter(s => s.content_type === 'video').length, color: '#8b5cf6' },
                          { label: '🔗 URL Scans', count: submissions.filter(s => s.content_type === 'url').length, color: '#f59f00' },
                          { label: '📄 Documents', count: submissions.filter(s => s.content_type === 'document').length, color: '#ec4899' },
                        ].map((item, idx) => {
                          const percentage = stats.total_submissions > 0 ? Math.round((item.count / stats.total_submissions) * 100) : 0;
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                                <span>{item.label}</span>
                                <span>{item.count} scans ({percentage}%)</span>
                              </div>
                              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ 
                                  width: `${percentage}%`, 
                                  height: '100%', 
                                  background: item.color, 
                                  borderRadius: '4px', 
                                  transition: 'width 0.8s ease-out' 
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Security Advisor Tips */}
                    <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', border: '1px solid var(--gb)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🧠 AI Security Advisor
                      </h3>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                        {parseInt(stats.approval_rate) > 75 ? (
                          <div style={{ background: 'rgba(22, 163, 74, 0.06)', borderLeft: '4px solid #16a34a', padding: '12px', borderRadius: '0 8px 8px 0', fontSize: '0.82rem', color: '#15803d' }}>
                            <strong>🎉 Optimal Status Detected:</strong> Your systems maintain a high safety average index. The active moderation filter policies are keeping unwanted content at bay perfectly. Keep going!
                          </div>
                        ) : parseInt(stats.approval_rate) > 40 ? (
                          <div style={{ background: 'rgba(234, 88, 12, 0.06)', borderLeft: '4px solid #ea580c', padding: '12px', borderRadius: '0 8px 8px 0', fontSize: '0.82rem', color: '#c2410c' }}>
                            <strong>⚠️ Moderation Alert Triggered:</strong> Over 25% of submitted materials have flagged or suspicious marks. Consider inspecting url inputs or enabling secondary model connectors in settings.
                          </div>
                        ) : (
                          <div style={{ background: 'rgba(220, 38, 38, 0.06)', borderLeft: '4px solid #dc2626', padding: '12px', borderRadius: '0 8px 8px 0', fontSize: '0.82rem', color: '#b91c1c' }}>
                            <strong>🚨 Critical Threat Level:</strong> The active safety coefficient is dangerously low. High flagged volumes detected. We advise wiping old logs, resetting statistics, or enabling restricted review rules!
                          </div>
                        )}
                        
                        <div style={{ fontSize: '0.78rem', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          ℹ️ <strong>System Tip:</strong> Click individual models under the settings panel in the main header to selectively restrict capabilities dynamically!
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filtered Submissions Quick Inspector */}
                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', border: '1px solid var(--gb)', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🔍 Real-Time Inspector ({selectedStatFilter.toUpperCase()})
                      </h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer' }} onClick={() => setSelectedStatFilter('all')}>
                        Reset Filter
                      </span>
                    </div>

                    {filteredSubmissions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '0.85rem' }}>
                        No records match the active filter criteria. Start processing new scans!
                      </div>
                    ) : (
                      <div className="submissions-table" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <div className="table-header"><div>ID</div><div>Type</div><div>Date</div><div style={{ textAlign: 'right' }}>Status</div></div>
                        {filteredSubmissions.slice(0, 5).map(s => (
                          <div key={s.id} className="table-row" onClick={() => viewSubmission(s.id)} style={{ cursor: 'pointer', padding: '8px 12px' }} title="Click to view full report">
                            <div className="col col-id">#{String(s.id).substring(0, 8)}</div>
                            <div className="col col-type" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>{s.content_type}</div>
                            <div className="col col-date">{new Date(s.created_at).toLocaleDateString()}</div>
                            <div className="col col-status" style={{ textAlign: 'right' }}><span className="status-badge">{s.status || 'Processed'}</span></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="empty-state"><div className="empty-icon">{'\u{1F4C8}'}</div><p>No data available</p><p className="sub">Start analyzing content to see dynamic interactive charts</p></div>
              )}
            </div>
          </div>
        ); })()}

        {/* ===== PREMIUM ADMIN PANEL ===== */}
        {tab === 'admin' && !loading && currentUser?.isAdmin && (() => {
          const totalUsers = registeredUsers.length;
          const activeAdmins = registeredUsers.filter(u => u.isAdmin).length;
          const uniqueCountries = new Set(registeredUsers.map(u => u.country).filter(Boolean)).size;
          const totalSubmissions = registeredUsers.reduce((sum, u) => {
            const userHistory = JSON.parse(localStorage.getItem('history_' + u.email) || '[]');
            return sum + userHistory.length;
          }, 0);

          const filteredUsers = registeredUsers.filter(user => {
            const q = adminSearchQuery.toLowerCase();
            return (
              (user.username || '').toLowerCase().includes(q) ||
              (user.firstName || '').toLowerCase().includes(q) ||
              (user.surname || '').toLowerCase().includes(q) ||
              (user.email || '').toLowerCase().includes(q)
            );
          });

          return (
            <div className="page admin-page" style={{ padding: '0 20px 40px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, background: 'var(--ag)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    🔐 Security & User Control
                  </h1>
                  <p style={{ color: 'var(--t2)', fontSize: '0.95rem', marginTop: '6px' }}>Manage platform credentials, roles, and safety moderation accounts.</p>
                </div>
                <button className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', background: 'var(--a1)', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}
                  onClick={() => setShowAddUserForm(!showAddUserForm)}>
                  {showAddUserForm ? '✕ Close Form' : '➕ Add New User'}
                </button>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div className="stat-card" style={{ background: 'var(--card)', border: '1px solid var(--gb)', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
                  <h3>Total Platform Users</h3>
                  <div className="stat-number">{totalUsers}</div>
                  <p style={{ color: 'var(--t3)', fontSize: '0.78rem', marginTop: '6px' }}>Registered accounts in database</p>
                </div>
                <div className="stat-card" style={{ background: 'var(--card)', border: '1px solid var(--gb)', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
                  <h3>Submission Volume</h3>
                  <div className="stat-number">{totalSubmissions}</div>
                  <p style={{ color: 'var(--t3)', fontSize: '0.78rem', marginTop: '6px' }}>Aggregated client scans history</p>
                </div>
                <div className="stat-card" style={{ background: 'var(--card)', border: '1px solid var(--gb)', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔐</div>
                  <h3>Active Administrators</h3>
                  <div className="stat-number">{activeAdmins}</div>
                  <p style={{ color: 'var(--t3)', fontSize: '0.78rem', marginTop: '6px' }}>Authorized: Abhay & Ayushi</p>
                </div>
                <div className="stat-card" style={{ background: 'var(--card)', border: '1px solid var(--gb)', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌐</div>
                  <h3>Active Countries</h3>
                  <div className="stat-number">{uniqueCountries}</div>
                  <p style={{ color: 'var(--t3)', fontSize: '0.78rem', marginTop: '6px' }}>Distinct user geographies</p>
                </div>
              </div>

              {/* Add User Section */}
              {showAddUserForm && (
                <div style={{ background: 'var(--card)', border: '1px solid var(--gb)', padding: '30px', borderRadius: '20px', marginBottom: '32px', boxShadow: '0 8px 32px var(--glow)', backdropFilter: 'blur(20px)', position: 'relative' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    👤 Create User Account
                  </h3>
                  <form onSubmit={handleAdminAddUser}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username (ID)</label>
                        <input type="text" placeholder="e.g. janesmith" value={addUserForm.username} onChange={e => setAddUserForm({...addUserForm, username: e.target.value})} style={{ width: '100%', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '10px', color: 'var(--t1)', fontSize: '0.9rem' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>First Name</label>
                        <input type="text" placeholder="e.g. Jane" value={addUserForm.firstName} onChange={e => setAddUserForm({...addUserForm, firstName: e.target.value})} style={{ width: '100%', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '10px', color: 'var(--t1)', fontSize: '0.9rem' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Surname</label>
                        <input type="text" placeholder="e.g. Smith" value={addUserForm.surname} onChange={e => setAddUserForm({...addUserForm, surname: e.target.value})} style={{ width: '100%', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '10px', color: 'var(--t1)', fontSize: '0.9rem' }} required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                        <input type="email" placeholder="e.g. jane.smith@example.com" value={addUserForm.email} onChange={e => setAddUserForm({...addUserForm, email: e.target.value})} style={{ width: '100%', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '10px', color: 'var(--t1)', fontSize: '0.9rem' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile Number</label>
                        <input type="text" placeholder="e.g. +91 98765 43210" value={addUserForm.mobile} onChange={e => setAddUserForm({...addUserForm, mobile: e.target.value})} style={{ width: '100%', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '10px', color: 'var(--t1)', fontSize: '0.9rem' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Country</label>
                        <input type="text" placeholder="e.g. India" value={addUserForm.country} onChange={e => setAddUserForm({...addUserForm, country: e.target.value})} style={{ width: '100%', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '10px', color: 'var(--t1)', fontSize: '0.9rem' }} required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Choose Avatar Character</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '8px', background: 'var(--bg2)', padding: '10px', borderRadius: '12px', border: '1px solid var(--gb)' }}>
                          {AVATARS.map(av => (
                            <div 
                              key={av.id}
                              onClick={() => setAddUserForm({...addUserForm, avatarId: av.id})}
                              style={{ 
                                background: av.bg,
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                border: addUserForm.avatarId === av.id ? '3px solid #6c5ce7' : '1px solid transparent',
                                boxShadow: addUserForm.avatarId === av.id ? '0 0 12px rgba(108, 92, 231, 0.5)' : 'none',
                                transform: addUserForm.avatarId === av.id ? 'scale(1.15)' : 'scale(1)',
                                transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
                              }}
                              title={av.label}
                            >
                              {av.char}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Password</label>
                        <input type="password" placeholder="e.g. ••••••••" value={addUserForm.password} onChange={e => setAddUserForm({...addUserForm, password: e.target.value})} style={{ width: '100%', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '10px', color: 'var(--t1)', fontSize: '0.9rem' }} required />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                      <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--gb)', color: 'var(--t2)', width: 'auto', padding: '12px 24px', borderRadius: '10px' }} onClick={() => setShowAddUserForm(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '12px 32px', borderRadius: '10px', background: 'var(--a1)', color: '#fff', fontWeight: 600 }}>Create Account</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Search filter & Table */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--gb)', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', margin: 0 }}>Registered User Base</h3>
                  <div style={{ position: 'relative', width: '360px', maxWidth: '100%' }}>
                    <input 
                      type="text" 
                      placeholder="🔍 Search users by username, name, or email..." 
                      value={adminSearchQuery}
                      onChange={e => setAdminSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '10px 16px 10px 40px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '10px', color: 'var(--t1)', fontSize: '0.85rem' }}
                    />
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', fontSize: '0.9rem', pointerEvents: 'none' }}></span>
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div className="empty-icon" style={{ fontSize: '2.5rem', marginBottom: '14px' }}>🔍</div>
                    <p style={{ fontSize: '1rem', color: 'var(--t2)', fontWeight: 600 }}>No users found matching your search</p>
                    <p className="sub" style={{ color: 'var(--t3)', fontSize: '0.82rem', marginTop: '4px' }}>Try adjusting your filters or spelling</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--gb)' }}>
                          <th style={{ padding: '12px 16px', color: 'var(--t3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Details</th>
                          <th style={{ padding: '12px 16px', color: 'var(--t3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account ID</th>
                          <th style={{ padding: '12px 16px', color: 'var(--t3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access Info</th>
                          <th style={{ padding: '12px 16px', color: 'var(--t3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Info</th>
                          <th style={{ padding: '12px 16px', color: 'var(--t3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security Role</th>
                          <th style={{ padding: '12px 16px', color: 'var(--t3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => {
                          const userAvatar = AVATARS.find(a => a.id === user.avatarId) || AVATARS[0];
                          const userHistory = JSON.parse(localStorage.getItem('history_' + user.email) || '[]');

                          return (
                            <tr key={user.email} style={{ borderBottom: '1px solid var(--gb)', transition: 'background-color 0.2s' }}>
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ background: userAvatar.bg, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                    {userAvatar.char}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '0.9rem' }}>{user.firstName} {user.surname}</div>
                                    <div style={{ color: 'var(--t3)', fontSize: '0.78rem', marginTop: '2px' }}>Email: {user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--a1)', background: 'var(--bg2)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                                  @{user.username}
                                </span>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ fontSize: '0.85rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--t1)' }}>
                                    <span style={{ color: 'var(--t3)' }}>Pass:</span> 
                                    <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>{user.password}</span>
                                  </div>
                                  <div style={{ color: 'var(--t3)', fontSize: '0.75rem', marginTop: '4px' }}>Scans Count: <strong>{userHistory.length}</strong></div>
                                </div>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>
                                  <div>📞 {user.mobile || 'N/A'}</div>
                                  <div style={{ marginTop: '4px' }}>🌐 {user.country || 'N/A'}</div>
                                </div>
                              </td>
                              <td style={{ padding: '16px' }}>
                                {user.isAdmin ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(79, 70, 229, 0.12)', color: 'var(--a1)', border: '1px solid rgba(79, 70, 229, 0.25)', padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    🔐 Admin
                                  </span>
                                ) : (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--gb)', color: 'var(--t2)', padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    👥 User
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                  <button className="btn" style={{ width: 'auto', padding: '6px 12px', borderRadius: '8px', background: 'var(--bg2)', color: 'var(--t1)', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--gb)' }}
                                    onClick={() => {
                                      setEditingUser({
                                        ...user,
                                        originalEmail: user.email
                                      });
                                      setShowEditUserModal(true);
                                    }}>
                                    ✏️ Edit
                                  </button>
                                  <button className="btn" style={{ width: 'auto', padding: '6px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--err)', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.15)' }}
                                    onClick={() => handleAdminDeleteUser(user.email)}>
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ===== DOCS & API PAGE ===== */}
        {tab === 'docs' && !loading && (
          <div className="page docs-page">
            <div className="docs-container" style={{ display: 'flex', gap: '28px', minHeight: '600px' }}>
              
              {/* Docs Sidebar */}
              <div className="docs-sidebar" style={{ width: '260px', flexShrink: 0 }}>
                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--t3)', marginBottom: '14px', paddingLeft: '12px', fontWeight: 700 }}>Documentation</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { id: 'overview', label: '💡 Platform Overview', desc: 'System architecture & workflow' },
                    { id: 'api', label: '⚡ API Reference', desc: 'Integrate into your codebase' },
                    { id: 'classifiers', label: '🔬 ML Classifiers Wiki', desc: 'Deep dive into 16 models' },
                    { id: 'compliance', label: '⚖️ Safety & Compliance', desc: 'COPPA, DSA & regional laws' },
                  ].map(sec => (
                    <button 
                      key={sec.id} 
                      onClick={() => setActiveDocSection(sec.id)}
                      className={`docs-sec-btn ${activeDocSection === sec.id ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: '12px 16px',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'var(--tr)',
                        background: activeDocSection === sec.id ? 'var(--t1)' : 'transparent',
                        color: activeDocSection === sec.id ? '#ffffff' : 'var(--t2)',
                        width: '100%'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {sec.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '2px', color: activeDocSection === sec.id ? '#e2e8f0' : 'var(--t3)' }}>
                        {sec.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Docs Main Content Area */}
              <div className="docs-body card" style={{ flex: 1, padding: '36px', margin: 0, overflow: 'visible' }}>
                
                {/* 1. OVERVIEW */}
                {activeDocSection === 'overview' && (
                  <div className="docs-section-content" style={{ animation: 'fU 0.3s ease' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 12px 0', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      💡 Platform Overview
                    </h2>
                    <p style={{ color: 'var(--t2)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                      Welcome to the developer and operator manual for <strong>Content Moderation AI</strong>. This system combines advanced deep learning pipelines, text transformers, and visual heuristics to safeguard your platforms against inappropriate content in real time.
                    </p>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '12px', marginTop: '24px' }}>
                      ⚙️ End-to-End Safety Workflow
                    </h3>
                    <p style={{ color: 'var(--t2)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '16px' }}>
                      Whenever content is submitted—whether it's a block of text, an uploaded image, a frameset of video, a document, or a scraped webpage URL—the platform runs a coordinated multi-agent classification pipeline:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }} className="overview-subgrid">
                      <div style={{ background: 'var(--bg2)', padding: '18px', borderRadius: '12px', border: '1px solid var(--gb)' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--t1)' }}>🚀 1. Input Processing & Ingestion</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--t2)', lineHeight: '1.5' }}>
                          Raw inputs are structured. For documents (PDFs, Word), text is dynamically extracted. For URLs, page content is fetched and cleansed of HTML elements. For videos, keyframes are extracted chronologically.
                        </p>
                      </div>
                      <div style={{ background: 'var(--bg2)', padding: '18px', borderRadius: '12px', border: '1px solid var(--gb)' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--t1)' }}>🤖 2. Coordinated ML Inference</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--t2)', lineHeight: '1.5' }}>
                          Enabled models execute in parallel on the GPU/CPU. The <strong>BART-large-MNLI</strong> model processes text semantics against zero-shot labels. The <strong>Falconsai NSFW</strong> classifier scans images or video keyframes.
                        </p>
                      </div>
                      <div style={{ background: 'var(--bg2)', padding: '18px', borderRadius: '12px', border: '1px solid var(--gb)' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--t1)' }}>📊 3. Safety Metric Compilation</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--t2)', lineHeight: '1.5' }}>
                          Confidence indexes from all enabled classifiers are compiled. A maximum category risk coefficient is derived. The system automatically assigns a status: <em>APPROVED</em>, <em>NEEDS_REVIEW</em>, or <em>FLAGGED</em>.
                        </p>
                      </div>
                      <div style={{ background: 'var(--bg2)', padding: '18px', borderRadius: '12px', border: '1px solid var(--gb)' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--t1)' }}>👥 4. Human-In-The-Loop Review</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--t2)', lineHeight: '1.5' }}>
                          Submissions that score in the medium-risk threshold are held in quarantine. Admins can view the granular classifier breakdown, and manually override decisions to either Approve or Flag content.
                        </p>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '12px' }}>
                      🛡️ System Safety Coefficients
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid var(--gb)' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--gb)' }}>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700 }}>Risk Level</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700 }}>Threshold Range</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700 }}>Automatic Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--gb)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ok)' }}>🟢 APPROVED</td>
                          <td style={{ padding: '12px 16px' }}>Max Score &le; 0.40</td>
                          <td style={{ padding: '12px 16px' }}>Allowed instantly. Marked as safe for audience distribution.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--gb)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--warn)' }}>🟠 NEEDS REVIEW</td>
                          <td style={{ padding: '12px 16px' }}>0.40 &lt; Max Score &le; 0.60</td>
                          <td style={{ padding: '12px 16px' }}>Quarantined. Dispatched to the Admin Manual Review queue.</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--err)' }}>🔴 FLAGGED</td>
                          <td style={{ padding: '12px 16px' }}>Max Score &gt; 0.60</td>
                          <td style={{ padding: '12px 16px' }}>Blocked instantly. Logged in safety logs with trigger keyword records.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 2. API REFERENCE */}
                {activeDocSection === 'api' && (
                  <div className="docs-section-content" style={{ animation: 'fU 0.3s ease' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 12px 0', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      ⚡ API Reference
                    </h2>
                    <p style={{ color: 'var(--t2)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                      Our platform exposes simple and standardized HTTP POST endpoints, enabling developers to integrate content safety filters directly into their signup forms, comments, media upload pipelines, and chat boxes.
                    </p>

                    {/* Language Switcher */}
                    <div style={{ display: 'flex', gap: '8px', background: 'var(--bg2)', padding: '4px', borderRadius: '10px', width: 'fit-content', marginBottom: '20px' }}>
                      {[
                        { id: 'python', label: '🐍 Python' },
                        { id: 'javascript', label: '🌐 JavaScript' },
                        { id: 'curl', label: '💻 cURL' }
                      ].map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => setApiLang(lang.id)}
                          style={{
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'var(--tr)',
                            background: apiLang === lang.id ? 'var(--card)' : 'transparent',
                            color: apiLang === lang.id ? 'var(--t1)' : 'var(--t3)',
                            boxShadow: apiLang === lang.id ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                          }}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>

                    {/* Code Snippets */}
                    <div style={{ background: '#09090b', color: '#f4f4f5', padding: '24px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.6', position: 'relative', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)' }}>
                      
                      {/* PYTHON CODE */}
                      {apiLang === 'python' && (
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`import requests

# Set API Endpoint URL
API_URL = "http://localhost:8000/moderate/text"

# Define payload text to scan
params = {
    "text": "Please click here to get free money and crypto payouts!",
    "enabled_models": "spam,toxicity,hate_speech"
}

# Perform Moderation Check
response = requests.post(API_URL, params=params)

if response.status_code == 200:
    data = response.json()
    print("Submission ID:", data["submission_id"])
    print("Overall Safety Verdict:", data["status"])
    print("Classifiers Detail:", data["results"])
else:
    print("Moderation Check Failed:", response.text)`}
                        </pre>
                      )}

                      {/* JAVASCRIPT CODE */}
                      {apiLang === 'javascript' && (
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`// Perform Content Moderation using fetch or axios
const textContent = "This is stupid and extremely trash.";
const API_URL = \`http://localhost:8000/moderate/text?text=\${encodeURIComponent(textContent)}&enabled_models=toxicity,profanity\`;

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Accept': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log("Verdict Status:", data.status); // APPROVED | FLAGGED | NEEDS_REVIEW
  if (data.status === "FLAGGED") {
    alert("Warning: Your content was flagged as unsafe.");
  }
})
.catch(error => console.error("Error during scanning:", error));`}
                        </pre>
                      )}

                      {/* CURL CODE */}
                      {apiLang === 'curl' && (
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`# Moderate a string of text using cURL
curl -X POST \\
  "http://localhost:8000/moderate/text?text=This%20is%20hate%20speech%20scum!&enabled_models=hate_speech,toxicity" \\
  -H "accept: application/json"

# Scan an uploaded image for NSFW media
curl -X POST \\
  "http://localhost:8000/moderate/image" \\
  -H "accept: application/json" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@/path/to/image.jpg"`}
                        </pre>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '12px', marginTop: '28px' }}>
                      📋 Endpoint Directory
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { method: 'POST', path: '/moderate/text', desc: 'Scan text content for all 15 verbal safety categories.' },
                        { method: 'POST', path: '/moderate/image', desc: 'Scan images (.png, .jpg, .webp) for adult or graphic NSFW media.' },
                        { method: 'POST', path: '/moderate/video', desc: 'Decompile uploaded video frames and run safety scan on individual scenes.' },
                        { method: 'POST', path: '/moderate/url', desc: 'Crawl page text from a remote URL and check for malicious or false news context.' },
                        { method: 'POST', path: '/moderate/document', desc: 'Extract and analyze text from multi-page PDF, Word, Excel, or PPT files.' },
                        { POST_GET: 'GET', path: '/results/{submission_id}', desc: 'Fetch stored records, classifications, overrides, and timestamps.' }
                      ].map((route, idx) => (
                        <div key={idx} style={{ padding: '14px 18px', background: 'var(--bg2)', borderRadius: '10px', border: '1px solid var(--gb)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 800, 
                            color: '#ffffff', 
                            background: route.method ? 'var(--a1)' : '#10b981', 
                            padding: '4px 8px', 
                            borderRadius: '6px',
                            minWidth: '55px',
                            textAlign: 'center'
                          }}>
                            {route.method || route.POST_GET}
                          </span>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--t1)', display: 'block' }}>{route.path}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--t2)', display: 'block', marginTop: '2px' }}>{route.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. CLASSIFIERS WIKI */}
                {activeDocSection === 'classifiers' && (
                  <div className="docs-section-content" style={{ animation: 'fU 0.3s ease' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 12px 0', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      🔬 ML Classifiers Wiki
                    </h2>
                    <p style={{ color: 'var(--t2)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                      Our platform employs <strong>16 dedicated safety classifier agents</strong>. Zero-shot classification translates the high-dimensional conceptual bounds of safe/unsafe into numerical probabilities.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="wiki-grid">
                      {features.map((feat, idx) => {
                        let severity = '🔴 High Severity';
                        let severityBg = 'rgba(239, 68, 68, 0.1)';
                        let severityColor = '#ef4444';
                        
                        if (['spam', 'profanity', 'copyright', 'pseudoscience'].includes(feat.id)) {
                          severity = '🟢 Low Severity';
                          severityBg = 'rgba(34, 197, 94, 0.1)';
                          severityColor = '#16a34a';
                        } else if (['misinformation', 'phishing', 'defamation', 'hate_symbols'].includes(feat.id)) {
                          severity = '🟠 Medium Severity';
                          severityBg = 'rgba(234, 88, 12, 0.1)';
                          severityColor = '#ea580c';
                        }
                        
                        return (
                          <div key={idx} style={{ border: '1px solid var(--gb)', padding: '20px', borderRadius: '16px', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <span style={{ fontSize: '1.8rem' }}>{feat.icon}</span>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  fontWeight: 800, 
                                  background: severityBg, 
                                  color: severityColor, 
                                  padding: '4px 10px', 
                                  borderRadius: '20px' 
                                }}>
                                  {severity}
                                </span>
                              </div>
                              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px 0' }}>{feat.title}</h3>
                              <p style={{ fontSize: '0.78rem', color: 'var(--t2)', lineHeight: '1.5', margin: '0 0 12px 0' }}>{feat.desc}</p>
                            </div>
                            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--gb)', fontSize: '0.72rem', color: 'var(--t3)', lineHeight: '1.4' }}>
                              <strong>Trigger Profiles:</strong> {
                                feat.id === 'hate_speech' ? 'Targeting minorities, xenophobia, racial slurs, gender discrimination.' :
                                feat.id === 'toxicity' ? 'Insulting comments, arguments, personal attacks, harsh criticisms.' :
                                feat.id === 'violence' ? 'Weapons, execution details, threats of physical force, gun violence.' :
                                feat.id === 'misinformation' ? 'Conspiracy statements, vaccine hoaxes, fake election counts.' :
                                feat.id === 'spam' ? 'Repetitive messages, affiliate link clickbait, free giveaways.' :
                                feat.id === 'self_harm' ? 'Suicide idealization, self-cutting references, eating disorders.' :
                                feat.id === 'cyberbullying' ? 'Doxxing, personal blackmailing, persistent targeted mockings.' :
                                feat.id === 'extremism' ? 'Manifestos, terrorist symbols, recruitment prompts.' :
                                feat.id === 'profanity' ? 'Common swear words, vulgarity, raw slang expressions.' :
                                feat.id === 'sexual_content' ? 'Adult erotica, explicit literature, body parts detail.' :
                                feat.id === 'phishing' ? 'Password request hooks, credit card verification spoofing.' :
                                feat.id === 'defamation' ? 'Slanderous business reports, illegal personal accusation scams.' :
                                feat.id === 'hate_symbols' ? 'Fascist signs, supremacy emblems, white pride code.' :
                                feat.id === 'pseudoscience' ? 'Unscientific medical advice, fake crystal healing claims.' :
                                feat.id === 'copyright' ? 'Pirated movie download keygens, leaked game packages.' :
                                'Explicit visual media, adult imagery, adult movies.'
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. COMPLIANCE & SAFETY */}
                {activeDocSection === 'compliance' && (
                  <div className="docs-section-content" style={{ animation: 'fU 0.3s ease' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 12px 0', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      ⚖️ Safety & Compliance Standards
                    </h2>
                    <p style={{ color: 'var(--t2)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                      Digital content rules demand transparent and immediate safety screening. Content Moderation AI satisfies the technical criteria across three international regulatory standards:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* EU DSA */}
                      <div style={{ border: '1px solid var(--gb)', padding: '24px', borderRadius: '16px', background: 'var(--bg2)' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          🇪🇺 European Union Digital Services Act (DSA)
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--t2)', lineHeight: '1.6', margin: 0 }}>
                          The DSA mandates that online intermediaries incorporate immediate "Notice & Action" measures and clear transparency guidelines to remove illegal content (hate speech, violence, terror, illegal trade). Our real-time quarantine and human override tools allow platforms to instantly enforce content flagging, trace complaints back to audit IDs, and generate legal PDF compliance reports.
                        </p>
                      </div>

                      {/* US COPPA */}
                      <div style={{ border: '1px solid var(--gb)', padding: '24px', borderRadius: '16px', background: 'var(--bg2)' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          🇺🇸 Children\'s Online Privacy Protection Act (COPPA)
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--t2)', lineHeight: '1.6', margin: 0 }}>
                          COPPA prohibits gathering personally identifiable information (PII) of children under 13 without parents\' consent. Chat systems that permit open text and media uploads run a massive risk of children typing in home addresses, mobile numbers, or school locations. Our custom Phishing, Toxicity, and Image NSFW classifiers automatically alert administrators whenever children begin sending inappropriate data.
                        </p>
                      </div>

                      {/* INDIA IT RULES */}
                      <div style={{ border: '1px solid var(--gb)', padding: '24px', borderRadius: '16px', background: 'var(--bg2)' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          🇮🇳 Indian IT (Intermediary Guidelines) Rules 2021
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--t2)', lineHeight: '1.6', margin: 0 }}>
                          Under Rule 3 of the IT Act 2021, online intermediaries are required to take down illegal content (specifically material that endangers public order, violates defamation, or threatens national sovereignty) within 24 to 36 hours of receipt of complaints. Content Moderation AI establishes automated quarantine flags for terrorism, misinformation, and extremism, helping webmasters comply with rapid response windows.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}



        {/* ===== DEVELOPERS PAGE ===== */}
        {tab === 'about' && !loading && (
          <div className="page developers-page" style={{ padding: '20px 0 60px', position: 'relative', overflow: 'hidden' }}>
            <div className="dev-glow-bg" style={{ top: '20%', left: '10%' }}></div>
            <div className="dev-glow-bg pink" style={{ bottom: '10%', right: '10%' }}></div>
            
            <div className="card" style={{ padding: '44px 36px', maxWidth: '960px', margin: '0 auto', background: 'var(--glass)', backdropFilter: 'blur(30px)', border: '1px solid var(--gb)', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', position: 'relative', zIndex: 1 }}>
              
              <div style={{ textAlign: 'center', marginBottom: '44px' }}>
                <span style={{ fontSize: '3rem', display: 'inline-block', marginBottom: '12px', filter: 'drop-shadow(0 4px 15px rgba(108,92,231,0.25))' }}>💻</span>
                <h2 style={{ fontSize: '2.4rem', fontWeight: 800, background: 'var(--t1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '10px', letterSpacing: '-0.04em', lineHeight: '1.2' }}>
                  Meet the Developers
                </h2>
                <p style={{ color: 'var(--t2)', fontSize: '0.98rem', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6, fontWeight: 400 }}>
                  The visionary minds driving the Content Moderation AI platform. We bridge complex machine learning models with breathtaking, hyper-responsive user interfaces.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', marginTop: '20px' }}>
                
                {/* Developer 1: Abhay Kushwaha */}
                <div className="aesthetic-dev-card">
                  <div className="dev-avatar-wrapper">
                    <div className="dev-avatar-ring"></div>
                    <div className="dev-avatar-inner">👨‍💻</div>
                  </div>
                  <div className="dev-tag">Co-Founder & ML Architect</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '8px', letterSpacing: '-0.02em' }}>Abhay Kushwaha</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--t2)', lineHeight: 1.6, marginBottom: '24px', minHeight: '72px', padding: '0 10px' }}>
                    A machine learning specialist passionate about training neural networks, API optimization, and real-time safety enforcement algorithms.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a 
                      href="https://www.linkedin.com/in/abhay-kushwaha29/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="dev-linkedin-btn">
                      <span style={{ fontSize: '1.05rem' }}>💙</span> LinkedIn
                    </a>
                    <a 
                      href="https://github.com/AbhayKushwaha29004" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="dev-github-btn">
                      <span style={{ fontSize: '1.05rem' }}>🐈‍⬛</span> GitHub
                    </a>
                  </div>
                </div>

                {/* Developer 2: Ayushi Mishra */}
                <div className="aesthetic-dev-card pink-hover">
                  <div className="dev-avatar-wrapper">
                    <div className="dev-avatar-ring pink"></div>
                    <div className="dev-avatar-inner">👩‍💻</div>
                  </div>
                  <div className="dev-tag pink">Co-Founder & UI/UX Director</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '8px', letterSpacing: '-0.02em' }}>Ayushi Mishra</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--t2)', lineHeight: 1.6, marginBottom: '24px', minHeight: '72px', padding: '0 10px' }}>
                    A human-centered designer specialized in modern responsive web ecosystems, glassmorphism aesthetics, and fluid micro-animations.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a 
                      href="https://www.linkedin.com/in/ayushi-mishra-engg/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="dev-linkedin-btn">
                      <span style={{ fontSize: '1.05rem' }}>💙</span> LinkedIn
                    </a>
                    <a 
                      href="https://github.com/THEAYUSHIMISHRA" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="dev-github-btn">
                      <span style={{ fontSize: '1.05rem' }}>🐈‍⬛</span> GitHub
                    </a>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="settings-sidebar">
              <h3>Settings</h3>
              <ul>
                {['General', 'Account', 'Privacy', 'Billing', 'Capabilities', 'Connectors'].map(t => (
                    <li 
                      key={t} 
                      className={activeSettingsTab === t.toLowerCase() ? 'active' : ''}
                      onClick={() => setActiveSettingsTab(t.toLowerCase())}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="settings-content">
                {settingsMessage && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: 'var(--ok)',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <span>✅ {settingsMessage}</span>
                    <span style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setSettingsMessage(null)}>✕</span>
                  </div>
                )}
                {activeSettingsTab === 'connectors' ? (
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Model Connectors</h2>
                    <p className="settings-desc" style={{ color: 'var(--t3)', fontSize: '0.9rem', marginBottom: '20px' }}>Enable or disable specific moderation classifiers. Disabled classifiers will not affect the overall score.</p>
                    <div className="models-list">
                      {classifiers.map(c => (
                        <div key={c.key} className="model-toggle-row">
                          <div className="model-info">
                            <div className="model-name">{c.label}</div>
                            <div className="model-key" style={{ fontSize: '0.75rem', color: 'var(--t3)', marginTop: 2 }}>{c.key}</div>
                          </div>
                          <label className="toggle-switch">
                            <input 
                              type="checkbox" 
                              checked={activeModels[c.key] || false} 
                              onChange={(e) => setActiveModels({...activeModels, [c.key]: e.target.checked})}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeSettingsTab === 'general' ? (
                  <div style={{ padding: '20px 0' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--t1)' }}>General Settings</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div>
                        <h4 style={{ color: 'var(--t1)', marginBottom: '4px' }}>Default API Language</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--t3)', margin: 0 }}>Preferred language for API snippets in documentation.</p>
                      </div>
                      <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--gb)', background: 'var(--bg2)', color: 'var(--t1)' }} value={apiLang} onChange={(e) => setApiLang(e.target.value)}>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="curl">cURL</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div>
                        <h4 style={{ color: 'var(--t1)', marginBottom: '4px' }}>Notifications</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--t3)', margin: 0 }}>Receive system alerts and updates.</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={notificationsEnabled} 
                          onChange={(e) => {
                            setNotificationsEnabled(e.target.checked);
                            setSettingsMessage(e.target.checked ? "System notifications enabled." : "System notifications muted.");
                            setTimeout(() => setSettingsMessage(null), 3000);
                          }} 
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                ) : activeSettingsTab === 'account' ? (
                  <div style={{ padding: '20px 0' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--t1)' }}>Account Configuration</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px' }}>Full Name</label>
                        <input 
                          type="text" 
                          value={tempFullName} 
                          onChange={(e) => setTempFullName(e.target.value)} 
                          style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--gb)', borderRadius: '8px', color: 'var(--t1)', fontSize: '0.9rem' }} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px' }}>Email Address</label>
                        <input 
                          type="email" 
                          value={tempEmail} 
                          onChange={(e) => setTempEmail(e.target.value)} 
                          style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--gb)', borderRadius: '8px', color: 'var(--t1)', fontSize: '0.9rem' }} 
                        />
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleUpdateProfile} 
                      style={{ width: 'auto', padding: '10px 20px', borderRadius: '8px', background: 'var(--a1)', color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      Update Profile
                    </button>
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--gb)' }}>
                      <h4 style={{ color: 'var(--err)', marginBottom: '10px' }}>Danger Zone</h4>
                      <button 
                        className="btn" 
                        onClick={handleDeleteAccount} 
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--err)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                ) : activeSettingsTab === 'privacy' ? (
                  <div style={{ padding: '20px 0' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--t1)' }}>Privacy Settings</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div>
                        <h4 style={{ color: 'var(--t1)', marginBottom: '4px' }}>Data Collection</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--t3)', margin: 0 }}>Allow anonymized usage data to improve our models.</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={dataCollection} 
                          onChange={(e) => {
                            setDataCollection(e.target.checked);
                            setSettingsMessage(e.target.checked ? "Anonymized data collection enabled." : "Data collection opted-out.");
                            setTimeout(() => setSettingsMessage(null), 3000);
                          }} 
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div>
                        <h4 style={{ color: 'var(--t1)', marginBottom: '4px' }}>Save Submission History</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--t3)', margin: 0 }}>Keep a log of your scanned items locally.</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={saveHistory} 
                          onChange={(e) => {
                            setSaveHistory(e.target.checked);
                            setSettingsMessage(e.target.checked ? "Scan logging history enabled." : "Scan logging history disabled.");
                            setTimeout(() => setSettingsMessage(null), 3000);
                          }} 
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <button 
                      className="btn" 
                      onClick={handleDownloadMyData} 
                      style={{ background: 'transparent', color: 'var(--t1)', border: '1px solid var(--gb)', padding: '10px 20px', borderRadius: '8px', marginTop: '10px', cursor: 'pointer' }}
                    >
                      Download My Data
                    </button>
                  </div>
                ) : activeSettingsTab === 'billing' ? (
                  <div style={{ padding: '20px 0' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--t1)' }}>Billing & Plan</h2>
                    <div style={{ background: 'var(--a1)', color: '#fff', padding: '24px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 10px 30px rgba(108, 92, 231, 0.2)' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#fff' }}>Pro Developer Plan</h3>
                      <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px' }}>$49<span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.8 }}>/mo</span></div>
                      <p style={{ fontSize: '0.9rem', opacity: 0.9, margin: 0 }}>Includes up to 100,000 API requests and 16 ML classifiers.</p>
                    </div>
                    <h4 style={{ color: 'var(--t1)', marginBottom: '12px' }}>Payment Method</h4>
                    <div style={{ padding: '16px', border: '1px solid var(--gb)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg2)' }}>
                      <span style={{ fontSize: '1.5rem' }}>💳</span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '0.9rem' }}>Visa ending in 4242</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>Expires 12/26</div>
                      </div>
                    </div>
                  </div>
                ) : activeSettingsTab === 'capabilities' ? (
                  <div style={{ padding: '20px 0' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--t1)' }}>System Capabilities</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {[
                        { title: 'Text Moderation', status: 'Active', icon: '📝' },
                        { title: 'Image Scanning', status: 'Active', icon: '🖼️' },
                        { title: 'Video Processing', status: 'Active', icon: '🎥' },
                        { title: 'URL Crawling', status: 'Active', icon: '🔗' },
                        { title: 'Document Parsing', status: 'Active', icon: '📄' },
                        { title: 'Audio Transcription', status: 'Coming Soon', icon: '🎙️' }
                      ].map((cap, i) => (
                        <div key={i} style={{ padding: '16px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.5rem' }}>{cap.icon}</span>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: '0.9rem' }}>{cap.title}</div>
                            <div style={{ fontSize: '0.75rem', color: cap.status === 'Active' ? 'var(--ok)' : 'var(--warn)', fontWeight: 600, marginTop: '2px' }}>{cap.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px 0' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{activeSettingsTab.charAt(0).toUpperCase() + activeSettingsTab.slice(1)}</h2>
                    <p className="settings-desc" style={{ color: 'var(--t3)' }}>Configuration options for {activeSettingsTab} will appear here.</p>
                  </div>
                )}
              </div>
              <button className="settings-close" onClick={() => setShowSettings(false)}>✕</button>
            </div>
          </div>
      )}

      {/* ===== EDIT USER MODAL ===== */}
      {showEditUserModal && editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.25s ease-out' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--gb)', padding: '32px', borderRadius: '24px', width: '600px', maxWidth: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, background: 'var(--ag)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
                ✏️ Edit Account: {editingUser.firstName} {editingUser.surname}
              </h2>
              <p style={{ color: 'var(--t3)', fontSize: '0.8rem', marginTop: '4px' }}>Modify profile, credentials, mobile or country details.</p>
            </div>
            
            <form onSubmit={handleAdminEditUserSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username (ID)</label>
                  <input type="text" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '8px', color: 'var(--t1)', fontSize: '0.88rem' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                  <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '8px', color: 'var(--t1)', fontSize: '0.88rem' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>First Name</label>
                  <input type="text" value={editingUser.firstName} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '8px', color: 'var(--t1)', fontSize: '0.88rem' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Surname</label>
                  <input type="text" value={editingUser.surname} onChange={e => setEditingUser({...editingUser, surname: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '8px', color: 'var(--t1)', fontSize: '0.88rem' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile Number</label>
                  <input type="text" value={editingUser.mobile || ''} onChange={e => setEditingUser({...editingUser, mobile: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '8px', color: 'var(--t1)', fontSize: '0.88rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Country</label>
                  <input type="text" value={editingUser.country || ''} onChange={e => setEditingUser({...editingUser, country: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '8px', color: 'var(--t1)', fontSize: '0.88rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                  <input type="text" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--gb)', borderRadius: '8px', color: 'var(--t1)', fontSize: '0.88rem', fontFamily: 'monospace' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security Role</label>
                  <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                    {ADMIN_EMAILS.includes(editingUser.email.toLowerCase()) ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(79, 70, 229, 0.12)', color: 'var(--a1)', border: '1px solid rgba(79, 70, 229, 0.25)', padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        🔐 Admin (Auto-Promoted)
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--gb)', color: 'var(--t2)', padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        👥 Standard User Profile
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Avatar Selection Grid */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Modify Avatar</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '6px', background: 'var(--bg2)', padding: '8px', borderRadius: '10px', border: '1px solid var(--gb)' }}>
                  {AVATARS.map(av => (
                    <div 
                      key={av.id}
                      onClick={() => setEditingUser({...editingUser, avatarId: av.id})}
                      style={{ 
                        background: av.bg,
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        border: editingUser.avatarId === av.id ? '2.5px solid #6c5ce7' : '1px solid transparent',
                        boxShadow: editingUser.avatarId === av.id ? '0 0 10px rgba(108, 92, 231, 0.4)' : 'none',
                        transform: editingUser.avatarId === av.id ? 'scale(1.12)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                      title={av.label}
                    >
                      {av.char}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--gb)', color: 'var(--t2)', width: 'auto', padding: '10px 20px', borderRadius: '8px' }} onClick={() => { setShowEditUserModal(false); setEditingUser(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px', borderRadius: '8px', background: 'var(--a1)', color: '#fff', fontWeight: 600 }}>Save Changes</button>
              </div>
            </form>
            <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--t3)', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => { setShowEditUserModal(false); setEditingUser(null); }}>✕</button>
          </div>
        </div>
      )}

      <div className="footer"><p>Content Moderation AI · 16 ML Classifiers · Text, Image, Video, PDF & URL Analysis · v3.0</p></div>
    </div>
    </>
  );
}

export default App;
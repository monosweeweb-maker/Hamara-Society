import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  LayoutDashboard,
  Megaphone,
  AlertTriangle,
  Wallet,
  Users,
  Calendar,
  Vote,
  LogOut,
  Bell,
  Menu,
  X,
  Plus,
  CheckCircle,
  Clock,
  ShieldAlert,
  ShoppingBag,
  Car,
  TrendingUp,
  UserCheck,
  Building,
  ArrowRight,
  Shield,
  Smartphone,
  Moon,
  Sun,
  Phone,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  FileText,
  CreditCard,
  Home
} from 'lucide-react';

// --- Firebase Configuration ---
// ************************************************************************************************
// HOSTING ON VERCEL:
// 1. Create a GitHub repo and push this code.
// 2. Import project into Vercel.
// 3. In Vercel Project Settings > Environment Variables, add your Firebase keys.
// 4. Update the config below to use process.env.REACT_APP_... (or import.meta.env for Vite).
//
// FOR LOCAL RUN: Replace the returned object below with your actual Firebase config.
// ************************************************************************************************
const getFirebaseConfig = () => {
  try {
    if (typeof __firebase_config !== 'undefined') {
      return JSON.parse(__firebase_config);
    }
  } catch (e) {
    console.error("Firebase Config Error:", e);
  }

  // REPLACE THIS WITH YOUR REAL CONFIG FOR LOCAL DEVELOPMENT
  return {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
};

const app = initializeApp(getFirebaseConfig());
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'humara-society-app';

// --- Constants ---
const ROLES = {
  ADMIN: 'Admin',
  PRESIDENT: 'President',
  SECRETARY: 'Secretary',
  TREASURER: 'Treasurer',
  RESIDENT: 'Resident',
  TENANT: 'Tenant',
  STAFF: 'Staff'
};

const TABS = {
  DASHBOARD: 'dashboard',
  NOTICES: 'notices',
  COMPLAINTS: 'complaints',
  FINANCE: 'finance',
  DIRECTORY: 'directory',
  REQUESTS: 'requests',
  AMENITIES: 'amenities',
  ELECTIONS: 'elections',
  CLASSIFIEDS: 'classifieds',
  VISITORS: 'visitors',
  RENTALS: 'rentals',
  SETTINGS: 'settings'
};

const STATUS = { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
const MEMBER_STATUS = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' };

// --- Reusable Components ---

const Badge = ({ children, color }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
    {children}
  </span>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up flex flex-col">
        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><X size={20} /></button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Custom Icons ---
const XIcon = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// --- EXTRACTED APP WRAPPER ---
const AppWrapper = ({ children, darkMode }) => (
  <div className={darkMode ? 'dark' : ''}>
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      {children}
    </div>
  </div>
);

// --- Sub-Views & Modals ---

const AuthModal = ({
  show,
  onClose,
  mode,
  setMode,
  formData,
  setFormData,
  onSubmit,
  loading,
  error
}) => {
  if (!show) return null;

  return (
    <Modal isOpen={show} onClose={onClose} title={mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join Society' : 'Create New Society'}>
      <div className="space-y-4">
        {mode !== 'login' && (
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg mb-4">
            <button onClick={() => setMode('register')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'register' ? 'bg-white dark:bg-slate-600 shadow text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>Join Existing</button>
            <button onClick={() => setMode('create-society')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'create-society' ? 'bg-white dark:bg-slate-600 shadow text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>Create New</button>
          </div>
        )}

        {(mode === 'register' || mode === 'create-society') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="John Doe"
              value={formData.fullName || ''}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
          <input
            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            placeholder="name@example.com"
            value={formData.email || ''}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            placeholder="••••••••"
            value={formData.password || ''}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        {mode === 'create-society' && (
          <div className="space-y-2 pt-2">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg text-xs text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800/50">
              A unique Society ID will be generated for you to share with residents.
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Society Name</label>
            <input
              className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="e.g. Green Valley Apartments"
              value={formData.societyName || ''}
              onChange={e => setFormData({ ...formData, societyName: e.target.value })}
            />
          </div>
        )}

        {mode === 'register' && (
          <>
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Society Code</label>
              <input
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono uppercase bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="SOC-XXXXXX"
                value={formData.societyCode || ''}
                onChange={e => setFormData({ ...formData, societyCode: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit / Flat Number</label>
              <input
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="e.g. A-101"
                value={formData.unitNumber || ''}
                onChange={e => setFormData({ ...formData, unitNumber: e.target.value })}
              />
            </div>
          </>
        )}

        {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition mt-4 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
        >
          {loading ? 'Processing...' : (mode === 'login' ? 'Login' : mode === 'register' ? 'Submit Request' : 'Create Society')}
        </button>

        {mode === 'login' && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            New here? <button onClick={() => setMode('register')} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Create an account</button>
          </div>
        )}
        {mode !== 'login' && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Already have an account? <button onClick={() => setMode('login')} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Log in</button>
          </div>
        )}
      </div>
    </Modal>
  );
};

const ContactModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Contact Us">
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <input className="w-full p-3 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Your Name" />
        <input className="w-full p-3 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Email Address" />
        <input className="w-full p-3 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Phone Number" />
        <textarea className="w-full p-3 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 h-24" placeholder="How can we help?" />
        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition">Send Message</button>
      </div>

      <div className="border-t dark:border-slate-700 pt-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Connect with us</h4>
        <div className="flex flex-col gap-3">
          <a href="tel:+919531273486" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full"><Phone size={18} className="text-emerald-600 dark:text-emerald-400" /></div>
            +91-95312-73486
          </a>
          <div className="flex gap-4 mt-2">
            <a href="https://www.instagram.com/monoswee_nath/" target="_blank" rel="noreferrer" className="text-pink-600 hover:scale-110 transition"><Instagram size={24} /></a>
            <a href="https://www.facebook.com/monoswee.nath/" target="_blank" rel="noreferrer" className="text-blue-600 hover:scale-110 transition"><Facebook size={24} /></a>
            <a href="https://www.linkedin.com/in/monoswee-nath/" target="_blank" rel="noreferrer" className="text-blue-700 hover:scale-110 transition"><Linkedin size={24} /></a>
            <a href="https://x.com/Monoswee_Nath/" target="_blank" rel="noreferrer" className="text-black dark:text-white hover:scale-110 transition"><XIcon size={22} /></a>
          </div>
        </div>
      </div>
    </div>
  </Modal>
);

const PrivacyModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Privacy & Terms">
    <div className="space-y-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
      <h4 className="font-bold text-gray-800 dark:text-white">1. Data Privacy</h4>
      <p>We respect your privacy. All personal data such as contact numbers and emails are encrypted and stored securely on Google Cloud Firebase servers. We do not sell your data to third parties.</p>

      <h4 className="font-bold text-gray-800 dark:text-white">2. Usage Terms</h4>
      <p>This platform is intended for society management purposes only. Any misuse, abusive language in complaints, or spamming in notice boards may result in account suspension by your society admin.</p>

      <h4 className="font-bold text-gray-800 dark:text-white">3. Payments</h4>
      <p>Online payments are processed via secure third-party gateways. Humara Society does not store your card details or banking passwords.</p>

      <div className="pt-4 mt-4 border-t dark:border-slate-700 text-xs text-gray-400">
        Last updated: December 2025
      </div>
    </div>
  </Modal>
);

const LandingPage = ({ onAuthClick, setAuthMode }) => {
  const [showContact, setShowContact] = useState(false);
  // Add state for PrivacyModal to fix reference error
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-200">
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto border-b dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-2xl text-emerald-700 dark:text-emerald-500">
          <Building className="h-8 w-8" /> Humara Society
        </div>
        <div className="flex gap-4">
          <button onClick={() => { setAuthMode('login'); onAuthClick(); }} className="px-4 py-2 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition">Log In</button>
          <button onClick={() => { setAuthMode('register'); onAuthClick(); }} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg shadow hover:bg-emerald-700 transition">Get Started</button>
        </div>
      </nav>

      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Smart Living for <br /><span className="text-emerald-600 dark:text-emerald-400">Smart Communities</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Streamline your society management. Payments, complaints, notices, and security - handled effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={() => { setAuthMode('create-society'); onAuthClick(); }} className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 hover:scale-105 transition flex items-center justify-center gap-2">
              Create Society <ArrowRight size={20} />
            </button>
            <button onClick={() => { setAuthMode('register'); onAuthClick(); }} className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              Join Existing
            </button>
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl p-8 rotate-3 shadow-2xl transition-transform hover:rotate-0 duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b dark:border-slate-700">
                <div className="font-bold text-lg">Dashboard</div>
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="h-16 bg-gray-50 dark:bg-slate-700 rounded-lg w-full flex items-center px-4 gap-3">
                  <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full"></div>
                  <div className="h-2 w-24 bg-gray-200 dark:bg-slate-600 rounded"></div>
                </div>
                <div className="h-16 bg-gray-50 dark:bg-slate-700 rounded-lg w-full flex items-center px-4 gap-3">
                  <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-full"></div>
                  <div className="h-2 w-32 bg-gray-200 dark:bg-slate-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Building className="h-6 w-6 text-emerald-500" /> Humara Society
            </div>
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Humara Society. All rights reserved. <br />
              Designed by <a href="https://jinamatrix.in" target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer">JinaMatrix.in</a>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition">Privacy</button>
            <button onClick={() => setShowContact(true)} className="hover:text-white transition">Contact</button>
          </div>
        </div>
      </footer>
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
};

// --- Internal Views ---

const DashboardView = ({ userData, societyData, bills, complaints, setActiveTab }) => {
  const myDues = bills.filter(b => b.unitNumber === userData.unitNumber && b.status === 'Unpaid')
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const activeComplaints = complaints.filter(c => c.status !== STATUS.CLOSED).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 md:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {userData.fullName.split(' ')[0]}! 👋</h1>
          <p className="opacity-90">Society: {societyData?.name} <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-sm font-mono">{societyData?.id}</span></p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
          <Building size={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Due</p>
              <h2 className="text-3xl font-bold mt-1 text-gray-800 dark:text-white">₹{myDues}</h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-600 dark:text-red-400"><Wallet size={24} /></div>
          </div>
          <button
            onClick={() => setActiveTab(TABS.FINANCE)}
            className="mt-4 w-full bg-gray-900 dark:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-slate-600 transition"
          >
            Pay Now
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Active Complaints</p>
              <h2 className="text-3xl font-bold mt-1 text-gray-800 dark:text-white">{activeComplaints}</h2>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-orange-600 dark:text-orange-400"><AlertTriangle size={24} /></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Open tickets in society</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Society Funds</p>
              <h2 className="text-3xl font-bold mt-1 text-gray-800 dark:text-white">₹{societyData?.funds || 0}</h2>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-600 dark:text-blue-400"><TrendingUp size={24} /></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Current Treasury Balance</p>
        </div>
      </div>
    </div>
  );
};

// --- Main Application Component ---
export default function HumaraSocietyApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [societyData, setSocietyData] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // Notif State
  const [authChecked, setAuthChecked] = useState(false);

  // Modals state
  const [modalState, setModalState] = useState({ type: null, isOpen: false });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '', societyName: '', societyCode: '', unitNumber: '' });
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);

  // Footer Modals State (Needed for LandingPage & inside app)
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);

  // Form Data for Modals
  const [formData, setFormData] = useState({});

  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [bills, setBills] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [rentals, setRentals] = useState([]);

  // --- Init ---
  useEffect(() => {
    signOut(auth).catch(console.error);
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setUserData(null);
        setSocietyData(null);
        setShowCompleteProfile(false);
      }
      setAuthChecked(true);
    });

    if (!document.getElementById('tailwind-cdn')) {
      window.tailwind = {
        config: {
          darkMode: 'class',
          theme: { extend: { colors: { emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', } } } }
        }
      };
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
    return () => unsubscribeAuth();
  }, []);

  // --- Fetching ---
  useEffect(() => {
    if (!user) return;
    setProfileError(null);
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    return onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setShowCompleteProfile(false);
        if (data.status === MEMBER_STATUS.PENDING) checkPublicStatus(user.uid);
      } else {
        setProfileError("Profile not found.");
        setUserData(null);
        setShowCompleteProfile(true);
      }
    }, (err) => setProfileError(err.message));
  }, [user]);

  const checkPublicStatus = async (uid) => {
    try {
      const publicRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', uid);
      const snap = await getDoc(publicRef);
      if (snap.exists() && snap.data().status !== MEMBER_STATUS.PENDING) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'), { status: snap.data().status });
      }
    } catch (e) { }
  };

  useEffect(() => {
    if (!userData?.societyId) return;
    const sId = userData.societyId;
    const path = ['artifacts', appId, 'public', 'data'];
    const unsubs = [];
    const safeSub = (q, set) => unsubs.push(onSnapshot(q, s => set(s.docs.map(d => ({ id: d.id, ...d.data() })))));

    unsubs.push(onSnapshot(doc(db, ...path, 'societies', sId), d => d.exists() && setSocietyData(d.data())));
    safeSub(query(collection(db, ...path, `notices_${sId}`), orderBy('createdAt', 'desc')), setNotices);
    safeSub(query(collection(db, ...path, `complaints_${sId}`), orderBy('createdAt', 'desc')), setComplaints);
    safeSub(query(collection(db, ...path, `bills_${sId}`), orderBy('dueDate', 'desc')), setBills);
    safeSub(collection(db, ...path, `amenities_${sId}`), setAmenities);
    safeSub(query(collection(db, ...path, `rentals_${sId}`), orderBy('createdAt', 'desc')), setRentals);

    const profiles = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
    safeSub(query(profiles, where('societyId', '==', sId), where('status', '==', MEMBER_STATUS.APPROVED)), setMembers);
    safeSub(query(profiles, where('societyId', '==', sId), where('status', '==', MEMBER_STATUS.PENDING)), setPendingMembers);

    return () => unsubs.forEach(u => u());
  }, [userData?.societyId]);

  // --- Handlers ---
  const generateSocietyCode = () => `SOC-${Array(6).fill(0).map(() => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32))).join('')}`;

  const initializeUserDocs = async (uid, formData, finalSocId, role, status) => {
    const userPayload = { uid, email: formData.email || user.email, fullName: formData.fullName, societyId: finalSocId, unitNumber: formData.unitNumber || 'N/A', role, status, joinedAt: serverTimestamp() };
    if (authMode === 'create-society') {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'societies', finalSocId), { name: formData.societyName, id: finalSocId, funds: 0, creatorId: uid, createdAt: serverTimestamp() });
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `amenities_${finalSocId}`), { name: 'Club House', capacity: 50, openTime: '09:00', closeTime: '22:00' });
    }
    await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'), userPayload);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', uid), userPayload);
  };

  const handleAuthSubmit = async () => {
    setAuthError('');
    if (!authForm.email || !authForm.password) return setAuthError('Email and Password required.');
    setLoading(true);
    try {
      if (authMode === 'login') {
        try { await signInWithEmailAndPassword(auth, authForm.email, authForm.password); }
        catch (e) { if (e.code === 'auth/operation-not-allowed') throw new Error("Login unavailable in Demo. Register instead."); throw e; }
      } else {
        if (!authForm.fullName) throw new Error("Full Name required.");
        let finalSocId = authForm.societyCode, role = ROLES.RESIDENT, status = MEMBER_STATUS.PENDING;
        if (authMode === 'create-society') {
          if (!authForm.societyName) throw new Error("Society Name required.");
          finalSocId = generateSocietyCode(); role = ROLES.ADMIN; status = MEMBER_STATUS.APPROVED;
        } else {
          if (!authForm.societyCode) throw new Error("Society Code required.");
          const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'societies', authForm.societyCode));
          if (!snap.exists()) throw new Error("Invalid Society Code.");
        }
        try {
          const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
          await sendEmailVerification(cred.user);
          alert("Verification email sent.");
          await initializeUserDocs(cred.user.uid, authForm, finalSocId, role, status);
        } catch (e) {
          if (e.code === 'auth/operation-not-allowed') {
            const anon = await signInAnonymously(auth);
            await initializeUserDocs(anon.user.uid, authForm, finalSocId, role, status);
            alert("Demo Mode: Logged in as Guest.");
          } else throw e;
        }
      }
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', fullName: '', societyName: '', societyCode: '', unitNumber: '' });
    } catch (e) { setAuthError(e.message); } finally { setLoading(false); }
  };

  const handleCompleteProfile = async () => {
    setAuthError('');
    if (!authForm.fullName) return setAuthError("Full Name required.");
    setLoading(true);
    try {
      let finalSocId = authForm.societyCode, role = ROLES.RESIDENT, status = MEMBER_STATUS.PENDING;
      if (authMode === 'create-society') {
        finalSocId = generateSocietyCode(); role = ROLES.ADMIN; status = MEMBER_STATUS.APPROVED;
      } else {
        const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'societies', authForm.societyCode));
        if (!snap.exists()) throw new Error("Invalid Society Code.");
      }
      await initializeUserDocs(user.uid, authForm, finalSocId, role, status);
    } catch (e) { setAuthError(e.message); } finally { setLoading(false); }
  };

  const openModal = (type) => { setModalState({ type, isOpen: true }); setFormData({}); };
  const closeModal = () => setModalState({ type: null, isOpen: false });

  const handleSubmitModal = async () => {
    const sId = userData.societyId;
    const path = ['artifacts', appId, 'public', 'data'];
    try {
      if (modalState.type === 'notice') {
        await addDoc(collection(db, ...path, `notices_${sId}`), { ...formData, postedBy: userData.fullName, role: userData.role, createdAt: serverTimestamp(), type: formData.type || 'General' });
      } else if (modalState.type === 'complaint') {
        await addDoc(collection(db, ...path, `complaints_${sId}`), { ...formData, userId: user.uid, userName: userData.fullName, unitNumber: userData.unitNumber, status: STATUS.OPEN, createdAt: serverTimestamp() });
      } else if (modalState.type === 'maintenance') {
        const batchPromises = members.map(m => addDoc(collection(db, ...path, `bills_${sId}`), { title: formData.title, amount: parseFloat(formData.amount), dueDate: formData.dueDate, status: 'Unpaid', userId: m.uid, unitNumber: m.unitNumber, userName: m.fullName, type: 'Maintenance' }));
        await Promise.all(batchPromises);
        alert(`Bills generated for ${members.length} members.`);
      } else if (modalState.type === 'expense') {
        await addDoc(collection(db, ...path, `expenses_${sId}`), { ...formData, createdBy: userData.fullName, createdAt: serverTimestamp() });
        if (formData.split) {
          const perPerson = parseFloat(formData.amount) / members.length;
          const batchPromises = members.map(m => addDoc(collection(db, ...path, `bills_${sId}`), { title: `Split: ${formData.title}`, amount: perPerson.toFixed(2), dueDate: new Date().toISOString().split('T')[0], status: 'Unpaid', userId: m.uid, unitNumber: m.unitNumber, userName: m.fullName, type: 'Shared Expense' }));
          await Promise.all(batchPromises);
        }
      } else if (modalState.type === 'rental') {
        await addDoc(collection(db, ...path, `rentals_${sId}`), { ...formData, ownerId: user.uid, ownerName: userData.fullName, contact: userData.email, createdAt: serverTimestamp() });
      }
      closeModal();
    } catch (e) { alert("Error: " + e.message); }
  };

  // --- Render ---
  if (!authChecked) return null;
  if (!user) return <AppWrapper darkMode={darkMode}><LandingPage onAuthClick={() => setShowAuthModal(true)} setAuthMode={setAuthMode} /><AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} mode={authMode} setMode={setAuthMode} formData={authForm} setFormData={setAuthForm} onSubmit={handleAuthSubmit} loading={loading} error={authError} /></AppWrapper>;

  if (!userData) return (
    <AppWrapper darkMode={darkMode}><div className="h-screen flex flex-col items-center justify-center p-4">
      {showCompleteProfile ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full border dark:border-slate-700 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Complete Your Profile</h2>
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg mb-4">
            <button onClick={() => setAuthMode('register')} className={`flex-1 py-1.5 text-sm font-medium rounded-md ${authMode === 'register' ? 'bg-white dark:bg-slate-600 shadow' : 'text-gray-500'}`}>Join Society</button>
            <button onClick={() => setAuthMode('create-society')} className={`flex-1 py-1.5 text-sm font-medium rounded-md ${authMode === 'create-society' ? 'bg-white dark:bg-slate-600 shadow' : 'text-gray-500'}`}>Create New</button>
          </div>
          <div className="space-y-3">
            <input className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:text-white" placeholder="Full Name" value={authForm.fullName || ''} onChange={e => setAuthForm({ ...authForm, fullName: e.target.value })} />
            {authMode === 'create-society' ? (
              <input className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:text-white" placeholder="Society Name" value={authForm.societyName || ''} onChange={e => setAuthForm({ ...authForm, societyName: e.target.value })} />
            ) : (
              <>
                <input className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:text-white font-mono uppercase" placeholder="Society Code" value={authForm.societyCode || ''} onChange={e => setAuthForm({ ...authForm, societyCode: e.target.value.toUpperCase() })} />
                <input className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:text-white" placeholder="Unit / Flat No." value={authForm.unitNumber || ''} onChange={e => setAuthForm({ ...authForm, unitNumber: e.target.value })} />
              </>
            )}
          </div>
          {authError && <p className="text-red-500 text-sm">{authError}</p>}
          <button onClick={handleCompleteProfile} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold">Save</button>
          <button onClick={() => signOut(auth)} className="w-full text-gray-500 text-sm mt-2">Sign Out</button>
        </div>
      ) : (
        <div className="text-center"><p className="text-emerald-600 font-medium animate-pulse">Fetching Profile...</p><button onClick={() => signOut(auth)} className="text-sm text-gray-500 underline mt-4">Cancel</button></div>
      )}
    </div></AppWrapper>
  );

  if (userData.status === MEMBER_STATUS.PENDING || userData.status === MEMBER_STATUS.REJECTED) return <AppWrapper darkMode={darkMode}><div className="min-h-screen flex flex-col items-center justify-center p-4 text-center"><div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full border dark:border-slate-700"><h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{userData.status === MEMBER_STATUS.PENDING ? "Approval Pending" : "Access Denied"}</h2><p className="text-gray-600 dark:text-gray-400 mb-6">{userData.status === MEMBER_STATUS.PENDING ? "Waiting for admin approval." : "Your request was rejected."}</p><button onClick={() => signOut(auth)} className="w-full bg-slate-800 dark:bg-slate-700 text-white py-2 rounded-lg">Sign Out</button></div></div></AppWrapper>;

  const isAdmin = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.PRESIDENT, ROLES.TREASURER].includes(userData.role);

  return (
    <AppWrapper darkMode={darkMode}>
      <div className="flex h-screen overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 dark:bg-slate-950 text-white transition-transform transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r dark:border-slate-800`}>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="h-8 w-8 bg-emerald-500 rounded flex items-center justify-center font-bold">H</div><span className="font-bold text-lg">Humara Society</span></div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400"><X size={20} /></button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {[
                { id: TABS.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
                { id: TABS.NOTICES, icon: Megaphone, label: 'Notices' },
                { id: TABS.COMPLAINTS, icon: AlertTriangle, label: 'Complaints' },
                isAdmin && { id: TABS.REQUESTS, icon: UserCheck, label: 'Approvals', badge: pendingMembers.length },
                { id: TABS.FINANCE, icon: Wallet, label: 'Finances' },
                { id: TABS.DIRECTORY, icon: Users, label: 'Directory' },
                { id: TABS.RENTALS, icon: Home, label: 'Rentals & Parking' },
                { id: TABS.AMENITIES, icon: Calendar, label: 'Amenities' },
                { id: TABS.ELECTIONS, icon: Vote, label: 'Elections' },
              ].filter(Boolean).map((item) => (
                <li key={item.id}>
                  <button onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <div className="flex items-center gap-3"><item.icon size={18} />{item.label}</div>
                    {item.badge > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button onClick={() => setDarkMode(!darkMode)} className="hidden md:flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />} {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button onClick={() => signOut(auth)} className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-2 hover:bg-slate-800 rounded-lg transition"><LogOut size={18} /> Sign Out</button>
          </div>
        </aside>

        <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors">
          <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 h-16 flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-600 dark:text-gray-300"><Menu size={24} /></button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">{societyData?.name}</h2>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="md:hidden p-2 text-gray-600 dark:text-gray-300">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
              <button onClick={async () => { if (confirm("TRIGGER PANIC ALERT?")) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `notices_${userData.societyId}`), { title: `🆘 SOS: Unit ${userData.unitNumber}`, content: `Emergency by ${userData.fullName}.`, type: 'Urgent', postedBy: userData.fullName, role: userData.role, createdAt: serverTimestamp(), isPanic: true }); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/30"><ShieldAlert size={14} /> SOS</button>
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700"><Bell size={20} /></button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-700 z-50 overflow-hidden">
                    <div className="p-3 border-b dark:border-slate-700 font-bold dark:text-white">Notifications</div>
                    <div className="max-h-64 overflow-y-auto">
                      {notices.length > 0 ? notices.slice(0, 5).map(n => (
                        <div key={n.id} className="p-3 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                          <p className="text-sm font-medium dark:text-white truncate">{n.title}</p>
                          <p className="text-xs text-gray-500">{new Date(n.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                      )) : <div className="p-3 text-sm text-gray-500">No new notifications</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
              {activeTab === TABS.DASHBOARD && <DashboardView userData={userData} societyData={societyData} bills={bills} complaints={complaints} setActiveTab={setActiveTab} />}

              {activeTab === TABS.NOTICES && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Notice Board</h2>
                    {isAdmin && <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2" onClick={() => openModal('notice')}><Plus size={16} /> Post</button>}
                  </div>
                  {notices.map(n => (
                    <div key={n.id} className={`bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border-l-4 dark:border-slate-700 ${n.type === 'Urgent' ? 'border-l-red-500' : 'border-l-indigo-500'}`}>
                      <div className="flex justify-between mb-2"><Badge color={n.type === 'Urgent' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'}>{n.type}</Badge> <span className="text-xs text-gray-400">{n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toDateString() : ''}</span></div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">{n.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 whitespace-pre-wrap">{n.content}</p>
                      {n.image && <img src={n.image} alt="Notice attachment" className="mt-3 rounded-lg max-h-60 object-cover" />}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === TABS.COMPLAINTS && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Help Desk</h2>
                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2" onClick={() => openModal('complaint')}><Plus size={16} /> New Ticket</button>
                  </div>
                  {complaints.filter(c => c.isPublic || c.userId === user.uid || isAdmin).map(c => (
                    <div key={c.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border dark:border-slate-700">
                      <div className="flex justify-between">
                        <div className="flex gap-2"><Badge color={c.status === STATUS.OPEN ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{c.status}</Badge><Badge color="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">{c.type}</Badge></div>
                        <span className="text-xs text-gray-400">{c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : ''}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-white mt-2">{c.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{c.description}</p>
                      {c.image && <img src={c.image} alt="Complaint attachment" className="mt-2 rounded-lg h-24 object-cover" />}
                      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                        <span>Unit: {c.unitNumber} • {c.userName}</span>
                        {isAdmin && c.status === STATUS.OPEN && <button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `complaints_${userData.societyId}`, c.id), { status: STATUS.RESOLVED })} className="text-green-600 font-bold hover:underline">Mark Resolved</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === TABS.FINANCE && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <h2 className="text-xl font-bold dark:text-white">Financials</h2>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => openModal('expense')} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm flex gap-1 items-center"><CreditCard size={14} /> Add Expense</button>
                        <button onClick={() => openModal('maintenance')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex gap-1 items-center"><FileText size={14} /> Generate Bills</button>
                      </div>
                    )}
                  </div>
                  {/* User Bills */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-600 dark:text-gray-400 text-sm">My Bills</h3>
                    {bills.filter(b => b.userId === user.uid).map(bill => (
                      <div key={bill.id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 shadow-sm">
                        <div><h4 className="font-bold dark:text-white">{bill.title}</h4><p className="text-sm text-gray-500">Due: {bill.dueDate}</p></div>
                        <div className="text-right">
                          <p className="font-bold text-lg dark:text-emerald-400">₹{bill.amount}</p>
                          {bill.status === 'Unpaid' ? <button onClick={async () => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `bills_${userData.societyId}`, bill.id), { status: 'Paid', paidAt: serverTimestamp() }); alert("Paid!"); }} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded mt-1">Pay Now</button> : <span className="text-xs text-green-600 font-bold flex items-center justify-end gap-1"><CheckCircle size={12} /> Paid</span>}
                        </div>
                      </div>
                    ))}
                    {bills.filter(b => b.userId === user.uid).length === 0 && <p className="text-gray-400 text-sm">No pending bills.</p>}
                  </div>
                </div>
              )}

              {activeTab === TABS.RENTALS && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">Rentals & Parking</h2>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2" onClick={() => openModal('rental')}><Plus size={16} /> List Property</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {rentals.map(r => (
                      <div key={r.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between"><Badge color="bg-purple-100 text-purple-700">{r.type}</Badge><span className="font-bold text-green-600">₹{r.price}/mo</span></div>
                        <h3 className="font-bold text-lg mt-2 dark:text-white">{r.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{r.description}</p>
                        <div className="mt-3 pt-3 border-t dark:border-slate-700 text-xs text-gray-500">Contact: {r.ownerName} ({r.contact})</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === TABS.DIRECTORY && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-bold mb-4 dark:text-white">Resident Directory</h2>
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                        <tr><th className="p-4">Name</th><th className="p-4">Unit</th><th className="p-4">Role</th></tr>
                      </thead>
                      <tbody className="divide-y dark:divide-slate-700 text-gray-700 dark:text-gray-300">
                        {members.map(m => (
                          <tr key={m.id}><td className="p-4">{m.fullName}</td><td className="p-4">{m.unitNumber}</td><td className="p-4"><span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{m.role}</span></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === TABS.REQUESTS && (
                <div className="animate-fade-in space-y-4">
                  <h2 className="text-xl font-bold dark:text-white">Pending Requests</h2>
                  {pendingMembers.map(m => (
                    <div key={m.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border dark:border-slate-700 flex justify-between items-center">
                      <div><h4 className="font-bold dark:text-white">{m.fullName}</h4><p className="text-sm text-gray-500">Unit: {m.unitNumber}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', m.id), { status: MEMBER_STATUS.REJECTED })} className="text-red-600 px-3 py-1 border border-red-200 rounded hover:bg-red-50">Reject</button>
                        <button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', m.id), { status: MEMBER_STATUS.APPROVED })} className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Approve</button>
                      </div>
                    </div>
                  ))}
                  {pendingMembers.length === 0 && <p className="text-gray-500">No pending requests.</p>}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Feature Modals */}
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.type === 'notice' ? "Post Notice" : modalState.type === 'complaint' ? "Raise Complaint" : modalState.type === 'maintenance' ? "Generate Bills" : modalState.type === 'expense' ? "Add Expense" : "List Rental"}>
        <div className="space-y-4">
          {modalState.type === 'notice' && (
            <>
              <input className="w-full p-2 border rounded" placeholder="Title" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="w-full p-2 border rounded" placeholder="Content" onChange={e => setFormData({ ...formData, content: e.target.value })} />
              <input className="w-full p-2 border rounded" placeholder="Image URL (optional)" onChange={e => setFormData({ ...formData, image: e.target.value })} />
              <select className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, type: e.target.value })}><option>General</option><option>Urgent</option><option>Event</option></select>
            </>
          )}
          {modalState.type === 'complaint' && (
            <>
              <input className="w-full p-2 border rounded" placeholder="Subject" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="w-full p-2 border rounded" placeholder="Description" onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <input className="w-full p-2 border rounded" placeholder="Image URL (optional)" onChange={e => setFormData({ ...formData, image: e.target.value })} />
              <div className="grid grid-cols-2 gap-2"><select className="p-2 border rounded" onChange={e => setFormData({ ...formData, type: e.target.value })}><option>Maintenance</option><option>Security</option></select><select className="p-2 border rounded" onChange={e => setFormData({ ...formData, priority: e.target.value })}><option>Low</option><option>High</option></select></div>
              <label className="flex gap-2"><input type="checkbox" onChange={e => setFormData({ ...formData, isPublic: e.target.checked })} /> Public Visible</label>
            </>
          )}
          {modalState.type === 'maintenance' && (
            <>
              <input className="w-full p-2 border rounded" placeholder="Bill Title (e.g. Oct Maintenance)" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <input type="number" className="w-full p-2 border rounded" placeholder="Amount (₹)" onChange={e => setFormData({ ...formData, amount: e.target.value })} />
              <input type="date" className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
              <p className="text-xs text-gray-500">This will generate a bill for all approved members.</p>
            </>
          )}
          {modalState.type === 'expense' && (
            <>
              <input className="w-full p-2 border rounded" placeholder="Expense Title" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <input type="number" className="w-full p-2 border rounded" placeholder="Amount (₹)" onChange={e => setFormData({ ...formData, amount: e.target.value })} />
              <label className="flex gap-2 items-center text-sm"><input type="checkbox" onChange={e => setFormData({ ...formData, split: e.target.checked })} /> Split cost among all members (Generate Due Bills)</label>
            </>
          )}
          {modalState.type === 'rental' && (
            <>
              <input className="w-full p-2 border rounded" placeholder="Title (e.g. 2BHK Flat)" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <input type="number" className="w-full p-2 border rounded" placeholder="Rent/Price (₹)" onChange={e => setFormData({ ...formData, price: e.target.value })} />
              <textarea className="w-full p-2 border rounded" placeholder="Details" onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <select className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, type: e.target.value })}><option value="Rent">Flat for Rent</option><option value="Parking">Parking Slot</option></select>
            </>
          )}
          <button onClick={handleSubmitModal} className="w-full bg-emerald-600 text-white py-2 rounded">Submit</button>
        </div>
      </Modal>
      {/* Footer Modals */}
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
    </AppWrapper>
  );
}
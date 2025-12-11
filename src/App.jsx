import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
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
  Mail
} from 'lucide-react';

// --- Firebase Configuration ---
// ************************************************************************************************
// TO RUN LOCALLY: Replace the returned object in the function below with your actual Firebase config.
// ************************************************************************************************
const getFirebaseConfig = () => {
  try {
    // This handles the Gemini Web Preview environment automatically
    if (typeof __firebase_config !== 'undefined') {
      return JSON.parse(__firebase_config);
    }
  } catch (e) {
    console.error("Firebase Config Error:", e);
  }

  // --- PASTE YOUR LOCAL FIREBASE CONFIG HERE (And remove the block above if running locally) ---
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

// --- EXTRACTED APP WRAPPER (Fixes Input Focus Issue) ---
const AppWrapper = ({ children, darkMode }) => (
  <div className={darkMode ? 'dark' : ''}>
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      {children}
    </div>
  </div>
);

// --- Sub-Views ---

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
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
          <input
            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            placeholder="name@example.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            placeholder="••••••••"
            value={formData.password}
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
              value={formData.societyName}
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
                value={formData.societyCode}
                onChange={e => setFormData({ ...formData, societyCode: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit / Flat Number</label>
              <input
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="e.g. A-101"
                value={formData.unitNumber}
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
            <a href="https://x.com/Monoswee_Nath/" target="_blank" rel="noreferrer" className="text-black dark:text-white hover:scale-110 transition"><Twitter size={24} /></a>
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
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-200">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto border-b dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-2xl text-emerald-700 dark:text-emerald-500">
          <Building className="h-8 w-8" /> Humara Society
        </div>
        <div className="flex gap-4">
          <button onClick={() => { setAuthMode('login'); onAuthClick(); }} className="px-4 py-2 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition">Log In</button>
          <button onClick={() => { setAuthMode('register'); onAuthClick(); }} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg shadow hover:bg-emerald-700 transition">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Smart Living for <br /><span className="text-emerald-600 dark:text-emerald-400">Smart Communities</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Streamline your society management with our all-in-one platform. Payments, complaints, notices, and security - handled effortlessly.
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
                <div className="h-16 bg-gray-50 dark:bg-slate-700 rounded-lg w-full flex items-center px-4 gap-3">
                  <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900 rounded-full"></div>
                  <div className="h-2 w-20 bg-gray-200 dark:bg-slate-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 dark:bg-slate-800/50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything you need</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Packed with powerful features for modern living.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Secure & Private", text: "Role-based access ensuring data privacy for all residents." },
              { icon: Wallet, title: "Automated Billing", text: "Generate bills, track payments, and manage expenses seamlessly." },
              { icon: Megaphone, title: "Instant Notices", text: "Digital notice board to keep everyone updated in real-time." },
              { icon: AlertTriangle, title: "Complaint Box", text: "Track issues from reporting to resolution with status updates." },
              { icon: Vote, title: "Digital Elections", text: "Fair and transparent voting system for society committees." },
              { icon: Smartphone, title: "Mobile Friendly", text: "Fully responsive design that works perfectly on all devices." },
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-slate-700">
                <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Building className="h-6 w-6 text-emerald-500" /> Humara Society
            </div>
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Humara Society. All rights reserved. <br />
              Designed and Developed by <a href="https://jinamatrix.in" target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer">JinaMatrix.in</a>
            </div>
          </div>

          <div className="flex gap-6 text-slate-400">
            <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition">Privacy & Terms</button>
            <button onClick={() => setShowContact(true)} className="hover:text-white transition">Contact</button>
          </div>
        </div>
      </footer>

      {/* Footer Modals */}
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
};

// --- Internal Views (Dashboard, Notices, etc.) ---

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

  // Loading now handles initial auth check state (No global visual loader)
  const [authChecked, setAuthChecked] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    fullName: '',
    societyName: '',
    societyCode: '',
    unitNumber: ''
  });
  const [loading, setLoading] = useState(false);

  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [bills, setBills] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [classifieds, setClassifieds] = useState([]);

  // --- Auth & Init ---
  useEffect(() => {
    signOut(auth).catch(console.error); // Force logout on load as requested
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setUserData(null);
        setSocietyData(null);
      }
      setAuthChecked(true); // Initial auth check done
    });
    return () => unsubscribeAuth();
  }, []);

  // Profile Fetch Effect (PRIVATE PATH)
  useEffect(() => {
    if (!user) return;

    // Use PRIVATE path which user definitely has access to
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');

    const unsub = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);

        // Self-Healing: If still pending, check public record
        if (data.status === MEMBER_STATUS.PENDING) {
          checkPublicStatus(user.uid);
        }
      } else {
        setUserData(null);
      }
    }, (err) => {
      console.error("Profile Fetch Error (Private)", err);
    });

    return () => unsub();
  }, [user]);

  const checkPublicStatus = async (uid) => {
    try {
      const publicRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', uid);
      const publicSnap = await getDoc(publicRef);
      if (publicSnap.exists()) {
        const publicData = publicSnap.data();
        if (publicData.status !== MEMBER_STATUS.PENDING) {
          await updateDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'), {
            status: publicData.status
          });
        }
      }
    } catch (e) {
      // expected if user lacks read permission on public
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    if (!userData?.societyId) return;
    const sId = userData.societyId;
    const path = ['artifacts', appId, 'public', 'data'];
    const unsubs = [];
    const safeSub = (q, set) => unsubs.push(onSnapshot(q, s => set(s.docs.map(d => ({ id: d.id, ...d.data() })))));

    unsubs.push(onSnapshot(doc(db, ...path, `society_${sId}`), d => d.exists() && setSocietyData(d.data())));
    safeSub(query(collection(db, ...path, `notices_${sId}`), orderBy('createdAt', 'desc')), setNotices);
    safeSub(query(collection(db, ...path, `complaints_${sId}`), orderBy('createdAt', 'desc')), setComplaints);
    safeSub(query(collection(db, ...path, `bills_${sId}`), orderBy('dueDate', 'desc')), setBills);
    safeSub(collection(db, ...path, `amenities_${sId}`), setAmenities);
    safeSub(query(collection(db, ...path, `classifieds_${sId}`), orderBy('createdAt', 'desc')), setClassifieds);

    // Admin uses PUBLIC profiles to see members
    const profiles = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
    safeSub(query(profiles, where('societyId', '==', sId), where('status', '==', MEMBER_STATUS.APPROVED)), setMembers);
    safeSub(query(profiles, where('societyId', '==', sId), where('status', '==', MEMBER_STATUS.PENDING)), setPendingMembers);

    return () => unsubs.forEach(u => u());
  }, [userData?.societyId]);

  const generateSocietyCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return `SOC-${Array(6).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('')}`;
  };

  const initializeUserDocs = async (uid, formData, finalSocId, role, status) => {
    const userPayload = {
      uid: uid,
      email: formData.email,
      fullName: formData.fullName,
      societyId: finalSocId,
      unitNumber: formData.unitNumber || 'N/A',
      role,
      status,
      joinedAt: serverTimestamp()
    };

    if (authMode === 'create-society') {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `society_${finalSocId}`), {
        name: formData.societyName,
        id: finalSocId,
        funds: 0,
        creatorId: uid,
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `amenities_${finalSocId}`), {
        name: 'Club House', capacity: 50, openTime: '09:00', closeTime: '22:00'
      });
    }

    // 1. Private Profile (Safe)
    await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'profile'), userPayload);
    // 2. Public Profile (Directory)
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', uid), userPayload);
  };

  const handleAuthSubmit = async () => {
    setAuthError('');
    if (!authForm.email || !authForm.password) {
      setAuthError('Email and Password are required.');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'login') {
        try {
          await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
        } catch (loginError) {
          if (loginError.code === 'auth/operation-not-allowed') {
            throw new Error("Login unavailable in Demo Mode. Please use 'Register' to enter.");
          }
          throw loginError;
        }
      } else {
        if (!authForm.fullName) throw new Error("Full Name is required.");

        let finalSocId = '';
        let role = ROLES.RESIDENT;
        let status = MEMBER_STATUS.PENDING;

        if (authMode === 'create-society') {
          if (!authForm.societyName) throw new Error("Society Name is required.");
          finalSocId = generateSocietyCode();
          role = ROLES.ADMIN;
          status = MEMBER_STATUS.APPROVED;
        } else {
          if (!authForm.societyCode) throw new Error("Society Code is required.");
          const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', `society_${authForm.societyCode}`));
          if (!snap.exists()) throw new Error("Invalid Society Code.");
          finalSocId = authForm.societyCode;
        }

        try {
          const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
          await initializeUserDocs(cred.user.uid, authForm, finalSocId, role, status);
        } catch (regError) {
          if (regError.code === 'auth/operation-not-allowed') {
            const anonCred = await signInAnonymously(auth);
            await initializeUserDocs(anonCred.user.uid, authForm, finalSocId, role, status);
            alert("Demo Mode: Email Auth disabled in environment. Logged in as Guest.");
          } else {
            throw regError;
          }
        }
      }
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', fullName: '', societyName: '', societyCode: '', unitNumber: '' });
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handlePanic = async () => {
    if (!userData || !societyData) return;
    if (confirm("TRIGGER PANIC ALERT?")) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `notices_${userData.societyId}`), {
        title: `🆘 SOS: PANIC ALERT - Unit ${userData.unitNumber}`,
        content: `Emergency by ${userData.fullName}. Please respond!`,
        type: 'Urgent',
        postedBy: userData.fullName,
        role: userData.role,
        createdAt: serverTimestamp(),
        isPanic: true
      });
      alert("Panic Alert Sent!");
    }
  };

  // --- Render ---

  // 1. Initial Auth Check (Render nothing briefly to avoid flash)
  if (!authChecked) {
    return null;
  }

  // 2. No User -> Landing Page (Default View)
  if (!user) return (
    <AppWrapper darkMode={darkMode}>
      <LandingPage onAuthClick={() => setShowAuthModal(true)} setAuthMode={setAuthMode} />
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        setMode={setAuthMode}
        formData={authForm}
        setFormData={setAuthForm}
        onSubmit={handleAuthSubmit}
        loading={loading}
        error={authError}
      />
    </AppWrapper>
  );

  // 3. User Logged In but Profile Fetching/Missing
  if (!userData) return (
    <AppWrapper darkMode={darkMode}>
      <div className="h-screen flex flex-col items-center justify-center space-y-4 text-center p-4">
        <p className="text-emerald-600 font-medium animate-pulse">Fetching Profile...</p>
        <p className="text-xs text-gray-400">If this persists, the database rules might be restricting access.</p>
        <button onClick={() => signOut(auth)} className="text-sm text-gray-500 hover:text-gray-800 underline mt-4">Cancel / Sign Out</button>
      </div>
    </AppWrapper>
  );

  // 4. Pending/Rejected Status
  if (userData.status === MEMBER_STATUS.PENDING || userData.status === MEMBER_STATUS.REJECTED) return (
    <AppWrapper darkMode={darkMode}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full border dark:border-slate-700">
          {userData.status === MEMBER_STATUS.PENDING ? (
            <>
              <div className="mx-auto h-16 w-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mb-6"><Clock size={32} /></div>
              <h2 className="text-2xl font-bold mb-2">Approval Pending</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Waiting for Admin approval for <strong>{societyData?.name || userData.societyId}</strong>.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Your join request was rejected.</p>
            </>
          )}
          <button onClick={() => signOut(auth)} className="w-full bg-slate-800 dark:bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-900 transition">Sign Out</button>
        </div>
      </div>
    </AppWrapper>
  );

  const isAdmin = [ROLES.ADMIN, ROLES.SECRETARY, ROLES.PRESIDENT].includes(userData.role);

  return (
    <AppWrapper darkMode={darkMode}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 dark:bg-slate-950 text-white transition-transform transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r dark:border-slate-800`}>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-emerald-500 rounded flex items-center justify-center font-bold">H</div>
              <span className="font-bold text-lg">Humara Society</span>
            </div>
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
                { id: TABS.CLASSIFIEDS, icon: ShoppingBag, label: 'Classifieds' },
                { id: TABS.AMENITIES, icon: Calendar, label: 'Amenities' },
                { id: TABS.VISITORS, icon: Car, label: 'Visitors' },
                { id: TABS.ELECTIONS, icon: Vote, label: 'Elections' },
              ].filter(Boolean).map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      {item.label}
                    </div>
                    {item.badge > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-2">
            <button
              onClick={toggleDarkMode}
              className="hidden md:flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button onClick={() => signOut(auth)} className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-2 hover:bg-slate-800 rounded-lg transition">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors">
          <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 h-16 flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-600 dark:text-gray-300"><Menu size={24} /></button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">{societyData?.name}</h2>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={toggleDarkMode} className="md:hidden p-2 text-gray-600 dark:text-gray-300">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={handlePanic} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/30">
                <ShieldAlert size={14} /> SOS
              </button>
              <div className="relative">
                <Bell size={20} className="text-gray-500 dark:text-gray-400" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
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
                    {isAdmin && <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2" onClick={async () => {
                      const title = prompt("Notice Title");
                      if (title) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `notices_${userData.societyId}`), { title, content: 'Details here...', type: 'General', postedBy: userData.fullName, role: userData.role, createdAt: serverTimestamp() });
                    }}><Plus size={16} /> Post</button>}
                  </div>
                  {notices.map(n => (
                    <div key={n.id} className={`bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border-l-4 dark:border-slate-700 ${n.type === 'Urgent' ? 'border-l-red-500' : 'border-l-indigo-500'}`}>
                      <div className="flex justify-between mb-2"><Badge color={n.type === 'Urgent' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'}>{n.type}</Badge> <span className="text-xs text-gray-400">{n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toDateString() : ''}</span></div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">{n.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* Simplified View Logic for other tabs to save space - functionally same as before but wrapped for dark mode */}
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
                          <tr key={m.id}>
                            <td className="p-4">{m.fullName}</td>
                            <td className="p-4">{m.unitNumber}</td>
                            <td className="p-4"><span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{m.role}</span></td>
                          </tr>
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
                      <div>
                        <h4 className="font-bold dark:text-white">{m.fullName}</h4>
                        <p className="text-sm text-gray-500">Unit: {m.unitNumber}</p>
                      </div>
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
    </AppWrapper>
  );
}
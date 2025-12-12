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
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  deleteDoc
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
  Home,
  Check,
  Settings,
  DollarSign,
  UserPlus,
  Briefcase,
  IndianRupee,
  Repeat,
  PartyPopper,
  Trash2,
  Search as SearchIcon,
  MapPin,
  QrCode,
  Copy,
  Upload,
  Eye,
  XCircle
} from 'lucide-react';

// --- Firebase Configuration ---
const getFirebaseConfig = () => {
  // 1. Try reading from the global injected variable (for Canvas/Preview environments)
  try {
    if (typeof __firebase_config !== 'undefined') {
      return JSON.parse(__firebase_config);
    }
  } catch (e) {
    console.error("Firebase Config Error (Global):", e);
  }

  // 2. Try reading from import.meta.env (Required for Vite/Vercel)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const env = import.meta.env;
      if (env.VITE_FIREBASE_API_KEY) {
        return {
          apiKey: env.VITE_FIREBASE_API_KEY,
          authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: env.VITE_FIREBASE_APP_ID
        };
      }
    }
  } catch (e) {
    // console.warn("Vite config access failed:", e);
  }

  // 3. Fallback / Placeholder
  console.warn("No Firebase config found. Falling back to placeholders.");
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
  STAFF: 'Staff',
  SECURITY: 'Security'
};

const TABS = {
  DASHBOARD: 'dashboard',
  NOTICES: 'notices',
  EVENTS: 'events',
  COMPLAINTS: 'complaints',
  FINANCE: 'finance',
  DIRECTORY: 'directory',
  APPROVALS: 'approvals',
  AMENITIES: 'amenities',
  ELECTIONS: 'elections',
  CLASSIFIEDS: 'classifieds',
  VISITORS: 'visitors',
  RENTALS: 'rentals',
  SETTINGS: 'settings'
};

const STATUS = { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
const MEMBER_STATUS = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' };

const AMENITY_TYPES = ["Swimming Pool", "Gym", "Club House", "Tennis Court", "Parking Lot", "Garden", "Other"];

const VISITOR_TYPES = [
  "Guest",
  "Food Delivery",
  "Product Delivery",
  "Large Appliance Delivery",
  "Grocery Delivery",
  "Courier Delivery",
  "Mechanic",
  "Cab/Taxi",
  "Service/Repair",
  "Maid",
  "Driver",
  "Household Help",
  "Others"
];

// Mock Location Data
const LOCATION_DATA = {
  "India": {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
    "Karnataka": ["Bangalore", "Mysore", "Mangalore"],
    "West Bengal": ["Kolkata", "Howrah", "Darjeeling"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida"]
  },
  "USA": {
    "California": ["Los Angeles", "San Francisco", "San Diego"],
    "New York": ["New York City", "Buffalo", "Rochester"],
    "Texas": ["Houston", "Austin", "Dallas"]
  }
};

const SOCIETY_TYPES = ["Apartment Complex", "Gated Community", "Housing Society", "Co-operative Housing Society"];

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
        <div className="p-4 overflow-y-auto space-y-4">
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

// --- EXTRACTED APP WRAPPER (Handles Dark Mode Globally) ---
const AppWrapper = ({ children, darkMode }) => {
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      {children}
    </div>
  );
};

// --- Sub-Views & Modals ---

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

const AuthModal = ({
  show,
  onClose,
  mode,
  setMode,
  formData,
  setFormData,
  onSubmit,
  loading,
  error,
  onCheckSocietyCode,
  onSearchSociety,
  availableUnits,
  foundSocietyName
}) => {
  if (!show) return null;

  // Derive countries/states from mocked data
  const countries = Object.keys(LOCATION_DATA);
  const states = formData.country ? Object.keys(LOCATION_DATA[formData.country] || {}) : [];
  const cities = formData.state ? (LOCATION_DATA[formData.country]?.[formData.state] || []) : [];

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
          <>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg text-xs text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800/50">
              Unique ID generated automatically. No duplicates allowed in same pincode.
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Society Name</label>
              <input
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="e.g. Green Valley Apartments"
                value={formData.societyName || ''}
                onChange={e => setFormData({ ...formData, societyName: e.target.value })}
              />
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                <select
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  onChange={e => setFormData({ ...formData, country: e.target.value, state: '', city: '' })}
                >
                  <option value="">Select</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                <select
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  onChange={e => setFormData({ ...formData, state: e.target.value, city: '' })}
                  disabled={!formData.country}
                >
                  <option value="">Select</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City/District</label>
                {cities.length > 0 ? (
                  <select
                    className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  >
                    <option value="">Select</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input
                    className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Enter City"
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
                <input
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="123456"
                  onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Society Type</label>
              <select
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                onChange={e => setFormData({ ...formData, societyType: e.target.value })}
              >
                <option value="">Select Type</option>
                {SOCIETY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </>
        )}

        {mode === 'register' && (
          <>
            <div className="space-y-2 pt-2 border-t dark:border-slate-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Find Your Society</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Search by Name/Pincode"
                  value={formData.searchQuery || ''}
                  onChange={e => setFormData({ ...formData, searchQuery: e.target.value })}
                />
                <button onClick={() => onSearchSociety(formData.searchQuery)} className="bg-gray-200 dark:bg-slate-600 p-2.5 rounded-lg hover:bg-gray-300"><SearchIcon size={20} /></button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Society Code (Unique ID)</label>
              <input
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono uppercase bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="SOC-XXXXXX"
                value={formData.societyCode || ''}
                onChange={e => {
                  const val = e.target.value.toUpperCase();
                  setFormData({ ...formData, societyCode: val });
                }}
                onBlur={() => onCheckSocietyCode(formData.societyCode)}
              />
              {foundSocietyName && <p className="text-sm text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={14} /> {foundSocietyName}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit / Flat Number</label>
              {availableUnits && availableUnits.length > 0 ? (
                <select
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  value={formData.unitNumber || ''}
                  onChange={e => setFormData({ ...formData, unitNumber: e.target.value })}
                >
                  <option value="">Select Unit</option>
                  {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              ) : (
                <input
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder={formData.societyCode ? "No units found / Admin hasn't added units" : "Enter Society Code first"}
                  value={formData.unitNumber || ''}
                  onChange={e => setFormData({ ...formData, unitNumber: e.target.value })}
                  disabled={!formData.societyCode}
                />
              )}
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
          {societyData?.address && (
            <p className="text-xs mt-1 opacity-75 flex items-center gap-1"><MapPin size={12} /> {societyData.address.city}, {societyData.address.state} - {societyData.address.pincode}</p>
          )}
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotices, setHasUnreadNotices] = useState(false);
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
  const [registerUnits, setRegisterUnits] = useState([]);
  const [foundSocietyName, setFoundSocietyName] = useState('');
  const [pendingVerifications, setPendingVerifications] = useState([]);

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
  const [elections, setElections] = useState([]);
  const [classifieds, setClassifieds] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [events, setEvents] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);

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

    // Notices with unread handling
    unsubs.push(onSnapshot(query(collection(db, ...path, `notices_${sId}`), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotices(data);
      // If notifications list changes and we aren't viewing them, show dot
      if (!showNotifications && data.length > 0) {
        setHasUnreadNotices(true);
      }
    }));

    safeSub(query(collection(db, ...path, `events_${sId}`), orderBy('date', 'asc')), setEvents);
    safeSub(query(collection(db, ...path, `complaints_${sId}`), orderBy('createdAt', 'desc')), setComplaints);
    safeSub(query(collection(db, ...path, `bills_${sId}`), orderBy('dueDate', 'desc')), (snapshot) => {
      const allBills = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBills(allBills);
      // Filter pending verifications for admin
      if ([ROLES.ADMIN, ROLES.TREASURER].includes(userData.role)) {
        setPendingVerifications(allBills.filter(b => b.status === 'Pending Verification'));
      }
    });
    safeSub(collection(db, ...path, `amenities_${sId}`), setAmenities);
    safeSub(query(collection(db, ...path, `rentals_${sId}`), orderBy('createdAt', 'desc')), setRentals);
    safeSub(query(collection(db, ...path, `elections_${sId}`), orderBy('createdAt', 'desc')), setElections);
    safeSub(query(collection(db, ...path, `classifieds_${sId}`), orderBy('createdAt', 'desc')), setClassifieds);
    safeSub(query(collection(db, ...path, `visitors_${sId}`), orderBy('createdAt', 'desc')), setVisitors);
    safeSub(collection(db, ...path, `recurring_${sId}`), setRecurringExpenses);

    const profiles = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
    safeSub(query(profiles, where('societyId', '==', sId), where('status', '==', MEMBER_STATUS.APPROVED)), setMembers);
    safeSub(query(profiles, where('societyId', '==', sId), where('status', '==', MEMBER_STATUS.PENDING)), setPendingMembers);

    return () => unsubs.forEach(u => u());
  }, [userData?.societyId]);

  // --- Handlers ---
  const generateSocietyCode = () => `SOC-${Array(6).fill(0).map(() => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32))).join('')}`;

  const fetchUnitsForSociety = async (code) => {
    if (!code) return;
    try {
      const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'societies', code));
      if (snap.exists()) {
        setFoundSocietyName(snap.data().name);
        if (snap.data().units) {
          setRegisterUnits(snap.data().units.sort());
        } else {
          setRegisterUnits([]);
        }
      } else {
        setFoundSocietyName('');
        setRegisterUnits([]);
      }
    } catch (e) {
      console.error("Error fetching units:", e);
      setRegisterUnits([]);
    }
  };

  const handleSearchSociety = async (term) => {
    if (!term) return;
    try {
      // Simple search by query for name
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'societies'), where('name', '==', term));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setAuthForm(prev => ({ ...prev, societyCode: data.id }));
        setFoundSocietyName(data.name);
        alert(`Found: ${data.name}. Code: ${data.id}`);
        fetchUnitsForSociety(data.id);
      } else {
        // Try pincode search if needed, but 'name' is primary requested
        alert("No society found with that exact name.");
      }
    } catch (e) {
      console.error("Search failed", e);
    }
  };

  const initializeUserDocs = async (uid, formData, finalSocId, role, status) => {
    const userPayload = { uid, email: formData.email || user.email, fullName: formData.fullName, societyId: finalSocId, unitNumber: formData.unitNumber || 'N/A', role, status, joinedAt: serverTimestamp(), advanceBalance: 0 };
    if (authMode === 'create-society') {
      const address = {
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        type: formData.societyType
      };
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'societies', finalSocId), { name: formData.societyName, id: finalSocId, address: address, funds: 0, maintenanceAmount: 0, lateFee: 0, creatorId: uid, createdAt: serverTimestamp(), units: [] });
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
          if (!authForm.societyName || !authForm.pincode) throw new Error("Society Name and Pincode required.");

          // DUPLICATE CHECK
          const dupQuery = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'societies'),
            where('address.pincode', '==', authForm.pincode),
            where('name', '==', authForm.societyName)
          );
          const dupSnap = await getDocs(dupQuery);
          if (!dupSnap.empty) {
            throw new Error("A society with this name already exists in this Pincode.");
          }

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

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasUnreadNotices(false);
    }
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

  // New Handlers for Directory
  const handleApproveMember = async (targetUid) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', targetUid), { status: MEMBER_STATUS.APPROVED });
      await updateDoc(doc(db, 'artifacts', appId, 'users', targetUid, 'settings', 'profile'), { status: MEMBER_STATUS.APPROVED });
      alert("Member Approved!");
    } catch (e) { alert(e.message); }
  };

  const handleRejectMember = async (targetUid) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', targetUid), { status: MEMBER_STATUS.REJECTED });
      await updateDoc(doc(db, 'artifacts', appId, 'users', targetUid, 'settings', 'profile'), { status: MEMBER_STATUS.REJECTED });
      alert("Member Rejected.");
    } catch (e) { alert(e.message); }
  };

  const handleVote = async (electionId, candidateId) => {
    const sId = userData.societyId;
    const electionRef = doc(db, 'artifacts', appId, 'public', 'data', `elections_${sId}`, electionId);

    // Check if user already voted
    const electionDoc = await getDoc(electionRef);
    if (electionDoc.data().voters.includes(user.uid)) {
      alert("You have already voted!");
      return;
    }

    const updatedCandidates = electionDoc.data().candidates.map(c => {
      if (c.id === candidateId) {
        return { ...c, votes: (c.votes || 0) + 1 };
      }
      return c;
    });

    await updateDoc(electionRef, {
      candidates: updatedCandidates,
      voters: arrayUnion(user.uid)
    });
    alert("Vote Casted Successfully!");
  };

  const handleVisitorEntry = async (visitorId, isExit = false) => {
    const sId = userData.societyId;
    const updateData = isExit ? { exitTime: serverTimestamp(), status: 'Exited' } : { entryTime: serverTimestamp(), status: 'Entered' };
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `visitors_${sId}`, visitorId), updateData);
  };

  const handleSubmitModal = async () => {
    const sId = userData.societyId;
    const path = ['artifacts', appId, 'public', 'data'];
    try {
      if (modalState.type === 'notice') {
        await addDoc(collection(db, ...path, `notices_${sId}`), { ...formData, postedBy: userData.fullName, role: userData.role, createdAt: serverTimestamp(), type: formData.type || 'General' });
      } else if (modalState.type === 'event') {
        await addDoc(collection(db, ...path, `events_${sId}`), { ...formData, createdBy: userData.fullName, createdAt: serverTimestamp() });
      } else if (modalState.type === 'complaint') {
        await addDoc(collection(db, ...path, `complaints_${sId}`), { ...formData, userId: user.uid, userName: userData.fullName, unitNumber: userData.unitNumber, status: STATUS.OPEN, createdAt: serverTimestamp() });
      } else if (modalState.type === 'maintenance') {
        const batchPromises = members.map(m => addDoc(collection(db, ...path, `bills_${sId}`), { title: formData.title, amount: parseFloat(formData.amount), dueDate: formData.dueDate, status: 'Unpaid', userId: m.uid, unitNumber: m.unitNumber, userName: m.fullName, type: 'Maintenance' }));
        await Promise.all(batchPromises);
        alert(`Bills generated for ${members.length} members.`);
      } else if (modalState.type === 'set_maintenance') {
        await updateDoc(doc(db, ...path, 'societies', sId), {
          maintenanceAmount: parseFloat(formData.amount),
          lateFee: parseFloat(formData.lateFee)
        });
        alert("Maintenance settings updated!");
      } else if (modalState.type === 'add_unit') {
        const unitsToAdd = formData.units.split(',').map(u => u.trim()).filter(u => u);
        await updateDoc(doc(db, ...path, 'societies', sId), { units: arrayUnion(...unitsToAdd) });
        alert(`Added ${unitsToAdd.length} units.`);
      } else if (modalState.type === 'payment_settings') {
        await updateDoc(doc(db, ...path, 'societies', sId), {
          bankDetails: {
            accountName: formData.accountName,
            accountNumber: formData.accountNumber,
            ifsc: formData.ifsc,
            bankName: formData.bankName
          },
          upiDetails: {
            upiId: formData.upiId,
            qrCodeUrl: 'placeholder_qr_code_url' // In a real app, this would be an uploaded image URL
          }
        });
        alert("Payment settings updated!");
      } else if (modalState.type === 'expense') {
        await addDoc(collection(db, ...path, `expenses_${sId}`), { ...formData, createdBy: userData.fullName, createdAt: serverTimestamp() });

        if (formData.deductFromSociety) {
          await updateDoc(doc(db, ...path, 'societies', sId), { funds: increment(-parseFloat(formData.amount)) });
        } else if (formData.splitType === 'split_specific') {
          const units = formData.splitUnits.split(',').map(u => u.trim());
          const targetMembers = members.filter(m => units.includes(m.unitNumber));
          if (targetMembers.length > 0) {
            const perPerson = parseFloat(formData.amount) / targetMembers.length;
            const batchPromises = targetMembers.map(m => addDoc(collection(db, ...path, `bills_${sId}`), { title: `Split: ${formData.title}`, amount: perPerson.toFixed(2), dueDate: new Date().toISOString().split('T')[0], status: 'Unpaid', userId: m.uid, unitNumber: m.unitNumber, userName: m.fullName, type: 'Shared Expense' }));
            await Promise.all(batchPromises);
            alert(`Split bills generated for ${targetMembers.length} members.`);
          } else {
            alert("No members found with those unit numbers.");
          }
        } else if (formData.splitType === 'split_all') {
          const perPerson = parseFloat(formData.amount) / members.length;
          const batchPromises = members.map(m => addDoc(collection(db, ...path, `bills_${sId}`), { title: `Split: ${formData.title}`, amount: perPerson.toFixed(2), dueDate: new Date().toISOString().split('T')[0], status: 'Unpaid', userId: m.uid, unitNumber: m.unitNumber, userName: m.fullName, type: 'Shared Expense' }));
          await Promise.all(batchPromises);
        }
      } else if (modalState.type === 'recurring_expense') {
        await addDoc(collection(db, ...path, `recurring_${sId}`), formData);
        alert("Recurring expense added!");
      } else if (modalState.type === 'rental') {
        await addDoc(collection(db, ...path, `rentals_${sId}`), { ...formData, ownerId: user.uid, ownerName: userData.fullName, contact: userData.email, createdAt: serverTimestamp() });
      } else if (modalState.type === 'election') {
        const candidates = formData.candidatesString.split(',').map((name, idx) => ({ id: idx, name: name.trim(), votes: 0 }));
        await addDoc(collection(db, ...path, `elections_${sId}`), {
          title: formData.title,
          position: formData.position,
          candidates: candidates,
          voters: [],
          status: 'Open',
          createdAt: serverTimestamp()
        });
      } else if (modalState.type === 'amenity') {
        const finalFormData = { ...formData };
        if (finalFormData.name === 'Other') finalFormData.name = finalFormData.customName;
        await addDoc(collection(db, ...path, `amenities_${sId}`), finalFormData);
      } else if (modalState.type === 'add_funds') {
        const amount = parseFloat(formData.amount);
        await updateDoc(doc(db, ...path, 'societies', sId), { funds: increment(amount) });
        alert(`Added ₹${amount} via ${formData.fundType || 'Cash in Hand'}`);
      } else if (modalState.type === 'classified') {
        await addDoc(collection(db, ...path, `classifieds_${sId}`), { ...formData, ownerId: user.uid, ownerName: userData.fullName, contact: userData.email, createdAt: serverTimestamp() });
      } else if (modalState.type === 'visitor_preapprove' || modalState.type === 'visitor_entry') {
        const finalType = formData.type === 'Others' ? formData.customType : formData.type;
        const visitorData = {
          ...formData,
          type: finalType,
          status: modalState.type === 'visitor_entry' ? 'Entered' : 'Expected',
          entryTime: modalState.type === 'visitor_entry' ? serverTimestamp() : null,
          hostId: modalState.type === 'visitor_preapprove' ? user.uid : formData.hostId, // Security selects host
          hostUnit: modalState.type === 'visitor_preapprove' ? userData.unitNumber : formData.hostUnit,
          createdBy: userData.fullName,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, ...path, `visitors_${sId}`), visitorData);
      } else if (modalState.type === 'pay_bill_online') {
        // This handles user marking a bill as paid via Bank/UPI
        const { billIds, method, proof } = formData;
        const batchPromises = billIds.map(bid => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `bills_${sId}`, bid), {
          status: 'Pending Verification',
          paymentMode: method,
          paymentProof: proof || 'No proof attached', // Placeholder
          paymentDate: serverTimestamp()
        }));
        await Promise.all(batchPromises);
        alert("Payment details submitted for verification.");
      } else if (modalState.type === 'record_offline_payment') {
        // Cashier manually recording a payment
        const { billIds, amountPaid } = formData;
        // For simplicity, assuming full payment for selected bills or distributing amount
        // Here we just mark selected as Paid for demo
        const batchPromises = billIds.map(bid => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `bills_${sId}`, bid), {
          status: 'Paid',
          paymentMode: 'Cash',
          paymentDate: serverTimestamp(),
          paidAmount: 'Full' // Simplified
        }));
        // Add to society funds
        // Calculate total from bill objects if available in state, or trust input
        // Simplified: We need bill amounts. In real app, fetch bills or pass amounts.
        // Assuming full payment of passed bills for now.
        await Promise.all(batchPromises);
        alert("Payment recorded successfully.");
      } else if (modalState.type === 'add_advance') {
        const amount = parseFloat(formData.amount);
        // Create a 'Bill' type transaction for record keeping but positive
        // Or just update user profile. 
        // For audit, better to create a 'receipt' collection, but here updating profile directly + fake bill entry for history
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), {
          advanceBalance: increment(amount)
        });
        // Optional: Add a 'Credit' entry to bills for history
        await addDoc(collection(db, ...path, `bills_${sId}`), {
          title: 'Advance Payment',
          amount: amount,
          status: 'Paid',
          paymentMode: formData.method,
          userId: user.uid,
          unitNumber: userData.unitNumber,
          type: 'Credit',
          createdAt: serverTimestamp()
        });
        alert("Advance balance added!");
      }
      closeModal();
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleDeleteUnit = async (unitName) => {
    if (confirm(`Delete unit ${unitName}? Users already registered with this unit won't be deleted.`)) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'societies', userData.societyId), { units: arrayRemove(unitName) });
    }
  };

  const handlePayBill = async (bill) => {
    // Legacy single bill pay - redirect to new flow
    setModalState({ type: 'pay_bill_select', isOpen: true });
    setFormData({ selectedBills: [bill] }); // Pre-select
  };

  const handleVerifyPayment = async (bill, action) => {
    const sId = userData.societyId;
    if (action === 'approve') {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `bills_${sId}`, bill.id), { status: 'Paid' });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'societies', sId), { funds: increment(parseFloat(bill.amount)) });
      alert("Payment Approved.");
    } else {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `bills_${sId}`, bill.id), { status: 'Unpaid', statusMsg: 'Payment Rejected by Admin' });
      alert("Payment Rejected.");
    }
  };

  const calculateLateFees = async () => {
    const today = new Date().toISOString().split('T')[0];
    const fee = societyData.lateFee || 0;
    if (fee === 0) return alert("No late fee set.");

    const overdue = bills.filter(b => b.status === 'Unpaid' && b.dueDate < today && !b.lateFeeApplied);
    if (overdue.length === 0) return alert("No overdue bills found.");

    const promises = overdue.map(b => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `bills_${userData.societyId}`, b.id), { amount: parseFloat(b.amount) + fee, lateFeeApplied: true, title: `${b.title} (Late Fee Added)` }));
    await Promise.all(promises);
    alert(`Late fees applied to ${overdue.length} bills.`);
  };

  const handleSOS = () => {
    if (confirm("Send EMERGENCY SOS alert to all admins and security?")) {
      alert("SOS Alert Sent! Help is on the way.");
    }
  };

  // --- Render ---
  if (!authChecked) return null;
  if (!user) return <AppWrapper darkMode={darkMode}><LandingPage onAuthClick={() => setShowAuthModal(true)} setAuthMode={setAuthMode} /><AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} mode={authMode} setMode={setAuthMode} formData={authForm} setFormData={setAuthForm} onSubmit={handleAuthSubmit} loading={loading} error={authError} onCheckSocietyCode={fetchUnitsForSociety} onSearchSociety={handleSearchSociety} availableUnits={registerUnits} foundSocietyName={foundSocietyName} /></AppWrapper>;

  if (!userData) return <AppWrapper darkMode={darkMode}><div className="flex justify-center items-center h-screen">Loading Profile...</div></AppWrapper>;

  if (userData.status !== MEMBER_STATUS.APPROVED) return <AppWrapper darkMode={darkMode}><div className="flex justify-center items-center h-screen">Status: {userData.status} <button onClick={() => signOut(auth)} className="ml-4 underline">Sign Out</button></div></AppWrapper>;

  const isAdmin = [ROLES.ADMIN, ROLES.TREASURER].includes(userData.role);
  const isSecurity = [ROLES.SECURITY, ROLES.STAFF].includes(userData.role);

  return (
    <AppWrapper darkMode={darkMode}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 dark:bg-slate-950 text-white transition-transform transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r dark:border-slate-800`}>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="h-8 w-8 bg-emerald-500 rounded flex items-center justify-center font-bold">H</div><span className="font-bold text-lg">Humara Society</span></div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400"><X size={20} /></button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {[
                { id: TABS.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
                { id: TABS.FINANCE, icon: Wallet, label: 'Finances' },
                { id: TABS.NOTICES, icon: Megaphone, label: 'Notices' },
                { id: TABS.EVENTS, icon: PartyPopper, label: 'Events' },
                { id: TABS.COMPLAINTS, icon: AlertTriangle, label: 'Complaints' },
                { id: TABS.DIRECTORY, icon: Users, label: 'Directory' },
                { id: TABS.APPROVALS, icon: UserPlus, label: 'Approvals', role: [ROLES.ADMIN] },
                { id: TABS.VISITORS, icon: UserCheck, label: 'Visitors' },
                { id: TABS.CLASSIFIEDS, icon: ShoppingBag, label: 'Classifieds' },
                { id: TABS.RENTALS, icon: Home, label: 'Rentals' },
                { id: TABS.AMENITIES, icon: Calendar, label: 'Amenities' },
                { id: TABS.ELECTIONS, icon: Vote, label: 'Elections' },
                { id: TABS.SETTINGS, icon: Settings, label: 'Settings', role: [ROLES.ADMIN] },
              ].filter(item => !item.role || item.role.includes(userData.role)).map((item) => (
                <li key={item.id}>
                  <button onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <div className="flex items-center gap-3"><item.icon size={18} />{item.label}</div>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button onClick={() => setDarkMode(!darkMode)} className="hidden md:flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />} {darkMode ? 'Light' : 'Dark'}
            </button>
            <button onClick={() => signOut(auth)} className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-2 hover:bg-slate-800 rounded-lg transition"><LogOut size={18} /> Sign Out</button>
          </div>
        </aside>

        <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors relative">
          {/* Header */}
          <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 h-16 flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-600 dark:text-gray-300"><Menu size={24} /></button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">{societyData?.name}</h2>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="md:hidden p-2 text-gray-600 dark:text-gray-300">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>

              {/* Highlighted SOS Button */}
              <button onClick={handleSOS} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/30 transition-all transform hover:scale-105">
                <ShieldAlert size={20} /> SOS
              </button>

              <div className="relative">
                <button onClick={handleNotificationClick} className="text-gray-500 dark:text-gray-400 relative p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition">
                  <Bell size={20} />
                  {hasUnreadNotices && <span className="absolute top-1 right-2 h-2 w-2 bg-red-500 rounded-full"></span>}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 shadow-xl rounded-xl p-4 border dark:border-slate-700 z-50 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold dark:text-white">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)}><X size={16} className="text-gray-500 hover:text-gray-700" /></button>
                    </div>
                    {notices.length === 0 ? <p className="text-sm text-gray-500">No new notices.</p> : (
                      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {notices.map(n => (
                          <div key={n.id} className="text-sm border-b dark:border-slate-700 pb-2 last:border-0">
                            <p className="font-semibold dark:text-white">{n.title}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{n.content.substring(0, 60)}...</p>
                            <span className="text-[10px] text-gray-400 block mt-1">{new Date(n.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === TABS.DASHBOARD && <DashboardView userData={userData} societyData={societyData} bills={bills} complaints={complaints} setActiveTab={setActiveTab} />}

            {/* FINANCE TAB */}
            {activeTab === TABS.FINANCE && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
                    <p className="text-gray-500 text-sm">Society Funds</p>
                    <h2 className="text-3xl font-bold text-emerald-600">₹{societyData?.funds || 0}</h2>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
                    <p className="text-gray-500 text-sm">Your Advance/Points</p>
                    <h2 className="text-3xl font-bold text-blue-600">₹{userData.advanceBalance || 0}</h2>
                  </div>
                </div>

                {isAdmin && (
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
                    <h3 className="font-bold text-lg dark:text-white mb-3">Admin Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => openModal('add_funds')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2 hover:bg-emerald-700 transition"><IndianRupee size={16} /> Add Funds</button>
                      <button onClick={() => openModal('expense')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2 hover:bg-red-700 transition"><CreditCard size={16} /> Record Expense</button>
                      <button onClick={() => openModal('generate_monthly')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2 hover:bg-blue-700 transition"><FileText size={16} /> Generate Monthly Bill</button>
                      <button onClick={() => openModal('set_maintenance')} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2 hover:bg-gray-700 transition"><Settings size={16} /> Settings</button>
                      <button onClick={() => openModal('payment_settings')} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm flex gap-2 hover:bg-gray-900 transition"><Settings size={16} /> Pay Settings</button>
                      <button onClick={calculateLateFees} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2 hover:bg-orange-700 transition"><Clock size={16} /> Apply Late Fees</button>
                    </div>
                  </div>
                )}

                {/* Defaulters List (Visible to all) */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
                  <div className="p-4 border-b dark:border-slate-700 font-bold dark:text-white flex justify-between items-center">
                    <span>Defaulters List</span>
                    <span className="text-xs text-red-500 font-normal">* Unpaid dues past due date</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-4 space-y-2">
                    {bills.filter(b => b.status === 'Unpaid' && b.dueDate < new Date().toISOString().split('T')[0]).map(def => (
                      <div key={def.id} className="flex justify-between items-center text-sm border-b dark:border-slate-700 pb-2">
                        <span className="dark:text-white font-medium">{def.userName} ({def.unitNumber})</span>
                        <span className="text-red-500 font-bold">₹{def.amount}</span>
                      </div>
                    ))}
                    {bills.filter(b => b.status === 'Unpaid' && b.dueDate < new Date().toISOString().split('T')[0]).length === 0 && (
                      <p className="text-gray-500 text-sm text-center">No defaulters currently.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bills Section */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b dark:border-slate-700 font-bold dark:text-white flex justify-between">
                      <span>Your Dues / Transactions</span>
                      <button onClick={() => { setModalState({ type: 'pay_bill_select', isOpen: true }); setFormData({ selectedBills: [] }); }} className="bg-emerald-600 text-white text-xs px-3 py-1 rounded">Pay Now</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {bills.filter(b => isAdmin || b.userId === user.uid).map(bill => (
                        <div key={bill.id} className="p-4 border-b dark:border-slate-700 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                          <div>
                            <h4 className="font-bold dark:text-white">{bill.title}</h4>
                            <p className="text-sm text-gray-500">Unit: {bill.unitNumber} • {bill.userName}</p>
                            <p className="text-xs text-red-500">Due: {bill.dueDate} {bill.lateFeeApplied && "(Late Fee)"}</p>
                            {bill.status === 'Pending Verification' && <p className="text-xs text-yellow-600">Method: {bill.paymentMode}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-bold dark:text-white">₹{bill.amount}</p>
                            <Badge color={bill.status === 'Paid' ? 'bg-green-100 text-green-800' : bill.status === 'Pending Verification' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                              {bill.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Verifications (Admin Only) */}
                  {isAdmin && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
                      <div className="p-4 border-b dark:border-slate-700 font-bold dark:text-white">Pending Payment Verifications</div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {pendingVerifications.length === 0 ? <p className="p-4 text-sm text-gray-500">No payments pending verification.</p> : pendingVerifications.map(bill => (
                          <div key={bill.id} className="p-4 border-b dark:border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-sm dark:text-white">{bill.userName} ({bill.unitNumber})</span>
                              <span className="text-emerald-600 font-bold">₹{bill.amount}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              <p>Via: {bill.paymentMode}</p>
                              <p>Date: {bill.paymentDate ? new Date(bill.paymentDate.seconds * 1000).toLocaleString() : 'N/A'}</p>
                              {bill.paymentProof && bill.paymentProof !== 'No proof attached' && (
                                <a href="#" className="text-blue-500 underline flex items-center gap-1"><Eye size={10} /> View Proof (Mock)</a>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleVerifyPayment(bill, 'approve')} className="flex-1 bg-green-600 text-white py-1 rounded text-xs">Receive / Approve</button>
                              <button onClick={() => handleVerifyPayment(bill, 'reject')} className="flex-1 bg-red-600 text-white py-1 rounded text-xs">Reject</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === TABS.EVENTS && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold dark:text-white">Community Events</h2>
                  {isAdmin && <button className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700" onClick={() => openModal('event')}>Add Event</button>}
                </div>
                {events.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                    <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No upcoming events.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(ev => (
                      <div key={ev.id} className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="bg-emerald-600 h-2"></div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg dark:text-white">{ev.title}</h3>
                            <span className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">{new Date(ev.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{ev.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Building size={14} /> {ev.location || 'Community Hall'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTICES TAB */}
            {activeTab === TABS.NOTICES && (
              <div className="space-y-4">
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold dark:text-white">Notices</h2>{isAdmin && <button className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700" onClick={() => openModal('notice')}>Post</button>}</div>
                {notices.map(n => <div key={n.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm"><h3 className="font-bold dark:text-white">{n.title}</h3><p className="text-gray-600 dark:text-gray-300 mt-2">{n.content}</p><span className="text-xs text-gray-400 mt-3 block flex items-center gap-1"><UserCheck size={12} /> {n.postedBy} • {n.type}</span></div>)}
              </div>
            )}

            {/* COMPLAINTS TAB */}
            {activeTab === TABS.COMPLAINTS && (
              <div className="space-y-4">
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold dark:text-white">Complaints</h2><button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" onClick={() => openModal('complaint')}>Report Issue</button></div>
                {complaints.map(c => (
                  <div key={c.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 flex justify-between shadow-sm">
                    <div><h3 className="font-bold dark:text-white">{c.title}</h3><p className="text-gray-600 dark:text-gray-300 mt-1">{c.description}</p></div>
                    <Badge color={c.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>{c.status}</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* APPROVALS TAB */}
            {activeTab === TABS.APPROVALS && isAdmin && (
              <div className="space-y-6">
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold dark:text-white">Pending Approvals</h2></div>
                {pendingMembers.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">No pending approvals.</div>
                ) : (
                  pendingMembers.map(m => (
                    <div key={m.uid} className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm gap-4 border dark:border-slate-700">
                      <div className="dark:text-white">
                        <p className="font-bold text-lg">{m.fullName}</p>
                        <p className="text-sm text-gray-500">Unit: {m.unitNumber} • {m.email}</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleApproveMember(m.uid)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"><Check size={16} /> Approve</button>
                        <button onClick={() => handleRejectMember(m.uid)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"><X size={16} /> Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VISITORS TAB */}
            {activeTab === TABS.VISITORS && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold dark:text-white">Visitors</h2>
                  {/* Security adds random visitor, Resident pre-approves */}
                  <button className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition" onClick={() => openModal(isSecurity ? 'visitor_entry' : 'visitor_preapprove')}>
                    {isSecurity ? '+ Add Entry' : '+ Pre-approve Visitor'}
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
                  {visitors.length === 0 ? <p className="p-6 text-center text-gray-500">No visitor logs.</p> : (
                    visitors.map(v => (
                      <div key={v.id} className="p-4 border-b dark:border-slate-700 last:border-0 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <div>
                          <h4 className="font-bold dark:text-white flex items-center gap-2">{v.name} <Badge color="bg-blue-100 text-blue-800">{v.type}</Badge></h4>
                          <p className="text-sm text-gray-500">Host: {v.hostUnit} ({v.hostId ? 'Resident' : 'Walk-in'})</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {v.isDaily ? <span className="text-purple-600 font-bold mr-2">Daily Staff</span> : null}
                            {v.status === 'Entered' ? `Entry: ${v.entryTime ? new Date(v.entryTime.seconds * 1000).toLocaleString() : 'Just now'}` :
                              v.expectedDate ? `Expected: ${new Date(v.expectedDate).toLocaleString()}` : 'Expected Soon'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${v.status === 'Entered' ? 'bg-green-100 text-green-700' : v.status === 'Exited' ? 'bg-gray-200 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>{v.status}</span>
                          {isSecurity && v.status === 'Entered' && (
                            <button onClick={() => handleVisitorEntry(v.id, true)} className="ml-3 text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Exit</button>
                          )}
                          {isSecurity && v.status === 'Expected' && (
                            <button onClick={() => handleVisitorEntry(v.id, false)} className="ml-3 text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200">Enter</button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* CLASSIFIEDS TAB */}
            {activeTab === TABS.CLASSIFIEDS && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold dark:text-white">Classifieds</h2>
                  <button className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition" onClick={() => openModal('classified')}>+ Sell/Ad</button>
                </div>
                {classifieds.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                    <ShoppingBag size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No listings available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classifieds.map(item => (
                      <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold dark:text-white text-lg">{item.title}</h3>
                          <Badge color={item.type === 'Sell' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>{item.type}</Badge>
                        </div>
                        <p className="text-xl font-bold text-emerald-600 mt-1">₹{item.price}</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">{item.description}</p>
                        <div className="mt-4 pt-3 border-t dark:border-slate-700 text-xs text-gray-500">
                          Contact: {item.ownerName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DIRECTORY TAB */}
            {activeTab === TABS.DIRECTORY && (
              <div className="space-y-6">
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold dark:text-white">Directory</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map(m => (
                    <div key={m.uid} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition">
                      <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-lg">
                        {m.fullName[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold dark:text-white">{m.fullName}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Unit: {m.unitNumber}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RENTALS TAB */}
            {activeTab === TABS.RENTALS && (
              <div className="space-y-4">
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold dark:text-white">Rentals</h2><button className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700" onClick={() => openModal('rental')}>List Property</button></div>
                {rentals.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                    <Home size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No rentals available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rentals.map(r => (
                      <div key={r.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between">
                          <h3 className="font-bold dark:text-white">{r.type} <span className="text-sm font-normal text-gray-500">({r.category})</span></h3>
                          <span className="text-emerald-600 font-bold">₹{r.price}/mo</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{r.description}</p>
                        <button className="mt-3 text-emerald-600 text-sm font-bold hover:underline">Contact: {r.ownerName}</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AMENITIES TAB */}
            {activeTab === TABS.AMENITIES && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold dark:text-white">Amenities</h2>
                  {isAdmin && <button className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700" onClick={() => openModal('amenity')}>Add Amenity</button>}
                </div>
                {amenities.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                    <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No amenities listed yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {amenities.map(a => (
                      <div key={a.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-lg dark:text-white">{a.name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          <p>Capacity: {a.capacity} people</p>
                          <p>Timings: {a.is24x7 ? <span className="text-green-600 font-bold">24x7 Open</span> : `${a.openTime} - ${a.closeTime}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ELECTIONS TAB */}
            {activeTab === TABS.ELECTIONS && (
              <div className="space-y-4">
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold dark:text-white">Elections</h2>{isAdmin && <button className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700" onClick={() => openModal('election')}>Create Poll</button>}</div>
                {elections.map(e => (
                  <div key={e.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-lg dark:text-white mb-2">{e.title} - {e.position}</h3>
                    <div className="space-y-3">
                      {e.candidates.map(c => (
                        <div key={c.id} className="flex justify-between items-center bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                          <span className="dark:text-white">{c.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold dark:text-white">{c.votes} votes</span>
                            <button onClick={() => handleVote(e.id, c.id)} disabled={e.voters.includes(user.uid)} className="bg-emerald-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700">Vote</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SETTINGS TAB (Admin Only) */}
            {activeTab === TABS.SETTINGS && isAdmin && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold dark:text-white">Admin Settings</h2>

                {/* Unit Management */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg dark:text-white">Manage Society Units</h3>
                    <button onClick={() => openModal('add_unit')} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm hover:bg-emerald-700 transition flex items-center gap-2"><Plus size={16} /> Add Unit</button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Define valid unit numbers for resident registration.</p>

                  <div className="flex flex-wrap gap-2">
                    {societyData?.units?.length > 0 ? societyData.units.map(unit => (
                      <span key={unit} className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {unit}
                        <button onClick={() => handleDeleteUnit(unit)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                      </span>
                    )) : <p className="text-gray-400 text-sm italic">No units added yet.</p>}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* MODALS */}
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title="Details">
        <div className="space-y-4">
          {modalState.type === 'payment_settings' && (
            <>
              <h4 className="font-bold dark:text-white">Bank Details</h4>
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" placeholder="Account Name" onChange={e => setFormData({ ...formData, accountName: e.target.value })} defaultValue={societyData?.bankDetails?.accountName} />
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" placeholder="Account Number" onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} defaultValue={societyData?.bankDetails?.accountNumber} />
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" placeholder="IFSC Code" onChange={e => setFormData({ ...formData, ifsc: e.target.value })} defaultValue={societyData?.bankDetails?.ifsc} />
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" placeholder="Bank Name" onChange={e => setFormData({ ...formData, bankName: e.target.value })} defaultValue={societyData?.bankDetails?.bankName} />

              <h4 className="font-bold mt-4 dark:text-white">UPI Details</h4>
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" placeholder="UPI ID (e.g. society@upi)" onChange={e => setFormData({ ...formData, upiId: e.target.value })} defaultValue={societyData?.upiDetails?.upiId} />
              <p className="text-xs text-gray-500">QR Code upload will be supported in future updates.</p>
            </>
          )}
          {modalState.type === 'pay_bill_select' && (
            <>
              <h4 className="font-bold dark:text-white mb-2">Select Dues to Pay</h4>
              <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                {bills.filter(b => b.userId === user.uid && b.status === 'Unpaid').map(b => (
                  <label key={b.id} className="flex items-center gap-2 p-2 border rounded dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.selectedBills?.some(sb => sb.id === b.id)}
                      onChange={e => {
                        const current = formData.selectedBills || [];
                        if (e.target.checked) setFormData({ ...formData, selectedBills: [...current, b] });
                        else setFormData({ ...formData, selectedBills: current.filter(sb => sb.id !== b.id) });
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold dark:text-white">{b.title}</p>
                      <p className="text-xs text-red-500">₹{b.amount} - Due: {b.dueDate}</p>
                    </div>
                  </label>
                ))}
                {bills.filter(b => b.userId === user.uid && b.status === 'Unpaid').length === 0 && <p className="text-sm text-green-600">No pending dues!</p>}
              </div>

              <h4 className="font-bold dark:text-white mb-2">Advance Payment / Credit</h4>
              <button
                className="w-full py-2 border-2 border-dashed border-emerald-500 text-emerald-600 rounded mb-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                onClick={() => { setModalState({ type: 'pay_mode', isOpen: true, mode: 'Advance' }); setFormData({ amount: '', isAdvance: true }); }}
              >
                + Add Advance Credit
              </button>

              <div className="flex justify-between items-center border-t pt-4">
                <span className="font-bold dark:text-white">Total: ₹{(formData.selectedBills || []).reduce((sum, b) => sum + parseFloat(b.amount), 0)}</span>
                <button
                  disabled={!formData.selectedBills?.length}
                  onClick={() => setModalState({ type: 'pay_mode', isOpen: true })}
                  className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Proceed
                </button>
              </div>
            </>
          )}
          {modalState.type === 'pay_mode' && (
            <div className="space-y-4">
              <h4 className="font-bold dark:text-white text-lg">Select Payment Mode</h4>
              <p className="text-sm text-gray-500">Amount: ₹{formData.isAdvance ? formData.amount : (formData.selectedBills || []).reduce((sum, b) => sum + parseFloat(b.amount), 0)}</p>

              {formData.isAdvance && (
                <input type="number" placeholder="Enter Advance Amount" className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, amount: e.target.value })} />
              )}

              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'Bank Transfer', 'UPI'].map(m => (
                  <button
                    key={m}
                    onClick={() => setFormData({ ...formData, method: m })}
                    className={`p-3 rounded border text-center text-sm ${formData.method === m ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {formData.method === 'Bank Transfer' && (
                <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded text-sm space-y-1">
                  <p><span className="font-bold">Bank:</span> {societyData?.bankDetails?.bankName || 'N/A'}</p>
                  <p><span className="font-bold">Acct:</span> {societyData?.bankDetails?.accountNumber || 'N/A'}</p>
                  <p><span className="font-bold">IFSC:</span> {societyData?.bankDetails?.ifsc || 'N/A'}</p>
                  <p><span className="font-bold">Name:</span> {societyData?.bankDetails?.accountName || 'N/A'}</p>
                </div>
              )}

              {formData.method === 'UPI' && (
                <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded text-center">
                  <div className="bg-white p-2 w-32 h-32 mx-auto mb-2 flex items-center justify-center border">
                    <QrCode size={64} />
                  </div>
                  <p className="font-mono bg-white dark:bg-slate-800 p-1 rounded text-xs select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(societyData?.upiDetails?.upiId)}>
                    {societyData?.upiDetails?.upiId || 'No UPI ID Set'} <Copy size={10} className="inline" />
                  </p>
                </div>
              )}

              {(formData.method === 'Bank Transfer' || formData.method === 'UPI') && (
                <div>
                  <label className="block text-xs font-bold mb-1 dark:text-white">Attach Proof (Screenshot)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                    <Upload size={20} className="mx-auto text-gray-400" />
                    <span className="text-xs text-gray-500">Click to upload (Simulated)</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  const payload = formData.isAdvance
                    ? { type: 'add_advance' }
                    : { type: 'pay_bill_online', billIds: formData.selectedBills.map(b => b.id), proof: 'Simulated_Screenshot.jpg' };

                  if (formData.method === 'Cash') {
                    alert("Please pay cash to the Treasurer/Admin. They will update the status.");
                    // Optionally create a 'Cash Pending' request
                  } else {
                    setModalState({ ...modalState, type: payload.type });
                    handleSubmitModal(); // Re-trigger submit with new type
                  }
                }}
                className="w-full bg-emerald-600 text-white py-2 rounded"
              >
                Mark as Paid
              </button>
            </div>
          )}
          {modalState.type === 'set_maintenance' && (
            <>
              <label className="text-sm dark:text-white">Monthly Maintenance Amount (₹)</label>
              <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, amount: e.target.value })} defaultValue={societyData.maintenanceAmount} />
              <label className="text-sm dark:text-white">Late Fee Amount (₹)</label>
              <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, lateFee: e.target.value })} defaultValue={societyData.lateFee} />
            </>
          )}
          {modalState.type === 'generate_monthly' && (
            <>
              <p className="text-sm text-gray-500">Generating bills for {members.length} members.</p>
              <label className="text-sm dark:text-white">Due Date</label>
              <input type="date" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
            </>
          )}
          {modalState.type === 'add_funds' && (
            <>
              <label className="text-sm dark:text-white">Amount (₹)</label>
              <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Amount" onChange={e => setFormData({ ...formData, amount: e.target.value })} />

              <label className="text-sm dark:text-white mt-4 block">Source</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                  <input
                    type="radio"
                    name="fundType"
                    value="Cash in Hand"
                    onChange={e => setFormData({ ...formData, fundType: e.target.value })}
                    defaultChecked
                  />
                  Cash in Hand
                </label>
                <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                  <input
                    type="radio"
                    name="fundType"
                    value="Cash in Bank"
                    onChange={e => setFormData({ ...formData, fundType: e.target.value })}
                  />
                  Cash in Bank
                </label>
              </div>
            </>
          )}
          {modalState.type === 'add_unit' && (
            <>
              <label className="text-sm dark:text-white">Add Unit Number(s)</label>
              <input
                className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                placeholder="e.g. A-101, A-102 (Comma separated)"
                onChange={e => setFormData({ ...formData, units: e.target.value })}
              />
              <p className="text-xs text-gray-500">Residents will select from these units during registration.</p>
            </>
          )}
          {modalState.type === 'notice' && (
            <>
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Notice Title" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Notice Content" rows={4} onChange={e => setFormData({ ...formData, content: e.target.value })} />
              <select className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="General">General</option>
                <option value="Urgent">Urgent</option>
                <option value="Event">Event</option>
              </select>
            </>
          )}
          {modalState.type === 'event' && (
            <>
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Event Title" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Event Details" rows={3} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <input type="date" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, date: e.target.value })} />
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Location (e.g. Club House)" onChange={e => setFormData({ ...formData, location: e.target.value })} />
            </>
          )}
          {modalState.type === 'complaint' && (
            <>
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Subject" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Describe the issue..." rows={4} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <select className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </>
          )}
          {modalState.type === 'recurring_expense' && (
            <>
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Expense Name (e.g. Salary)" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Amount (₹)" onChange={e => setFormData({ ...formData, amount: e.target.value })} />
              <select className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, frequency: e.target.value })}>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </>
          )}
          {modalState.type === 'expense' && (
            <>
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Expense Title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Amount (₹)" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: e.target.value })} />

              <div className="space-y-2 mt-2">
                <p className="text-sm font-semibold dark:text-white">Deduction Method:</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer dark:text-white text-sm">
                    <input type="radio" name="splitType" value="split_all" defaultChecked onChange={e => setFormData({ ...formData, splitType: e.target.value, deductFromSociety: false })} />
                    Split All Members
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer dark:text-white text-sm">
                    <input type="radio" name="splitType" value="society_fund" onChange={e => setFormData({ ...formData, splitType: e.target.value, deductFromSociety: true })} />
                    Deduct Society Fund
                  </label>
                </div>
                <label className="flex items-center gap-2 cursor-pointer dark:text-white text-sm">
                  <input type="radio" name="splitType" value="split_specific" onChange={e => setFormData({ ...formData, splitType: e.target.value, deductFromSociety: false })} />
                  Split Specific Units
                </label>
                {formData.splitType === 'split_specific' && (
                  <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600 text-sm" placeholder="Enter Unit Numbers (comma separated)" onChange={e => setFormData({ ...formData, splitUnits: e.target.value })} />
                )}
              </div>
            </>
          )}
          {modalState.type === 'rental' && (
            <>
              <select className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option value="">Select Category</option>
                <option value="Property/Flat">Property/Flat</option>
                <option value="Parking">Parking</option>
              </select>
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Type (e.g. 2BHK / Covered Slot)" onChange={e => setFormData({ ...formData, type: e.target.value })} />
              <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Rent (₹/month)" onChange={e => setFormData({ ...formData, price: e.target.value })} />
              <textarea className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Description/Details" onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </>
          )}
          {modalState.type === 'amenity' && (
            <>
              <select className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, name: e.target.value })}>
                <option value="">Select Amenity</option>
                {AMENITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {formData.name === 'Other' && (
                <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Specify Amenity Name" onChange={e => setFormData({ ...formData, customName: e.target.value })} />
              )}
              <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Capacity (persons)" onChange={e => setFormData({ ...formData, capacity: e.target.value })} />

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="is24x7" onChange={e => setFormData({ ...formData, is24x7: e.target.checked })} />
                <label htmlFor="is24x7" className="dark:text-white">24x7 Open</label>
              </div>

              {!formData.is24x7 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input type="time" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, openTime: e.target.value })} />
                  <input type="time" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, closeTime: e.target.value })} />
                </div>
              )}
            </>
          )}
          {modalState.type === 'election' && (
            <>
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Election Title" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Position (e.g. Secretary)" onChange={e => setFormData({ ...formData, position: e.target.value })} />
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Candidates (comma separated)" onChange={e => setFormData({ ...formData, candidatesString: e.target.value })} />
              <p className="text-xs text-gray-500">Example: John Doe, Jane Smith, Robert Brown</p>
            </>
          )}
          {modalState.type === 'classified' && (
            <>
              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Item Title" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Description" rows={3} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <div className="flex gap-4">
                <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" type="number" placeholder="Price (₹)" onChange={e => setFormData({ ...formData, price: e.target.value })} />
                <select className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="Sell">Sell</option>
                  <option value="Buy">Buy</option>
                </select>
              </div>
            </>
          )}
          {(modalState.type === 'visitor_preapprove' || modalState.type === 'visitor_entry') && (
            <>
              <select
                className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">Select Visitor Type</option>
                {VISITOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {formData.type === 'Others' && (
                <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Specify Visitor Type" onChange={e => setFormData({ ...formData, customType: e.target.value })} />
              )}

              <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Visitor Name" onChange={e => setFormData({ ...formData, name: e.target.value })} />

              {modalState.type === 'visitor_entry' && (
                <div className="flex gap-2">
                  <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Flat No / Unit" onChange={e => setFormData({ ...formData, hostUnit: e.target.value })} />
                  <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" placeholder="Purpose" onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
                </div>
              )}

              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="isDaily" onChange={e => setFormData({ ...formData, isDaily: e.target.checked })} />
                <label htmlFor="isDaily" className="dark:text-white text-sm">Daily Help/Staff?</label>
              </div>

              {!formData.isDaily && modalState.type === 'visitor_preapprove' && (
                <>
                  <label className="text-xs text-gray-500">Expected Date:</label>
                  <input type="date" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, visitDate: e.target.value })} />

                  <label className="text-xs text-gray-500 mt-2 block">Expected Time Window:</label>
                  <div className="flex gap-2">
                    <input type="time" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, timeStart: e.target.value })} />
                    <span className="self-center dark:text-white">to</span>
                    <input type="time" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600" onChange={e => setFormData({ ...formData, timeEnd: e.target.value })} />
                  </div>
                </>
              )}
            </>
          )}

          <button onClick={handleSubmitModal} className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition">Submit</button>
        </div>
      </Modal>
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
    </AppWrapper>
  );
}
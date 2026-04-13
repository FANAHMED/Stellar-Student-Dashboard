import * as React from "react";
import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  MessageSquare, 
  StickyNote, 
  Settings, 
  LogOut,
  Bell,
  MoreHorizontal,
  Search,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Filter,
  Megaphone,
  Clock,
  BookOpen,
  Calculator,
  RotateCcw,
  Trophy,
  Zap,
  TrendingUp,
  Moon,
  Sun,
  Send,
  Sparkles,
  Bot
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Types ---
type Tab = 'Dashboard' | 'Schedule' | 'Assignments' | 'Tasks' | 'Analytics' | 'Exams' | 'Notes' | 'Materials' | 'Settings';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'Exam' | 'Assignment' | 'System';
  read: boolean;
}

interface Material {
  id: string;
  subject: string;
  title: string;
  type: 'Project' | 'Assignment' | 'Resource' | 'Other';
  date: string;
  fileName: string;
  fileSize: string;
}

interface UserProfile {
  name: string;
  studentId: string;
  gpa: number;
  targetGpa: number;
  avatar: string;
  subjects: string[];
  uniEmail?: string;
}

interface Exam {
  id: string;
  subject: string;
  date: string;
  time: string;
  room: string;
  status: 'Upcoming' | 'Completed';
}

interface Task {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  status: 'Completed' | 'Submitted' | 'Incomplete' | 'In Progress' | 'To Do';
  progress: number;
  avatars: number;
}

interface Assignment {
  id: string;
  title: string;
  due: string;
  date: string;
  status: 'Pending' | 'Done';
}

interface TimetableCell {
  subject: string;
  room: string;
  timeRange: string;
  color: string;
  duration: number;
}

interface TimetableData {
  [day: string]: {
    [period: string]: TimetableCell | null;
  };
}

// --- Mock Data ---
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const PERIODS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

const INITIAL_TIMETABLE: TimetableData = {};
const INITIAL_EXAMS: Exam[] = [];
const INITIAL_TASKS: Task[] = [];

// --- Components ---

interface SidebarItemProps {
  key?: React.Key;
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}

const Timetable = memo(({ data, onCellClick }: { data: TimetableData, onCellClick: (day: string, period: string) => void }) => {
  const occupied = new Set<string>();
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-4">
      <div className={`min-w-[900px] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'} rounded-[40px] p-8 shadow-xl border relative overflow-hidden`}>
        {/* Cute Background Pattern */}
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${isDarkMode ? 'bg-[radial-gradient(#ffffff_1px,transparent_1px)]' : 'bg-[radial-gradient(#ff69b4_1px,transparent_1px)]'} [background-size:20px_20px]`} />
        
        <div className="grid grid-cols-6 gap-3 relative">
          {/* Header */}
          <div className={`h-14 flex items-center justify-center font-black text-[10px] ${isDarkMode ? 'text-pink-400 bg-pink-900/20 border-pink-900/30' : 'text-pink-400 bg-pink-50/50 border-pink-100'} uppercase tracking-[0.2em] rounded-2xl border`}>Hours</div>
          {DAYS.map(day => (
            <div key={day} className={`h-14 flex items-center justify-center font-black text-xs ${isDarkMode ? 'text-gray-200 bg-gray-800 border-gray-700' : 'text-gray-800 bg-gray-50/50 border-gray-100'} uppercase tracking-widest rounded-2xl border`}>{day}</div>
          ))}

          {/* Rows */}
          {PERIODS.map((period, pIndex) => (
            <React.Fragment key={period}>
              <div className={`h-28 flex flex-col items-center justify-center ${isDarkMode ? 'bg-pink-900/10 border-pink-900/20' : 'bg-pink-50/30 border-pink-50'} rounded-2xl border`}>
                <span className="font-black text-sm text-pink-400">{period.split(' ')[0]}</span>
                <span className={`text-[8px] font-black ${isDarkMode ? 'text-pink-500/50' : 'text-pink-300'} uppercase`}>{period.split(' ')[1]}</span>
              </div>
              {DAYS.map(day => {
                const key = `${day}-${period}`;
                if (occupied.has(key)) return null;

                const cell = data[day]?.[period];
                const duration = cell?.duration || 1;

                if (duration > 1) {
                  for (let i = 1; i < duration; i++) {
                    const nextPeriod = PERIODS[pIndex + i];
                    if (nextPeriod) occupied.add(`${day}-${nextPeriod}`);
                  }
                }

                return (
                  <div 
                    key={key}
                    onClick={() => onCellClick(day, period)}
                    style={{ gridRow: `span ${duration}` }}
                    className={`min-h-[112px] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-3 text-center group relative overflow-hidden ${
                      cell 
                        ? `${cell.color} border-transparent shadow-md hover:scale-[1.02] hover:shadow-lg` 
                        : (isDarkMode ? 'border-gray-800 hover:border-pink-900/50 hover:bg-pink-900/10' : 'border-gray-100 hover:border-pink-200 hover:bg-pink-50/30')
                    }`}
                  >
                    {cell ? (
                      <>
                        <div className={`absolute top-1 right-1 ${isDarkMode ? 'text-gray-800' : 'opacity-20'} group-hover:opacity-40 transition-opacity`}>
                          <BookOpen size={12} />
                        </div>
                        <span className={`text-xs font-black text-gray-800 leading-tight mb-1`}>{cell.subject}</span>
                        <span className={`text-[9px] font-bold ${isDarkMode ? 'text-gray-700 bg-white/30' : 'text-gray-500/70 bg-white/50'} uppercase tracking-tighter px-2 py-0.5 rounded-full mb-1`}>Room {cell.room}</span>
                        <span className={`text-[8px] font-black ${isDarkMode ? 'text-gray-700' : 'text-gray-400/80'}`}>{cell.timeRange}</span>
                        {duration > 1 && (
                          <div className={`absolute bottom-2 right-2 ${isDarkMode ? 'bg-black/10 text-gray-700' : 'bg-black/5 text-gray-500'} px-2 py-0.5 rounded-full text-[7px] font-black uppercase`}>
                            {duration} Hours
                          </div>
                        )}
                      </>
                    ) : (
                      <Plus size={18} className="text-gray-200 group-hover:text-pink-400 group-hover:rotate-90 transition-all duration-300" />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});

const Onboarding = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [step, setStep] = useState(1);
  const [newSubject, setNewSubject] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    studentId: '',
    gpa: 3.0,
    targetGpa: 4.0,
    avatar: `https://picsum.photos/seed/${Math.random()}/200/200`,
    subjects: []
  });

  const addSubject = () => {
    if (newSubject.trim()) {
      setProfile({ ...profile, subjects: [...profile.subjects, newSubject.trim()] });
      setNewSubject('');
    }
  };

  const removeSubject = (index: number) => {
    const newSubjects = [...profile.subjects];
    newSubjects.splice(index, 1);
    setProfile({ ...profile, subjects: newSubjects });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-[#f0f9f8] flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-gradient-to-br from-[#e0f2f1] via-[#f0f9f8] to-[#ffffff] -z-10" />
      
      <Card className="w-full max-w-md p-10 shadow-2xl border-none">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-green-400 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg mb-6">V</div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">Welcome, Student!</h2>
          <p className="text-gray-400 font-medium">Let's set up your smart dashboard.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  placeholder="Enter your name"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-green-400 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Student ID</label>
                <input 
                  type="text" 
                  value={profile.studentId}
                  onChange={e => setProfile({...profile, studentId: e.target.value})}
                  placeholder="e.g. 23606"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-green-400 focus:outline-none transition-all"
                />
              </div>
              <button 
                disabled={!profile.name || !profile.studentId}
                onClick={() => setStep(2)}
                className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                Next Step
              </button>
            </motion.div>
          ) : step === 2 ? (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Current GPA</label>
                  <input 
                    type="number" 
                    step="0.01"
                    max="4.0"
                    value={profile.gpa}
                    onChange={e => setProfile({...profile, gpa: parseFloat(e.target.value)})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-green-400 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Target GPA</label>
                  <input 
                    type="number" 
                    step="0.01"
                    max="4.0"
                    value={profile.targetGpa}
                    onChange={e => setProfile({...profile, targetGpa: parseFloat(e.target.value)})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-green-400 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={() => setStep(3)}
                className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Next Step
              </button>
              <button 
                onClick={() => setStep(1)}
                className="w-full text-gray-400 font-black text-[10px] uppercase hover:text-gray-600 transition-colors"
              >
                Go Back
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Add Your Subjects</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addSubject()}
                    placeholder="e.g. Mathematics"
                    className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-green-400 focus:outline-none transition-all"
                  />
                  <button 
                    onClick={addSubject}
                    className="p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="max-h-[250px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {profile.subjects.map((subject, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-green-100 transition-all">
                    <span className="text-xs font-bold text-gray-700">{subject}</span>
                    <button onClick={() => removeSubject(index)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </div>
                ))}
                {profile.subjects.length === 0 && (
                  <p className="text-center text-[10px] text-gray-400 font-bold py-8">No subjects added yet. Add as many as you need!</p>
                )}
              </div>

              <button 
                disabled={profile.subjects.length === 0}
                onClick={() => onComplete(profile)}
                className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Complete Setup
              </button>
              <button 
                onClick={() => setStep(2)}
                className="w-full text-gray-400 font-black text-[10px] uppercase hover:text-gray-600 transition-colors"
              >
                Go Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

interface CardProps {
  key?: React.Key;
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void, key?: React.Key }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  return (
    <div 
      onClick={onClick} 
      className={`${isDarkMode ? 'bg-gray-900 border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : 'bg-white border-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} rounded-[28px] p-5 border transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
        active 
          ? (isDarkMode ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-[#1a1a1a] text-white shadow-lg shadow-gray-200')
          : (isDarkMode ? 'text-gray-500 hover:bg-gray-800 hover:text-gray-300' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600')
      }`}
    >
      <Icon size={18} className={`${active ? (isDarkMode ? 'text-white' : 'text-green-400') : (isDarkMode ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600')}`} />
      <span className="text-xs font-black tracking-tight">{label}</span>
      {active && (
        <motion.div 
          layoutId="active-pill"
          className={`ml-auto w-1 h-4 ${isDarkMode ? 'bg-white' : 'bg-green-400'} rounded-full`}
        />
      )}
    </button>
  );
};

interface TaskCardProps {
  key?: React.Key;
  task: Task;
}

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-lg ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-white'} rounded-[32px] p-8 shadow-2xl border`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
              <button onClick={onClose} className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full transition-colors`}>
                <Plus size={20} className="rotate-45 text-gray-400" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const TaskCard = ({ task, onEdit }: { task: Task, onEdit: (task: Task) => void, key?: React.Key }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onEdit(task)}
      className={`flex items-start gap-4 p-4 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' : 'bg-gray-50/50 border-transparent hover:border-gray-200'} rounded-2xl mb-3 border transition-all group cursor-pointer`}
    >
      <div className="text-center min-w-[50px] pt-1">
        <div className={`text-xs font-extrabold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{task.time}</div>
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{task.date}</div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-0.5 group-hover:text-green-600 transition-colors`}>{task.title}</h4>
          <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[9px] text-gray-400 mb-3 leading-relaxed line-clamp-1">{task.description}</p>
        <div className="flex items-center gap-3">
          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold border ${
            task.status === 'Completed' ? (isDarkMode ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-green-100 text-green-600 border-green-200') : 
            task.status === 'Submitted' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-900/50' : 'bg-blue-100 text-blue-600 border-blue-200') : 
            task.status === 'Incomplete' ? (isDarkMode ? 'bg-red-900/30 text-red-400 border-red-900/50' : 'bg-red-100 text-red-600 border-red-200') : 
            (isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50' : 'bg-yellow-100 text-yellow-600 border-yellow-200')
          }`}>
            {task.status}
          </span>
          <div className={`flex-1 h-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              className={`h-full rounded-full ${task.progress === 100 ? 'bg-green-500' : 'bg-green-400'}`} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Page Views ---

const ScheduleView = ({ data, onCellClick }: { data: TimetableData, onCellClick: (day: string, period: string) => void }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center px-2">
        <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Weekly Timetable</h3>
        <div className="flex items-center gap-2">
          <div className={`text-[10px] font-black text-gray-400 uppercase ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} px-3 py-1.5 rounded-full border`}>Semester 2, 2026</div>
        </div>
      </div>
      <Timetable data={data} onCellClick={onCellClick} />
    </div>
  );
};

const AssignmentsView = ({ assignments, onEdit }: { assignments: Assignment[], onEdit: (as: Assignment | null) => void }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Assignments</h3>
        <button onClick={() => onEdit(null)} className="p-2 bg-green-500 text-white rounded-full hover:scale-105 transition-transform">
          <Plus size={16} />
        </button>
      </div>
      {assignments.length === 0 ? (
        <div className={`text-center py-20 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[40px] border-2 border-dashed`}>
          <p className="text-gray-400 font-bold">No assignments yet. Click (+) to add one!</p>
        </div>
      ) : (
        assignments.map((as, i) => (
          <Card key={i} onClick={() => onEdit(as)} className="flex items-center justify-between p-4 cursor-pointer hover:border-green-200 transition-all group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex items-center justify-center group-hover:bg-green-50 transition-colors`}>
                <BookOpen size={20} className="text-gray-400 group-hover:text-green-500" />
              </div>
              <div>
                <h4 className={`text-sm font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} group-hover:text-green-600 transition-colors`}>{as.title}</h4>
                <p className="text-[10px] text-gray-400 font-bold">{as.date} • {as.due}</p>
              </div>
            </div>
            <span className={`text-[10px] font-black uppercase ${as.status === 'Done' ? 'text-green-500' : 'text-yellow-500'}`}>{as.status}</span>
          </Card>
        ))
      )}
    </div>
  );
};

const AnalyticsView = ({ profile, gpaCalc, setGpaCalc, gpaList, setGpaList, addToGpaCalc, calculatedGPA }: { 
  profile: UserProfile, 
  gpaCalc: any, 
  setGpaCalc: any, 
  gpaList: any[], 
  setGpaList: any, 
  addToGpaCalc: () => void, 
  calculatedGPA: string 
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-12 flex justify-between items-center mb-2">
        <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Academic Analytics</h3>
        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border shadow-sm`}>
            Semester Overview
          </div>
        </div>
      </div>

      {/* GPA Summary Card */}
      <Card className="md:col-span-4 p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none">
        <div className="flex justify-between items-start mb-8">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Trophy size={24} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-green-100 uppercase tracking-widest">Current GPA</p>
            <p className="text-4xl font-black">{profile.gpa.toFixed(2)}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-green-100">Target Goal</span>
            <span>{profile.targetGpa.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(profile.gpa / profile.targetGpa) * 100}%` }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <p className="text-[10px] text-green-50 font-medium italic opacity-80">
            "Success is the sum of small efforts, repeated day in and day out."
          </p>
        </div>
      </Card>

      {/* Subject Performance Radar/Bar Chart */}
      <Card className="md:col-span-8 p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Subject Performance</h4>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-[10px] font-bold text-gray-400">Score %</span>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profile.subjects.map((subject, idx) => ({
              name: subject,
              score: [85, 72, 94, 88, 78, 82, 90][idx % 7]
            }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#f3f4f6'} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: isDarkMode ? '#1f2937' : '#f9fafb' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                  fontSize: '10px',
                  backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#000000'
                }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {profile.subjects.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

    {/* GPA Calculator Section */}
    <Card className="md:col-span-12 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-10 h-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} rounded-xl flex items-center justify-center text-green-500 border`}>
          <Calculator size={20} />
        </div>
        <div>
          <h4 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>GPA Forecaster</h4>
          <p className="text-[10px] text-gray-400 font-bold">Predict your semester results</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Credits</label>
              <input 
                type="number" 
                value={gpaCalc.credits}
                onChange={e => setGpaCalc({...gpaCalc, credits: e.target.value})}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-green-400 transition-all`}
                placeholder="e.g. 3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Grade</label>
              <select 
                value={gpaCalc.grade}
                onChange={e => setGpaCalc({...gpaCalc, grade: e.target.value})}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-green-400 transition-all appearance-none`}
              >
                <option value="4.0">A (4.0)</option>
                <option value="3.5">B+ (3.5)</option>
                <option value="3.0">B (3.0)</option>
                <option value="2.5">C+ (2.5)</option>
                <option value="2.0">C (2.0)</option>
                <option value="1.0">D (1.0)</option>
                <option value="0.0">F (0.0)</option>
              </select>
            </div>
          </div>
          <button 
            onClick={addToGpaCalc}
            className={`w-full ${isDarkMode ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white'} py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all`}
          >
            Add to Forecast
          </button>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
            {gpaList.map(item => (
              <div key={item.id} className={`flex justify-between items-center p-3.5 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} rounded-2xl border group`}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className={`text-[11px] font-black ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.credits} Credits</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-black text-gray-400">Grade: {item.grade}</span>
                  <button onClick={() => setGpaList(gpaList.filter(i => i.id !== item.id))} className="text-red-300 hover:text-red-500 transition-colors">
                    <Plus size={16} className="rotate-45" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} rounded-[40px] p-10 flex flex-col items-center justify-center text-center border relative overflow-hidden`}>
          <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${isDarkMode ? 'bg-[radial-gradient(#ffffff_1px,transparent_1px)]' : 'bg-[radial-gradient(#10b981_1px,transparent_1px)]'} [background-size:20px_20px]`} />
          <div className="relative z-10">
            <div className={`w-20 h-20 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[28px] flex items-center justify-center text-green-500 shadow-sm mb-6 mx-auto border`}>
              <Calculator size={40} />
            </div>
            <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Estimated Semester GPA</h5>
            <p className={`text-8xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'} tracking-tighter mb-6`}>{calculatedGPA}</p>
            <div className={`inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg ${isDarkMode ? 'shadow-green-900/20' : 'shadow-green-100'}`}>
              <Zap size={14} className="fill-white" />
              Based on {gpaList.length} subjects
            </div>
          </div>
        </div>

        {/* GPA Roadmap */}
        <div className="lg:col-span-3 space-y-6">
          <h4 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'} uppercase tracking-widest`}>GPA Roadmap</h4>
          <div className="space-y-3">
            {[
              { label: 'Optimistic (All A)', gpa: (parseFloat(calculatedGPA) + 0.4).toFixed(2), color: 'bg-green-500' },
              { label: 'Realistic (Current)', gpa: calculatedGPA, color: 'bg-blue-500' },
              { label: 'Pessimistic (All C)', gpa: (parseFloat(calculatedGPA) - 0.6).toFixed(2), color: 'bg-orange-500' }
            ].map((path, i) => (
              <div key={i} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-4 rounded-2xl border shadow-sm`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase">{path.label}</span>
                  <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{path.gpa}</span>
                </div>
                <div className={`h-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-full overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(parseFloat(path.gpa) / 4) * 100}%` }}
                    className={`h-full ${path.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={`p-4 ${isDarkMode ? 'bg-purple-900/20 border-purple-900/30' : 'bg-purple-50 border-purple-100'} rounded-2xl border`}>
            <p className={`text-[10px] font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} leading-relaxed`}>
              💡 Pro Tip: Aim for at least 3.5 GPA this semester to stay on track for your graduation goal.
            </p>
          </div>
        </div>
      </div>
    </Card>
  </div>
  );
};

const NotesView = ({ notes, onEdit }: { notes: any[], onEdit: (n: any) => void }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-full flex justify-between items-center">
        <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Notes</h3>
        <button onClick={() => onEdit(null)} className="p-2 bg-green-500 text-white rounded-full hover:scale-105 transition-transform">
          <Plus size={16} />
        </button>
      </div>
      {notes.length === 0 ? (
        <div className={`col-span-full text-center py-20 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[40px] border-2 border-dashed`}>
          <p className="text-gray-400 font-bold">No notes yet. Click (+) to add one!</p>
        </div>
      ) : (
        notes.map((n, i) => (
          <Card key={i} onClick={() => onEdit(n)} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-12 h-12 ${isDarkMode ? 'bg-green-900/20 group-hover:bg-green-900/40' : 'bg-green-50 group-hover:bg-green-100'} rounded-bl-[32px] -mr-4 -mt-4 transition-colors`} />
            <div className="flex justify-between items-start mb-4 relative">
              <StickyNote size={20} className="text-green-500" />
              <MoreHorizontal size={16} className="text-gray-300" />
            </div>
            <h4 className={`font-black text-sm mb-2 ${isDarkMode ? 'text-gray-200 group-hover:text-green-500' : 'text-gray-800 group-hover:text-green-600'} transition-colors relative`}>{n.title}</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed relative line-clamp-3">{n.content}</p>
          </Card>
        ))
      )}
    </div>
  );
};

const Decoration = ({ icon: Icon, className }: { icon: any, className: string }) => (
  <motion.div 
    animate={{ 
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      duration: 4, 
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={`absolute pointer-events-none opacity-20 ${className}`}
  >
    <Icon size={48} />
  </motion.div>
);

const SettingsView = ({ profile, onUpdate, onReset }: { profile: UserProfile, onUpdate: (p: UserProfile) => void, onReset: () => void }) => {
  const [newSubject, setNewSubject] = useState('');
  const isDarkMode = document.documentElement.classList.contains('dark');

  const addSubject = () => {
    if (newSubject.trim()) {
      onUpdate({ ...profile, subjects: [...profile.subjects, newSubject.trim()] });
      setNewSubject('');
    }
  };

  const removeSubject = (index: number) => {
    const newSubjects = [...profile.subjects];
    newSubjects.splice(index, 1);
    onUpdate({ ...profile, subjects: newSubjects });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Settings</h3>
      <Card className="p-8 space-y-8">
        <div className={`flex items-center gap-6 pb-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
          <div className={`w-20 h-20 rounded-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-white'} overflow-hidden border-4 shadow-sm`}>
            <img src={profile.avatar} alt="Avatar" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{profile.name}</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Student Profile</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Full Name</label>
            <input 
              type="text" 
              value={profile.name}
              onChange={e => onUpdate({...profile, name: e.target.value})}
              className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 outline-none`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">University Email</label>
            <input 
              type="email" 
              value={profile.uniEmail || ''}
              onChange={e => onUpdate({...profile, uniEmail: e.target.value})}
              placeholder="e.g. student@uni.edu"
              className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 outline-none`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Student ID</label>
            <input 
              type="text" 
              value={profile.studentId}
              onChange={e => onUpdate({...profile, studentId: e.target.value})}
              className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 outline-none`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">GPA</label>
              <input 
                type="number" 
                step="0.01"
                value={profile.gpa}
                onChange={e => onUpdate({...profile, gpa: parseFloat(e.target.value)})}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 outline-none`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Target</label>
              <input 
                type="number" 
                step="0.01"
                value={profile.targetGpa}
                onChange={e => onUpdate({...profile, targetGpa: parseFloat(e.target.value)})}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 outline-none`}
              />
            </div>
          </div>
        </div>

        <div className={`space-y-4 pt-6 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
          <label className="block text-[10px] font-black text-gray-400 uppercase ml-1">Manage Subjects</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addSubject()}
              placeholder="Add new subject..."
              className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 outline-none`}
            />
            <button 
              onClick={addSubject}
              className={`px-6 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg ${isDarkMode ? 'shadow-green-900/20' : 'shadow-green-100'} hover:bg-green-600 transition-all`}
            >
              Add
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.subjects.map((subject, index) => (
              <div key={index} className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} rounded-2xl border group hover:border-red-100 transition-all`}>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{subject}</span>
                <button onClick={() => removeSubject(index)} className="text-red-400 hover:text-red-600 transition-colors">
                  <Plus size={16} className="rotate-45" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`pt-6 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
          <button 
            onClick={onReset}
            className={`w-full ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-50 text-red-500 hover:bg-red-100'} py-4 rounded-2xl font-black text-sm transition-colors`}
          >
            Reset All Data
          </button>
        </div>
      </Card>
    </div>
  );
};

const MaterialsView = ({ subjects, materials, onUpload, onDelete, uniEmail }: { 
  subjects: string[], 
  materials: Material[], 
  onUpload: (m: Material) => void,
  onDelete: (id: string) => void,
  uniEmail?: string
}) => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || 'All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({ type: 'Project' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isDarkMode = document.documentElement.classList.contains('dark');

  const filteredMaterials = materials.filter(m => selectedSubject === 'All' || m.subject === selectedSubject);

  const mockEmails = [
    { id: 1, from: 'Registrar Office', subject: 'Semester Registration Confirmation', date: 'Today, 09:45 AM' },
    { id: 2, from: 'Prof. Sarah Johnson', subject: 'Feedback on Research Proposal', date: 'Yesterday' },
    { id: 3, from: 'University Library', subject: 'Overdue Book Reminder', date: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Course Materials</h3>
          <p className="text-xs font-bold text-gray-400">Organize your projects, assignments, and resources</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className={`bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg ${isDarkMode ? 'shadow-green-900/20' : 'shadow-green-100'} flex items-center gap-2 hover:bg-green-600 transition-all`}
        >
          <Plus size={16} />
          Upload Material
        </button>
      </div>

      {uniEmail && (
        <Card className={`p-6 ${isDarkMode ? 'bg-blue-900/20 border-blue-900/30' : 'bg-blue-50 border-blue-100'} relative overflow-hidden`}>
          <div className={`absolute -right-4 -top-4 w-24 h-24 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full opacity-30`} />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className={`w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg ${isDarkMode ? 'shadow-blue-900/40' : 'shadow-blue-100'}`}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h4 className={`text-sm font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>University Inbox</h4>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{uniEmail}</p>
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            {mockEmails.map(email => (
              <div key={email.id} className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-900/60 hover:bg-gray-900 border-gray-800' : 'bg-white/60 hover:bg-white border-blue-50'} rounded-xl transition-all cursor-pointer border group`}>
                <div className="flex flex-col">
                  <span className={`text-[11px] font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{email.from}</span>
                  <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{email.subject}</span>
                </div>
                <span className="text-[9px] font-black text-blue-300 uppercase">{email.date}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2.5 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors">
            Open Webmail
          </button>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setSelectedSubject('All')}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedSubject === 'All' ? (isDarkMode ? 'bg-white text-black shadow-md' : 'bg-gray-800 text-white shadow-md') : (isDarkMode ? 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50')}`}
        >
          All Subjects
        </button>
        {subjects.map(subject => (
          <button 
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSubject === subject ? 'bg-green-500 text-white shadow-md' : (isDarkMode ? 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50')}`}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.length === 0 ? (
          <div className={`col-span-full py-20 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center text-center`}>
            <div className={`w-16 h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-full flex items-center justify-center mb-4`}>
              <BookOpen size={32} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold">No materials found for this subject.</p>
            <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Start by uploading your first project!</p>
          </div>
        ) : (
          filteredMaterials.map(material => (
            <Card key={material.id} className={`p-5 group ${isDarkMode ? 'hover:border-green-900/50' : 'hover:border-green-200'} transition-all relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onDelete(material.id)} className="text-red-400 hover:text-red-600 transition-colors">
                  <Plus size={16} className="rotate-45" />
                </button>
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  material.type === 'Project' ? (isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-500') :
                  material.type === 'Assignment' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500') :
                  material.type === 'Resource' ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-500') : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500')
                }`}>
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{material.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{material.subject}</p>
                </div>
              </div>
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-3 space-y-2`}>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase">File</span>
                  <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} truncate max-w-[120px]`}>{material.fileName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Size</span>
                  <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{material.fileSize}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-[9px] font-black text-gray-300 uppercase">{material.date}</span>
                <button className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                  Download <ChevronRight size={12} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Material">
        <form onSubmit={(e) => {
          e.preventDefault();
          onUpload({
            id: Math.random().toString(),
            subject: newMaterial.subject || subjects[0] || 'General',
            title: newMaterial.title || (selectedFile?.name.split('.')[0]) || 'Untitled',
            type: newMaterial.type as any,
            date: new Date().toLocaleDateString(),
            fileName: selectedFile?.name || `${newMaterial.title?.toLowerCase().replace(/\s+/g, '_')}.pdf`,
            fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : `${(Math.random() * 5 + 1).toFixed(1)} MB`
          });
          setIsUploadModalOpen(false);
          setNewMaterial({ type: 'Project' });
          setSelectedFile(null);
        }} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Title</label>
            <input 
              type="text" 
              required
              value={newMaterial.title || ''}
              onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
              className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none`}
              placeholder="e.g. Final Project Report"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Subject</label>
              <select 
                value={newMaterial.subject || subjects[0] || 'General'}
                onChange={e => setNewMaterial({...newMaterial, subject: e.target.value})}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none appearance-none`}
              >
                {subjects.length > 0 ? (
                  subjects.map(s => <option key={s} value={s}>{s}</option>)
                ) : (
                  <option value="General">General</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Type</label>
              <select 
                value={newMaterial.type}
                onChange={e => setNewMaterial({...newMaterial, type: e.target.value as any})}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none appearance-none`}
              >
                <option value="Project">Project</option>
                <option value="Assignment">Assignment</option>
                <option value="Resource">Resource</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-800/50 hover:border-green-500/50' : 'border-gray-100 bg-gray-50/50 hover:border-green-200'} rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setNewMaterial(prev => ({ ...prev, title: prev.title || file.name.split('.')[0] }));
                }
              }}
            />
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <FileText size={24} className="text-green-500 mb-2" />
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">{selectedFile.name}</p>
                <p className="text-[8px] text-gray-400 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <Plus size={24} className="text-gray-300 mb-2 group-hover:text-green-500 transition-colors" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Click to select file</p>
                <p className="text-[8px] text-gray-300 mt-1">PDF, ZIP, DOCX up to 10MB</p>
              </>
            )}
          </div>
          <button 
            type="submit" 
            disabled={!selectedFile && !newMaterial.title}
            className={`w-full bg-green-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl ${isDarkMode ? 'shadow-green-900/20' : 'shadow-green-100'} disabled:opacity-50 transition-all`}
          >
            Upload Now
          </button>
        </form>
      </Modal>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isFirstTime, setIsFirstTime] = useState(() => !localStorage.getItem('student_profile'));
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('student_profile');
    return saved ? JSON.parse(saved) : { name: '', studentId: '', gpa: 3.0, targetGpa: 4.0, avatar: '' };
  });

  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [taskFilter, setTaskFilter] = useState('All tasks');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [isTaskSearchOpen, setIsTaskSearchOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('student_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('student_assignments');
    return saved ? JSON.parse(saved) : [];
  });
  const [exams, setExams] = useState(() => {
    const saved = localStorage.getItem('student_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });
  const [timetable, setTimetable] = useState<TimetableData>(() => {
    const saved = localStorage.getItem('student_timetable');
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('student_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('student_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: `Hello ${profile.name}! I am your AI Study Assistant. How can I help you today?` }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const aiTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const aiMessagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  useEffect(() => {
    if (aiTextareaRef.current) {
      aiTextareaRef.current.style.height = '44px'; // Base height
      const scrollHeight = aiTextareaRef.current.scrollHeight;
      if (scrollHeight > 44) {
        aiTextareaRef.current.style.height = `${Math.min(scrollHeight, 128)}px`; // Max 128px (max-h-32)
      }
    }
  }, [aiInput]);

  useEffect(() => {
    localStorage.setItem('dark_mode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAiLoading) return;

    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...aiMessages, { role: 'user', content: userMsg }].map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `You are a helpful and friendly Academic AI Assistant for a student named ${profile.name}. 
          Current Profile Context:
          - GPA: ${profile.gpa} (Target: ${profile.targetGpa})
          - Subjects: ${profile.subjects.join(', ')}
          
          You help with study tips, summarizing materials, explaining complex topics, and managing academic schedules. 
          Keep your tone encouraging, professional, and personalized to ${profile.name}'s academic goals.`
        }
      });

      const assistantMsg = response.text || "I'm sorry, I couldn't process that request.";
      setAiMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setAiMessages(prev => [...prev, { role: 'assistant', content: "Oops! Something went wrong. Please try again later." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [editingTimetableCell, setEditingTimetableCell] = useState<{ day: string, period: string, cell: TimetableCell | null } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('student_notifications');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Math Exam Tomorrow', message: "Don't forget to review Chapter 4", time: '2h ago', type: 'Exam', read: false },
      { id: '2', title: 'New Assignment', message: 'Marketing Strategy due Friday', time: '5h ago', type: 'Assignment', read: false },
      { id: '3', title: 'Welcome Back!', message: 'Your semester schedule is ready.', time: '1d ago', type: 'System', read: true },
    ];
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string, message: string, type: string } | null>(null);

  const triggerToast = (title: string, message: string, type: string) => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: Math.random().toString(),
      title,
      message,
      time: 'Just now',
      type,
      read: false
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('student_notifications', JSON.stringify(updated));
    triggerToast(title, message, type);
  };
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [gpaCalc, setGpaCalc] = useState({ credits: '', grade: '4.0' });
  const [gpaList, setGpaList] = useState<{id: string, credits: number, grade: number}[]>([]);

  const addToGpaCalc = () => {
    if (!gpaCalc.credits) return;
    setGpaList([...gpaList, { id: Math.random().toString(), credits: parseFloat(gpaCalc.credits), grade: parseFloat(gpaCalc.grade) }]);
    setGpaCalc({ credits: '', grade: '4.0' });
  };

  const calculatedGPA = useMemo(() => {
    if (gpaList.length === 0) return '0.00';
    return (gpaList.reduce((acc, curr) => acc + (curr.credits * curr.grade), 0) / gpaList.reduce((acc, curr) => acc + curr.credits, 0)).toFixed(2);
  }, [gpaList]);

  const saveNotes = (newNotes: any[]) => {
    setNotes(newNotes);
    localStorage.setItem('student_notes', JSON.stringify(newNotes));
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    let newNotes;
    if (notes.find((n: any) => n.id === editingNote.id)) {
      newNotes = notes.map((n: any) => n.id === editingNote.id ? editingNote : n);
    } else {
      const newNote = { ...editingNote, id: Math.random().toString() };
      newNotes = [...notes, newNote];
      addNotification('Note Created', `New note "${editingNote.title}" saved.`, 'System');
    }
    saveNotes(newNotes);
    setIsNoteModalOpen(false);
  };

  useEffect(() => {
    let interval: any;
    if (isTimerActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsTimerActive(false);
      // Optional: Add notification sound or alert
    }
    return () => clearInterval(interval);
  }, [isTimerActive, pomodoroTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      // Check Exams
      exams.forEach(exam => {
        if (exam.date === todayStr && exam.status === 'Upcoming') {
          const notifTitle = `Exam Today: ${exam.subject}`;
          if (!notifications.some(n => n.title === notifTitle)) {
            addNotification(notifTitle, `Your ${exam.subject} exam is scheduled for today at ${exam.time} in Room ${exam.room}.`, 'Exam');
          }
        }
      });

      // Check Assignments
      assignments.forEach(as => {
        if (as.date === todayStr && as.status === 'Pending') {
          const notifTitle = `Assignment Due: ${as.title}`;
          if (!notifications.some(n => n.title === notifTitle)) {
            addNotification(notifTitle, `"${as.title}" is due today at ${as.due}. Don't forget to submit!`, 'Assignment');
          }
        }
      });
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [exams, assignments, notifications]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setIsFirstTime(false);
    localStorage.setItem('student_profile', JSON.stringify(newProfile));
  };

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('student_tasks', JSON.stringify(newTasks));
  };

  const saveAssignments = (newAs: any[]) => {
    setAssignments(newAs);
    localStorage.setItem('student_assignments', JSON.stringify(newAs));
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    
    let newTasks;
    if (tasks.find(t => t.id === editingTask.id)) {
      newTasks = tasks.map(t => t.id === editingTask.id ? editingTask : t);
    } else {
      newTasks = [...tasks, { ...editingTask, id: Math.random().toString() }];
    }
    saveTasks(newTasks);
    if (!tasks.find(t => t.id === editingTask.id)) {
      addNotification('Task Created', `New task "${editingTask.title}" has been added to your list.`, 'System');
    }
    setIsTaskModalOpen(false);
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    let newAs;
    if (assignments.find((a: any) => a.id === editingAssignment.id)) {
      newAs = assignments.map((a: any) => a.id === editingAssignment.id ? editingAssignment : a);
    } else {
      newAs = [...assignments, { ...editingAssignment, id: Math.random().toString() }];
    }
    saveAssignments(newAs);
    if (!assignments.find((a: any) => a.id === editingAssignment.id)) {
      addNotification('Assignment Added', `"${editingAssignment.title}" is now tracked in your assignments.`, 'Assignment');
    }
    setIsAssignmentModalOpen(false);
  };

  const saveExams = (newExams: Exam[]) => {
    setExams(newExams);
    localStorage.setItem('student_exams', JSON.stringify(newExams));
  };

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    let newExams;
    if (exams.find(ex => ex.id === editingExam.id)) {
      newExams = exams.map(ex => ex.id === editingExam.id ? editingExam : ex);
    } else {
      newExams = [...exams, { ...editingExam, id: Math.random().toString() }];
    }
    saveExams(newExams);
    if (!exams.find(ex => ex.id === editingExam.id)) {
      addNotification('Exam Scheduled', `${editingExam.subject} exam added for ${editingExam.date}.`, 'Exam');
    }
    setIsExamModalOpen(false);
  };

  const resetApp = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleTimetableCellClick = useCallback((day: string, period: string) => {
    const existing = timetable[day]?.[period];
    setEditingTimetableCell({ day, period, cell: existing || { subject: '', room: '', timeRange: '', color: 'bg-blue-100' } });
    setIsTimetableModalOpen(true);
  }, [timetable]);

  const handleTimetableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimetableCell) return;

    const { day, period, cell } = editingTimetableCell;
    if (!cell) return;

    const newData = {
      ...timetable,
      [day]: {
        ...(timetable[day] || {}),
        [period]: { ...cell, duration: cell.duration || 1 }
      }
    };
    setTimetable(newData);
    localStorage.setItem('student_timetable', JSON.stringify(newData));
    setIsTimetableModalOpen(false);
  };

  const deleteTimetableCell = () => {
    if (!editingTimetableCell) return;
    const { day, period } = editingTimetableCell;
    
    const newData = { ...timetable };
    if (newData[day]) {
      delete newData[day][period];
    }
    setTimetable(newData);
    localStorage.setItem('student_timetable', JSON.stringify(newData));
    setIsTimetableModalOpen(false);
  };

  const getNextClass = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Map periods to approximate start times
    const periodStartTimes = [480, 540, 600, 660, 720, 780, 840, 900, 960]; // 8:00, 9:00, 10:00, 11:00, 12:00, 1:00, 2:00, 3:00, 4:00

    if (timetable[currentDay]) {
      for (let i = 0; i < PERIODS.length; i++) {
        const period = PERIODS[i];
        const startTime = periodStartTimes[i];
        if (startTime > currentTimeInMinutes && timetable[currentDay][period]) {
          const cell = timetable[currentDay][period]!;
          return {
            ...cell,
            startTime: startTime,
            minutesUntil: startTime - currentTimeInMinutes
          };
        }
      }
    }
    return null;
  };

  const nextClass = useMemo(() => getNextClass(), [timetable]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesFilter = taskFilter === 'All tasks' || t.status === taskFilter;
      const matchesDate = t.date === selectedDate;
      const matchesSearch = t.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) || 
                            t.description.toLowerCase().includes(taskSearchQuery.toLowerCase());
      return matchesFilter && matchesDate && matchesSearch;
    });
  }, [tasks, taskFilter, selectedDate, taskSearchQuery]);

  if (isFirstTime) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-[#f0f9f8] text-gray-800'} flex flex-col font-sans overflow-x-hidden relative transition-colors duration-500`}>
      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-white/40'} backdrop-blur-[2px] z-[100] pointer-events-none flex items-center justify-center`}
          >
            <div className={`${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-md px-8 py-4 rounded-full shadow-2xl border ${isDarkMode ? 'border-gray-800' : 'border-white'} flex items-center gap-4`}>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-800'} uppercase tracking-widest`}>Focus Mode Active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`fixed top-6 right-6 z-[300] w-80 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-2xl shadow-2xl border p-4 flex gap-4 items-start`}
          >
            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
              toast.type === 'Exam' ? (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500') :
              toast.type === 'Assignment' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500') :
              (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-500')
            }`}>
              {toast.type === 'Exam' ? <Megaphone size={20} /> : toast.type === 'Assignment' ? <FileText size={20} /> : <CheckSquare size={20} />}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-800'} leading-tight mb-1`}>{toast.title}</h4>
              <p className="text-[11px] font-bold text-gray-400 leading-snug">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-300 hover:text-gray-500 transition-colors">
              <Plus size={16} className="rotate-45" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background subtle gradient */}
      <div className={`fixed inset-0 bg-gradient-to-br ${isDarkMode ? 'from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]' : 'from-[#e0f2f1] via-[#f0f9f8] to-[#ffffff]'} -z-10 transition-colors duration-500`} />
      
      {/* Cute Decorations */}
      <Decoration icon={Plus} className={`top-20 left-10 ${isDarkMode ? 'text-pink-900/30' : 'text-pink-400'}`} />
      <Decoration icon={MessageSquare} className={`bottom-20 right-10 ${isDarkMode ? 'text-blue-900/30' : 'text-blue-400'}`} />
      <Decoration icon={StickyNote} className={`top-40 right-20 ${isDarkMode ? 'text-yellow-900/30' : 'text-yellow-400'}`} />
      <Decoration icon={Calendar} className={`bottom-40 left-20 ${isDarkMode ? 'text-green-900/30' : 'text-green-400'}`} />

      {/* AI Assistant Floating Button */}
      <div className="fixed bottom-6 right-6 z-[200]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${isAiOpen ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
        >
          {isAiOpen ? <Plus size={24} className="rotate-45" /> : <Bot size={24} />}
        </motion.button>

        <AnimatePresence>
          {isAiOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`absolute bottom-16 right-0 w-[320px] md:w-[350px] h-[500px] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[32px] shadow-2xl border flex flex-col overflow-hidden`}
            >
              {/* AI Header */}
              <div className="p-6 bg-green-500 text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm">AI Study Assistant</h3>
                  <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Powered by Gemini</p>
                </div>
              </div>

              {/* AI Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold ${
                      msg.role === 'user' 
                        ? 'bg-green-500 text-white rounded-tr-none' 
                        : (isDarkMode ? 'bg-gray-800 text-gray-200 rounded-tl-none' : 'bg-gray-100 text-gray-800 rounded-tl-none')
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-2xl rounded-tl-none flex gap-1`}>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={aiMessagesEndRef} />
              </div>

              {/* AI Input */}
              <form onSubmit={handleAiMessage} className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} flex gap-2 items-end`}>
                <textarea 
                  ref={aiTextareaRef}
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiMessage(e as any);
                    }
                  }}
                  placeholder="Ask me anything..."
                  rows={1}
                  className={`flex-1 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'} border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-green-500 outline-none resize-none max-h-32 overflow-y-auto custom-scrollbar`}
                />
                <button 
                  type="submit"
                  disabled={isAiLoading || !aiInput.trim()}
                  className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Centered Container */}
      <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-6 flex-1">
        
        {/* Header */}
        <header className="flex items-center justify-between px-2 relative z-[110]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-black text-base shadow-sm">S</div>
            <div className="flex flex-col -space-y-1">
              <span className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'} leading-none`}>Academic</span>
              <span className="font-black text-sm text-gray-400 leading-none">Elite</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Student Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-white'} backdrop-blur-sm px-3 py-2 rounded-full shadow-sm border relative`}>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-1 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full transition-colors`}
              >
                {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-400" />}
              </button>
              <div className={`w-px h-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} mx-1`} />
              <div className="relative">
                <Bell 
                  size={18} 
                  className={`cursor-pointer transition-colors ${isNotificationsOpen ? 'text-green-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')}`} 
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsMoreMenuOpen(false);
                  }}
                />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 rounded-full border border-white flex items-center justify-center">
                    <span className="text-[8px] font-black text-white">{unreadCount}</span>
                  </div>
                )}
                
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute top-10 right-0 w-80 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-2xl shadow-xl border p-4 z-50`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className={`text-[10px] font-black ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-widest`}>Notifications</h4>
                        <button 
                          onClick={() => {
                            const cleared = notifications.map(n => ({ ...n, read: true }));
                            setNotifications(cleared);
                            localStorage.setItem('student_notifications', JSON.stringify(cleared));
                          }}
                          className="text-[9px] font-black text-green-500 uppercase hover:text-green-600"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-[10px] text-gray-300 font-bold">No notifications</p>
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div 
                              key={notif.id} 
                              onClick={() => {
                                const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n);
                                setNotifications(updated);
                                localStorage.setItem('student_notifications', JSON.stringify(updated));
                                
                                if (notif.type === 'Exam') setActiveTab('Exams');
                                else if (notif.type === 'Assignment') setActiveTab('Assignments');
                                else if (notif.type === 'System') setActiveTab('Tasks');
                                
                                setIsNotificationsOpen(false);
                              }}
                              className={`flex gap-3 items-start p-2.5 rounded-xl transition-all cursor-pointer border ${notif.read ? (isDarkMode ? 'bg-gray-900 border-transparent' : 'bg-white border-transparent') : (isDarkMode ? 'bg-green-900/10 border-green-900/20' : 'bg-green-50/30 border-green-50')}`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                notif.type === 'Exam' ? 'bg-red-500' : 
                                notif.type === 'Assignment' ? 'bg-blue-500' : 'bg-green-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className={`text-[11px] font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{notif.title}</p>
                                  <span className="text-[8px] font-bold text-gray-300 whitespace-nowrap ml-2">{notif.time}</span>
                                </div>
                                <p className="text-[9px] text-gray-400 leading-tight mt-0.5">{notif.message}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className={`w-px h-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
              
              <div className="relative">
                <MoreHorizontal 
                  size={18} 
                  className={`cursor-pointer transition-colors ${isMoreMenuOpen ? 'text-green-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')}`} 
                  onClick={() => {
                    setIsMoreMenuOpen(!isMoreMenuOpen);
                    setIsNotificationsOpen(false);
                  }}
                />
                
                <AnimatePresence>
                  {isMoreMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute top-10 right-0 w-48 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-2xl shadow-xl border p-2 z-50`}
                    >
                      <button className={`w-full flex items-center gap-3 p-2.5 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} rounded-xl transition-colors text-left group`}>
                        <Settings size={14} className="text-gray-400 group-hover:text-gray-600" />
                        <span className={`text-[11px] font-black ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Quick Settings</span>
                      </button>
                      <button 
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        className={`w-full flex items-center justify-between p-2.5 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} rounded-xl transition-colors text-left group`}
                      >
                        <div className="flex items-center gap-3">
                          <Zap size={14} className={isFocusMode ? 'text-yellow-500' : 'text-gray-400'} />
                          <span className={`text-[11px] font-black ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Focus Mode</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${isFocusMode ? 'bg-green-500' : (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isFocusMode ? 'left-4.5' : 'left-0.5'}`} />
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-white'} backdrop-blur-sm pl-2 pr-5 py-1.5 rounded-full shadow-sm border group cursor-pointer`}>
              <div className={`w-8 h-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-100'} rounded-full overflow-hidden border group-hover:scale-105 transition-transform`}>
                <img src={profile.avatar || "https://picsum.photos/seed/ahmed/100/100"} alt="User" referrerPolicy="no-referrer" />
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-gray-300 leading-none mb-0.5">Student ID: {profile.studentId}</div>
                <div className={`text-[11px] font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} leading-none`}>{profile.name}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className={`w-56 ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-white/50'} backdrop-blur-md rounded-[32px] p-6 flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.03)] border h-fit sticky top-8`}>
            <div className="mb-8 px-2">
              <h2 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'} tracking-tight`}>Academic Elite</h2>
            </div>
            <nav className="space-y-1.5">
              {(['Dashboard', 'Schedule', 'Assignments', 'Tasks', 'Analytics', 'Exams', 'Notes', 'Materials'] as Tab[]).map((tab) => (
                <SidebarItem 
                  key={tab} 
                  icon={
                    tab === 'Dashboard' ? LayoutDashboard : 
                    tab === 'Schedule' ? Calendar : 
                    tab === 'Assignments' ? FileText : 
                    tab === 'Tasks' ? CheckSquare : 
                    tab === 'Analytics' ? BarChart3 : 
                    tab === 'Exams' ? Megaphone : 
                    tab === 'Materials' ? BookOpen : StickyNote
                  } 
                  label={tab} 
                  active={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                />
              ))}
            </nav>
            <div className="mt-12 pt-6 border-t border-gray-100 space-y-1.5">
              <SidebarItem icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
              <SidebarItem icon={LogOut} label="Log out" active={false} onClick={handleLogout} />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20">
            <AnimatePresence mode="wait">
              {activeTab === 'Dashboard' ? (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* GPA Card */}
                    <Card className="relative group cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className={`text-sm font-black ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} uppercase tracking-[0.2em]`}>GPA</h3>
                        <div className={`p-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg group-hover:bg-green-50 transition-colors`}>
                          <ArrowUpRight size={16} className={`text-gray-300 group-hover:text-green-500 transition-colors`} />
                        </div>
                      </div>
                      <div className="flex items-center gap-5 mb-2">
                        <span className={`text-6xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'} tracking-tighter`}>{profile.gpa.toFixed(1)}</span>
                        <div className="bg-green-500 text-white text-[9px] px-3 py-1.5 rounded-full font-black flex items-center gap-2 shadow-sm shadow-green-200">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          {profile.gpa >= 3.5 ? 'High' : profile.gpa >= 2.5 ? 'Good' : 'Average'}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">Target GPA: <span className="text-green-500 font-bold">{profile.targetGpa.toFixed(1)}</span></p>
                    </Card>

                    {/* Quick Stats Card */}
                    <Card className="relative group overflow-hidden">
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className={`w-10 h-10 ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-500'} rounded-2xl flex items-center justify-center`}>
                          <BookOpen size={20} />
                        </div>
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Quick Stats</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 relative z-10">
                        <div className={`flex justify-between items-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} p-2.5 rounded-xl border`}>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Tasks Pending</span>
                          <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{tasks.filter(t => t.status !== 'Completed').length}</p>
                        </div>
                        <div className={`flex justify-between items-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} p-2.5 rounded-xl border`}>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Exams Soon</span>
                          <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{exams.length}</p>
                        </div>
                        <div className={`flex justify-between items-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} p-2.5 rounded-xl border`}>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Assignments</span>
                          <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{assignments.length}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Next Class Card */}
                    <Card className="relative group overflow-hidden">
                      <div className={`absolute -right-4 -top-4 w-24 h-24 ${isDarkMode ? 'bg-pink-900/20' : 'bg-pink-50'} rounded-full opacity-50 group-hover:scale-110 transition-transform`} />
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className={`w-10 h-10 ${isDarkMode ? 'bg-pink-500 shadow-pink-900/20' : 'bg-pink-500 shadow-pink-100'} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                          <Calendar size={20} />
                        </div>
                        <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Next Class</span>
                      </div>
                      {nextClass ? (
                        <div className="relative z-10">
                          <h4 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-1 leading-tight`}>{nextClass.subject}</h4>
                          <div className="flex items-center gap-2 mb-4">
                            <div className={`px-2 py-1 ${isDarkMode ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-50 text-pink-500'} rounded-lg text-[9px] font-black uppercase tracking-tighter`}>Room {nextClass.room}</div>
                            <div className="text-[10px] font-bold text-gray-400">{nextClass.timeRange}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase">
                              <span className="text-gray-400">Starts in</span>
                              <span className="text-pink-500">{nextClass.minutesUntil} mins</span>
                            </div>
                            <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(0, Math.min(100, (1 - nextClass.minutesUntil / 60) * 100))}%` }}
                                className="h-full bg-pink-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center relative z-10">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No more classes today!</p>
                          <p className="text-[8px] text-gray-400 font-bold mt-1">Time to relax or study!</p>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Tasks Section (Left) */}
                    <Card className="lg:col-span-8 flex flex-col p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Tasks</h3>
                        <div className="flex items-center gap-2">
                          <div className="relative flex items-center">
                            <AnimatePresence>
                              {isTaskSearchOpen && (
                                <motion.input
                                  initial={{ width: 0, opacity: 0 }}
                                  animate={{ width: 150, opacity: 1 }}
                                  exit={{ width: 0, opacity: 0 }}
                                  type="text"
                                  value={taskSearchQuery}
                                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                                  placeholder="Search tasks..."
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-full outline-none border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} mr-2`}
                                  autoFocus
                                />
                              )}
                            </AnimatePresence>
                            <div 
                              className={`p-2 ${isDarkMode ? (isTaskSearchOpen ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-green-500 hover:text-white') : (isTaskSearchOpen ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-green-500 hover:text-white')} rounded-full cursor-pointer transition-all`}
                              onClick={() => {
                                setIsTaskSearchOpen(!isTaskSearchOpen);
                                if (isTaskSearchOpen) setTaskSearchQuery('');
                              }}
                            >
                              <Search size={14} />
                            </div>
                          </div>
                          <div className={`p-2 ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-green-500 hover:text-white' : 'bg-gray-50 text-gray-400 hover:bg-green-500 hover:text-white'} rounded-full cursor-pointer transition-all`} onClick={() => setActiveTab('Tasks')}><ArrowUpRight size={14} /></div>
                          <div className={`p-2 ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-green-500 hover:text-white' : 'bg-gray-50 text-gray-400 hover:bg-green-500 hover:text-white'} rounded-full cursor-pointer transition-all`}><MoreHorizontal size={14} /></div>
                        </div>
                      </div>

                      {/* Date Scroll */}
                      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 no-scrollbar">
                        {[...Array(14)].map((_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() + i - 3);
                          const dateStr = d.toISOString().split('T')[0];
                          const isSelected = dateStr === selectedDate;
                          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                          const dayNum = d.getDate();
                          
                          return (
                            <div 
                              key={dateStr} 
                              onClick={() => setSelectedDate(dateStr)}
                              className={`flex flex-col items-center min-w-[45px] cursor-pointer group transition-all`}
                            >
                              <span className={`text-[9px] font-bold uppercase mb-1 transition-colors ${isSelected ? 'text-green-500' : 'text-gray-300'}`}>
                                {dayName}
                              </span>
                              <span className={`text-sm font-black w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${isSelected ? 'bg-green-500 text-white shadow-lg shadow-green-100 scale-110' : (isDarkMode ? 'text-gray-500 bg-gray-800 group-hover:bg-gray-700' : 'text-gray-400 bg-gray-50 group-hover:bg-gray-100')}`}>
                                {dayNum}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 mb-6">
                        {['All tasks', 'To Do', 'Completed', 'In Progress'].map((tab) => (
                          <button 
                            key={tab} 
                            onClick={() => setTaskFilter(tab)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black transition-all ${taskFilter === tab ? (isDarkMode ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white shadow-md') : (isDarkMode ? 'bg-gray-800 text-gray-500 hover:bg-gray-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200')}`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <div 
                          onClick={() => {
                            setEditingTask({ id: '', date: '', time: '', title: '', description: '', status: 'To Do', progress: 0, avatars: 1 });
                            setIsTaskModalOpen(true);
                          }}
                          className={`flex items-center justify-between p-5 border-2 border-dashed ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50/50'} rounded-2xl mb-5 cursor-pointer transition-all group`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors`}>
                              <Plus size={16} className="text-gray-400 group-hover:text-green-500" />
                            </div>
                            <span className="text-sm font-black text-gray-300 group-hover:text-gray-500">Add New Tasks</span>
                          </div>
                        </div>
                        
                        {filteredTasks.length === 0 ? (
                          <div className={`text-center py-10 border-2 border-dashed ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} rounded-2xl`}>
                            <p className={`text-[10px] text-gray-400 font-bold`}>
                              {taskSearchQuery ? `No matches for "${taskSearchQuery}"` : `No tasks for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}!`}
                            </p>
                          </div>
                        ) : (
                          (isTaskSearchOpen ? filteredTasks : filteredTasks.slice(0, 3)).map(task => (
                            <TaskCard 
                              key={task.id} 
                              task={task} 
                              onEdit={(t) => {
                                setEditingTask(t);
                                setIsTaskModalOpen(true);
                              }} 
                            />
                          ))
                        )}
                      </div>
                    </Card>

                    {/* Right Column (Recent Materials & Notes) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                      {/* Recently Uploaded Materials */}
                      <Card className="p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-800'} uppercase tracking-widest`}>Recent Materials</h3>
                          <button onClick={() => setActiveTab('Materials')} className={`w-8 h-8 ${isDarkMode ? 'bg-gray-800 text-green-500' : 'bg-green-50 text-green-500'} rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all`}>
                            <ArrowUpRight size={16} />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {materials.length === 0 ? (
                            <div className={`text-center py-10 border-2 border-dashed ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} rounded-2xl`}>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No materials yet!</p>
                              <button onClick={() => setActiveTab('Materials')} className="text-[9px] text-green-500 font-black uppercase mt-2 hover:underline">Upload First File</button>
                            </div>
                          ) : (
                            materials.slice(-3).reverse().map(m => (
                              <div key={m.id} className={`flex items-center gap-3 p-3 ${isDarkMode ? 'bg-gray-800/50 border-transparent hover:border-green-900/50' : 'bg-gray-50 border-transparent hover:border-green-100'} rounded-xl border transition-all cursor-pointer group/item`}>
                                <div className={`w-10 h-10 ${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'} rounded-xl flex items-center justify-center shadow-sm group-hover/item:text-green-500 transition-colors`}>
                                  <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[11px] font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{m.title}</p>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{m.subject}</p>
                                </div>
                                <ChevronRight size={14} className="text-gray-200 group-hover/item:text-green-500 transition-all" />
                              </div>
                            ))
                          )}
                        </div>
                      </Card>

                      {/* Quick Notes Widget */}
                      <Card className="p-6 relative overflow-hidden shadow-sm">
                        <div className={`absolute -right-4 -top-4 w-20 h-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-full opacity-50`} />
                        <div className="flex items-center gap-2 mb-4 relative z-10">
                          <StickyNote size={18} className="text-gray-400" />
                          <h3 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-800'} uppercase tracking-widest`}>Quick Notes</h3>
                        </div>
                        <textarea 
                          placeholder="Jot down a quick thought..."
                          className={`w-full bg-transparent border-none focus:ring-0 text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} placeholder-gray-300 resize-none h-24 custom-scrollbar`}
                          defaultValue="Don't forget to check the new assignment for ERP Systems!"
                        />
                      </Card>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="other"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full"
                >
                  {activeTab === 'Schedule' && <ScheduleView data={timetable} onCellClick={handleTimetableCellClick} />}
                  {activeTab === 'Assignments' && (
                    <AssignmentsView 
                      assignments={assignments} 
                      onEdit={(as) => {
                        setEditingAssignment(as || { title: '', due: '', date: '', status: 'Pending' });
                        setIsAssignmentModalOpen(true);
                      }} 
                    />
                  )}
                  {activeTab === 'Analytics' && (
                    <AnalyticsView 
                      profile={profile} 
                      gpaCalc={gpaCalc}
                      setGpaCalc={setGpaCalc}
                      gpaList={gpaList}
                      setGpaList={setGpaList}
                      addToGpaCalc={addToGpaCalc}
                      calculatedGPA={calculatedGPA}
                    />
                  )}
                  {activeTab === 'Notes' && (
                    <NotesView 
                      notes={notes} 
                      onEdit={(n) => {
                        setEditingNote(n || { title: '', content: '' });
                        setIsNoteModalOpen(true);
                      }} 
                    />
                  )}
                  {activeTab === 'Exams' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Full Exam Schedule</h3>
                        <button 
                          onClick={() => {
                            setEditingExam({ id: '', subject: '', date: '', time: '', room: '', status: 'Upcoming' });
                            setIsExamModalOpen(true);
                          }} 
                          className="p-2 bg-red-500 text-white rounded-full hover:scale-105 transition-transform"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {exams.length === 0 ? (
                        <div className={`text-center py-20 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[40px] border-2 border-dashed`}>
                          <p className="text-gray-400 font-bold">No exams scheduled yet. Click (+) to add one!</p>
                        </div>
                      ) : (
                        exams.map(exam => (
                          <Card key={exam.id} className={`p-6 ${isDarkMode ? 'border-gray-800 hover:border-red-900/50' : 'border-gray-100 hover:border-red-200'} transition-all group`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-400'} rounded-2xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all`}>
                                  <Calendar size={24} />
                                </div>
                                <div>
                                  <h4 className={`font-black text-sm ${isDarkMode ? 'text-gray-200 group-hover:text-red-400' : 'group-hover:text-red-600'} transition-colors`}>{exam.subject}</h4>
                                  <p className="text-[10px] font-bold text-gray-400">{exam.date} • {exam.time} • Room {exam.room}</p>
                                </div>
                              </div>
                              <ArrowUpRight size={16} className="text-gray-200 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                            <div className="flex gap-2">
                              <span className="text-[8px] px-2 py-1 bg-red-500 text-white rounded-full font-black uppercase tracking-widest">{exam.status}</span>
                              <button 
                                onClick={() => { setEditingExam(exam); setIsExamModalOpen(true); }}
                                className={`text-[8px] px-2 py-1 ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'} rounded-full font-black uppercase tracking-widest transition-all`}
                              >
                                Edit Details
                              </button>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                  {activeTab === 'Tasks' && (
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Tasks Management</h3>
                        <div className="flex items-center gap-2">
                          <div className="relative flex items-center">
                            <AnimatePresence>
                              {isTaskSearchOpen && (
                                <motion.input
                                  initial={{ width: 0, opacity: 0 }}
                                  animate={{ width: 180, opacity: 1 }}
                                  exit={{ width: 0, opacity: 0 }}
                                  type="text"
                                  value={taskSearchQuery}
                                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                                  placeholder="Search tasks..."
                                  className={`text-[10px] font-bold px-4 py-2 rounded-full outline-none border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} mr-2`}
                                  autoFocus
                                />
                              )}
                            </AnimatePresence>
                            <button 
                              onClick={() => {
                                setIsTaskSearchOpen(!isTaskSearchOpen);
                                if (isTaskSearchOpen) setTaskSearchQuery('');
                              }} 
                              className={`p-2 ${isDarkMode ? (isTaskSearchOpen ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-green-500 hover:text-white') : (isTaskSearchOpen ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-green-500 hover:text-white')} rounded-full transition-all`}
                            >
                              <Search size={16} />
                            </button>
                          </div>
                          <button 
                            onClick={() => {
                              setEditingTask({ id: '', date: '', time: '', title: '', description: '', status: 'To Do', progress: 0, avatars: 1 });
                              setIsTaskModalOpen(true);
                            }} 
                            className="p-2 bg-green-500 text-white rounded-full hover:scale-105 transition-transform"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-2">
                        {['All tasks', 'To Do', 'Completed', 'In Progress'].map((tab) => (
                          <button 
                            key={tab} 
                            onClick={() => setTaskFilter(tab)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black transition-all ${taskFilter === tab ? (isDarkMode ? 'bg-white text-black shadow-md' : 'bg-[#1a1a1a] text-white shadow-md') : (isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200')}`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {filteredTasks.length === 0 ? (
                          <div className={`text-center py-20 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[40px] border-2 border-dashed`}>
                            <p className="text-gray-400 font-bold">No tasks found. Click (+) to add one!</p>
                          </div>
                        ) : (
                          filteredTasks.map(task => (
                            <TaskCard 
                              key={task.id} 
                              task={task} 
                              onEdit={(t) => {
                                setEditingTask(t);
                                setIsTaskModalOpen(true);
                              }} 
                            />
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'Materials' && (
                    <MaterialsView 
                      subjects={profile.subjects} 
                      materials={materials} 
                      uniEmail={profile.uniEmail}
                      onUpload={(m) => {
                        const newMaterials = [...materials, m];
                        setMaterials(newMaterials);
                        localStorage.setItem('student_materials', JSON.stringify(newMaterials));
                        addNotification('Material Uploaded', `New ${m.type} "${m.title}" uploaded successfully.`, 'System');
                      }}
                      onDelete={(id) => {
                        const newMaterials = materials.filter(m => m.id !== id);
                        setMaterials(newMaterials);
                        localStorage.setItem('student_materials', JSON.stringify(newMaterials));
                      }}
                    />
                  )}
                  {activeTab === 'Settings' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                      <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Settings</h3>
                      <Card className="p-8">
                        <h4 className={`font-black text-sm mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Profile Information</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Full Name</label>
                            <input 
                              type="text" 
                              value={profile.name}
                              onChange={e => {
                                const newProfile = {...profile, name: e.target.value};
                                setProfile(newProfile);
                                localStorage.setItem('student_profile', JSON.stringify(newProfile));
                              }}
                              className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 focus:outline-none`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">University Email</label>
                            <input 
                              type="email" 
                              value={profile.uniEmail || ''}
                              onChange={e => {
                                const newProfile = {...profile, uniEmail: e.target.value};
                                setProfile(newProfile);
                                localStorage.setItem('student_profile', JSON.stringify(newProfile));
                              }}
                              placeholder="e.g. student@university.edu"
                              className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 focus:outline-none`}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Current GPA</label>
                              <input 
                                type="number" 
                                step="0.1"
                                value={profile.gpa}
                                onChange={e => {
                                  const newProfile = {...profile, gpa: parseFloat(e.target.value)};
                                  setProfile(newProfile);
                                  localStorage.setItem('student_profile', JSON.stringify(newProfile));
                                }}
                                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 focus:outline-none`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Target GPA</label>
                              <input 
                                type="number" 
                                step="0.1"
                                value={profile.targetGpa}
                                onChange={e => {
                                  const newProfile = {...profile, targetGpa: parseFloat(e.target.value)};
                                  setProfile(newProfile);
                                  localStorage.setItem('student_profile', JSON.stringify(newProfile));
                                }}
                                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 focus:outline-none`}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-8">
                        <h4 className={`font-black text-sm mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Subject Management</h4>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              id="new-subject-input"
                              placeholder="Add new subject..."
                              className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-5 py-3 text-sm font-bold focus:border-green-400 focus:outline-none`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.currentTarget;
                                  if (input.value.trim()) {
                                    const newProfile = {...profile, subjects: [...profile.subjects, input.value.trim()]};
                                    setProfile(newProfile);
                                    localStorage.setItem('student_profile', JSON.stringify(newProfile));
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <button 
                              onClick={() => {
                                const input = document.getElementById('new-subject-input') as HTMLInputElement;
                                if (input.value.trim()) {
                                  const newProfile = {...profile, subjects: [...profile.subjects, input.value.trim()]};
                                  setProfile(newProfile);
                                  localStorage.setItem('student_profile', JSON.stringify(newProfile));
                                  input.value = '';
                                }
                              }}
                              className="px-6 bg-green-500 text-white rounded-2xl font-black text-xs uppercase hover:bg-green-600 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {profile.subjects.map((subject, idx) => (
                              <div key={idx} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} px-4 py-2 rounded-xl flex items-center gap-3 border`}>
                                <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{subject}</span>
                                <button 
                                  onClick={() => {
                                    const newProfile = {...profile, subjects: profile.subjects.filter((_, i) => i !== idx)};
                                    setProfile(newProfile);
                                    localStorage.setItem('student_profile', JSON.stringify(newProfile));
                                  }}
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Plus size={14} className="rotate-45" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                      <button 
                        onClick={() => {
                          localStorage.clear();
                          window.location.reload();
                        }}
                        className={`w-full py-4 ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-50 text-red-500 hover:bg-red-100'} rounded-2xl font-black text-xs uppercase tracking-widest transition-colors`}
                      >
                        Reset All Data
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* Footer Socials */}
        <footer className="flex items-center justify-center gap-6 py-4 border-t border-gray-100/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400/20 tracking-[0.5em] uppercase select-none">@AHMED</span>
          </div>
        </footer>

        {/* Modals */}
        <Modal 
          isOpen={isNoteModalOpen} 
          onClose={() => setIsNoteModalOpen(false)} 
          title={editingNote?.id ? "Edit Note" : "Add Note"}
        >
          <form onSubmit={handleNoteSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Title</label>
              <input 
                type="text" 
                value={editingNote?.title || ''}
                onChange={e => setEditingNote({...editingNote!, title: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Content</label>
              <textarea 
                value={editingNote?.content || ''}
                onChange={e => setEditingNote({...editingNote!, content: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none h-40 resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-100">Save Note</button>
              {editingNote?.id && (
                <button 
                  type="button"
                  onClick={() => {
                    saveNotes(notes.filter((n: any) => n.id !== editingNote.id));
                    setIsNoteModalOpen(false);
                  }}
                  className="px-6 bg-red-50 text-red-500 rounded-2xl font-black text-sm hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </Modal>

        <Modal 
          isOpen={isTaskModalOpen} 
          onClose={() => setIsTaskModalOpen(false)} 
          title={editingTask?.id ? "Edit Task" : "Add New Task"}
        >
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Title</label>
              <input 
                type="text" 
                value={editingTask?.title || ''}
                onChange={e => setEditingTask({...editingTask!, title: e.target.value})}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none`}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Date</label>
                <input 
                  type="date" 
                  value={editingTask?.date || ''}
                  onChange={e => setEditingTask({...editingTask!, date: e.target.value})}
                  className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none`}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Time</label>
                <input 
                  type="time" 
                  value={editingTask?.time || ''}
                  onChange={e => setEditingTask({...editingTask!, time: e.target.value})}
                  className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none`}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Description</label>
              <textarea 
                value={editingTask?.description || ''}
                onChange={e => setEditingTask({...editingTask!, description: e.target.value})}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none h-24 resize-none`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Status</label>
                <select 
                  value={editingTask?.status || 'To Do'}
                  onChange={e => setEditingTask({...editingTask!, status: e.target.value as any})}
                  className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none`}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Submitted</option>
                  <option>Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Progress (%)</label>
                <input 
                  type="number" 
                  value={editingTask?.progress || 0}
                  onChange={e => setEditingTask({...editingTask!, progress: parseInt(e.target.value)})}
                  className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none`}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className={`flex-1 bg-green-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl ${isDarkMode ? 'shadow-green-900/20' : 'shadow-green-100'}`}>Save Task</button>
              {editingTask?.id && (
                <button 
                  type="button"
                  onClick={() => {
                    setTasks(tasks.filter(t => t.id !== editingTask.id));
                    setIsTaskModalOpen(false);
                  }}
                  className={`px-6 ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-50 text-red-500 hover:bg-red-100'} rounded-2xl font-black text-sm transition-colors`}
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </Modal>

        <Modal 
          isOpen={isAssignmentModalOpen} 
          onClose={() => setIsAssignmentModalOpen(false)} 
          title={editingAssignment?.id ? "Edit Assignment" : "Add Assignment"}
        >
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Title</label>
              <input 
                type="text" 
                value={editingAssignment?.title || ''}
                onChange={e => setEditingAssignment({...editingAssignment!, title: e.target.value})}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none`}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Date</label>
                <input 
                  type="date" 
                  value={editingAssignment?.date || ''}
                  onChange={e => setEditingAssignment({...editingAssignment!, date: e.target.value})}
                  className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none`}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Due Time</label>
                <input 
                  type="time" 
                  value={editingAssignment?.due || ''}
                  onChange={e => setEditingAssignment({...editingAssignment!, due: e.target.value})}
                  className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none`}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Status</label>
              <select 
                value={editingAssignment?.status || 'Pending'}
                onChange={e => setEditingAssignment({...editingAssignment!, status: e.target.value})}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'} border-2 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none`}
              >
                <option>Pending</option>
                <option>Done</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" className={`flex-1 bg-green-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl ${isDarkMode ? 'shadow-green-900/20' : 'shadow-green-100'}`}>Save Assignment</button>
              {editingAssignment?.id && (
                <button 
                  type="button"
                  onClick={() => {
                    saveAssignments(assignments.filter((a: any) => a.id !== editingAssignment.id));
                    setIsAssignmentModalOpen(false);
                  }}
                  className={`px-6 ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-50 text-red-500 hover:bg-red-100'} rounded-2xl font-black text-sm transition-colors`}
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </Modal>

        <Modal 
          isOpen={isExamModalOpen} 
          onClose={() => setIsExamModalOpen(false)} 
          title={editingExam?.id ? "Edit Exam" : "Add Exam"}
        >
          <form onSubmit={handleExamSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Subject</label>
              <input 
                type="text" 
                value={editingExam?.subject || ''}
                onChange={e => setEditingExam({...editingExam!, subject: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Date</label>
                <input 
                  type="date" 
                  value={editingExam?.date || ''}
                  onChange={e => setEditingExam({...editingExam!, date: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Time</label>
                <input 
                  type="time" 
                  value={editingExam?.time || ''}
                  onChange={e => setEditingExam({...editingExam!, time: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Room</label>
                <input 
                  type="text" 
                  value={editingExam?.room || ''}
                  onChange={e => setEditingExam({...editingExam!, room: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Status</label>
                <select 
                  value={editingExam?.status || 'Upcoming'}
                  onChange={e => setEditingExam({...editingExam!, status: e.target.value as any})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none"
                >
                  <option>Upcoming</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-100">Save Exam</button>
              {editingExam?.id && (
                <button 
                  type="button"
                  onClick={() => {
                    saveExams(exams.filter(ex => ex.id !== editingExam.id));
                    setIsExamModalOpen(false);
                  }}
                  className="px-6 bg-red-50 text-red-500 rounded-2xl font-black text-sm hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </Modal>

        <Modal 
          isOpen={isTimetableModalOpen} 
          onClose={() => setIsTimetableModalOpen(false)} 
          title={editingTimetableCell?.cell?.subject ? "Edit Class" : "Add Class"}
        >
          <form onSubmit={handleTimetableSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Subject Name</label>
                <input 
                  type="text" 
                  value={editingTimetableCell?.cell?.subject || ''}
                  onChange={e => setEditingTimetableCell({
                    ...editingTimetableCell!,
                    cell: { ...editingTimetableCell!.cell!, subject: e.target.value }
                  })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none"
                  placeholder="e.g. Advanced Mathematics"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Room / Class</label>
                <input 
                  type="text" 
                  value={editingTimetableCell?.cell?.room || ''}
                  onChange={e => setEditingTimetableCell({
                    ...editingTimetableCell!,
                    cell: { ...editingTimetableCell!.cell!, room: e.target.value }
                  })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none"
                  placeholder="e.g. Room 302"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Time Range</label>
                <input 
                  type="text" 
                  value={editingTimetableCell?.cell?.timeRange || ''}
                  onChange={e => setEditingTimetableCell({
                    ...editingTimetableCell!,
                    cell: { ...editingTimetableCell!.cell!, timeRange: e.target.value }
                  })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none"
                  placeholder="e.g. 08:00 - 09:30"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Duration (Hours)</label>
                <select 
                  value={editingTimetableCell?.cell?.duration || 1}
                  onChange={e => setEditingTimetableCell({
                    ...editingTimetableCell!,
                    cell: { ...editingTimetableCell!.cell!, duration: parseInt(e.target.value) }
                  })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:border-green-400 outline-none appearance-none"
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Color Theme</label>
                <div className="flex gap-2">
                  {['bg-blue-100', 'bg-pink-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-orange-100'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingTimetableCell({
                        ...editingTimetableCell!,
                        cell: { ...editingTimetableCell!.cell!, color }
                      })}
                      className={`w-8 h-8 rounded-full ${color} border-2 ${editingTimetableCell?.cell?.color === color ? 'border-gray-800' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-100">Save Class</button>
              {editingTimetableCell?.cell?.subject && (
                <button 
                  type="button"
                  onClick={deleteTimetableCell}
                  className="px-6 bg-red-50 text-red-500 rounded-2xl font-black text-sm hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </Modal>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

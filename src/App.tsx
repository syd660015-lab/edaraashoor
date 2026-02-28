import React, { useState, useEffect, useMemo } from "react";
import { 
  School, 
  Users, 
  PlusCircle, 
  MinusCircle, 
  Save, 
  Search, 
  BarChart3, 
  Building2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SchoolData {
  id: number;
  name: string;
}

interface SubjectData {
  id: number;
  name: string;
}

interface StaffingData {
  school_id: number;
  subject_id: number;
  current_count: number;
  required_count: number;
  subject_name: string;
}

export default function App() {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [staffing, setStaffing] = useState<StaffingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/data");
      const data = await response.json();
      setSchools(data.schools);
      setSubjects(data.subjects);
      setStaffing(data.staffing);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleUpdate = async (schoolId: number, subjectId: number, current: number, required: number) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: schoolId,
          subject_id: subjectId,
          current_count: current,
          required_count: required
        })
      });
      if (response.ok) {
        // Update local state
        setStaffing(prev => prev.map(s => 
          (s.school_id === schoolId && s.subject_id === subjectId) 
            ? { ...s, current_count: current, required_count: required } 
            : s
        ));
        setMessage({ text: "تم حفظ البيانات بنجاح", type: "success" });
      }
    } catch (error) {
      setMessage({ text: "حدث خطأ أثناء الحفظ", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filteredSchools = useMemo(() => {
    return schools.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [schools, searchTerm]);

  const selectedSchoolStaffing = useMemo(() => {
    if (selectedSchoolId === null) return [];
    return staffing.filter(s => s.school_id === selectedSchoolId);
  }, [staffing, selectedSchoolId]);

  const selectedSchoolName = useMemo(() => {
    return schools.find(s => s.id === selectedSchoolId)?.name || "";
  }, [schools, selectedSchoolId]);

  // Calculate totals for dashboard
  const stats = useMemo(() => {
    let totalCurrent = 0;
    let totalRequired = 0;
    staffing.forEach(s => {
      totalCurrent += s.current_count;
      totalRequired += s.required_count;
    });
    const diff = totalCurrent - totalRequired;
    return {
      totalCurrent,
      totalRequired,
      diff,
      status: diff >= 0 ? "زيادة" : "عجز"
    };
  }, [staffing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans" dir="rtl">
        <div className="animate-pulse text-xl font-bold text-slate-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">إدارة العريش التعليمية</h1>
              <p className="text-xs text-slate-500 font-medium">نظام حساب العجز والزيادة - المرحلة الإعدادية</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <div className="flex flex-col items-end">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider">المبرمج</span>
              <span className="text-slate-700">د. أحمد حمدي عاشور الغول</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">إجمالي المعلمين</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalCurrent}</div>
            <div className="mt-1 text-sm text-slate-500">معلم حالي في جميع المدارس</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">الاحتياج الكلي</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalRequired}</div>
            <div className="mt-1 text-sm text-slate-500">معلم مطلوب لتغطية العجز</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm ${stats.diff >= 0 ? 'border-emerald-100' : 'border-rose-100'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stats.diff >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stats.diff >= 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">الموقف العام</span>
            </div>
            <div className={`text-3xl font-bold ${stats.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {Math.abs(stats.diff)} {stats.status}
            </div>
            <div className="mt-1 text-sm text-slate-500">صافي الفرق على مستوى الإدارة</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Schools List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="بحث عن مدرسة..."
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-h-[600px] overflow-y-auto custom-scrollbar">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  قائمة المدارس ({filteredSchools.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredSchools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => setSelectedSchoolId(school.id)}
                    className={`w-full text-right p-4 transition-colors flex items-center justify-between group ${
                      selectedSchoolId === school.id 
                        ? "bg-indigo-50 text-indigo-700" 
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span className="text-sm font-medium leading-relaxed">{school.name}</span>
                    <ChevronLeft className={`w-4 h-4 transition-transform ${selectedSchoolId === school.id ? 'translate-x-0' : 'translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Staffing Details */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedSchoolId ? (
                <motion.div
                  key={selectedSchoolId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedSchoolName}</h2>
                      <p className="text-sm text-slate-500 mt-1">توزيع هيئة التدريس حسب المادة</p>
                    </div>
                    {message && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                          message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                      </motion.div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">المادة الدراسية</th>
                          <th className="px-6 py-4 text-center">العدد الحالي</th>
                          <th className="px-6 py-4 text-center">العدد المطلوب</th>
                          <th className="px-6 py-4 text-center">العجز / الزيادة</th>
                          <th className="px-6 py-4 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedSchoolStaffing.map((item) => {
                          const diff = item.current_count - item.required_count;
                          return (
                            <tr key={item.subject_id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700">{item.subject_name}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => handleUpdate(item.school_id, item.subject_id, Math.max(0, item.current_count - 1), item.required_count)}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                  >
                                    <MinusCircle className="w-4 h-4" />
                                  </button>
                                  <span className="w-8 text-center font-mono font-medium">{item.current_count}</span>
                                  <button 
                                    onClick={() => handleUpdate(item.school_id, item.subject_id, item.current_count + 1, item.required_count)}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                  >
                                    <PlusCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => handleUpdate(item.school_id, item.subject_id, item.current_count, Math.max(0, item.required_count - 1))}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                  >
                                    <MinusCircle className="w-4 h-4" />
                                  </button>
                                  <span className="w-8 text-center font-mono font-medium">{item.required_count}</span>
                                  <button 
                                    onClick={() => handleUpdate(item.school_id, item.subject_id, item.current_count, item.required_count + 1)}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                  >
                                    <PlusCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  diff > 0 ? 'bg-emerald-100 text-emerald-700' : 
                                  diff < 0 ? 'bg-rose-100 text-rose-700' : 
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {diff > 0 ? `+${diff} زيادة` : diff < 0 ? `${diff} عجز` : 'مكتمل'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button 
                                  disabled={isSaving}
                                  className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50 transition-all disabled:opacity-50"
                                  title="حفظ التغييرات"
                                >
                                  <Save className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-2xl text-slate-400 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-600">اختر مدرسة من القائمة</h3>
                  <p className="text-sm max-w-xs mt-2">قم باختيار مدرسة من القائمة الجانبية لعرض وتعديل بيانات هيئة التدريس الخاصة بها.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} إدارة العريش التعليمية - جميع الحقوق محفوظة
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <span className="text-slate-400 font-normal">تصميم وبرمجة:</span>
            <span>د. أحمد حمدي عاشور الغول</span>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}

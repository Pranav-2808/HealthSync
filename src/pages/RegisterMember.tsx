import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { UserPlus, Heart, ShieldAlert, ChevronRight, Camera } from "lucide-react";
import { motion } from "motion/react";

const RegisterMember: React.FC = () => {
  const { addMember } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    height: "",
    weight: "",
    gender: "Male",
    bloodGroup: "A+",
    medicalHistory: "",
    feesStatus: "UNPAID",
    profileImage: "",
    additionalHealth: { bp: "", diabetes: "", other: "" },
    emergencyContact: { name: "", email: "", countryCode: "+91", phone: "" }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const phone = formData.emergencyContact.phone.trim();
      const emergencyContact = {
        ...formData.emergencyContact,
        phone: phone.startsWith("+") ? phone : `${formData.emergencyContact.countryCode}${phone}`,
      };

      await addMember({
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        feesStatus: "UNPAID",
        emergencyContact,
      } as any);
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isOld = parseInt(formData.age) > 30;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 rounded-3xl text-rose-600 mb-4 shadow-xl shadow-rose-100">
          <UserPlus size={32} />
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">New Member Registration</h1>
        <p className="text-slate-500 mt-2">Add a new member to the HealthSync monitoring system</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="glass p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-4">
            <UserPlus size={20} className="text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Personal Information</h2>
          </div>
          
          <div className="flex justify-center mb-8">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-rose-300 transition-all"
            >
              {formData.profileImage ? (
                <img src={formData.profileImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={24} className="text-slate-300 mb-2 group-hover:text-rose-400 transition-colors" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-rose-500 transition-colors">Upload Photo</span>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} required />
            <Input label="Email Address" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} required />
            <Input label="Age" type="number" value={formData.age} onChange={v => setFormData({...formData, age: v})} required />
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gender</label>
              <select 
                value={formData.gender} 
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-slate-900 outline-none"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            
            <Input label="Height (cm)" type="number" value={formData.height} onChange={v => setFormData({...formData, height: v})} required />
            <Input label="Weight (kg)" type="number" value={formData.weight} onChange={v => setFormData({...formData, weight: v})} required />
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Blood Group</label>
              <select 
                value={formData.bloodGroup} 
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-slate-900 outline-none"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Medical History</label>
            <textarea 
              value={formData.medicalHistory} 
              onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-slate-900 outline-none h-24"
              placeholder="Allergies, chronic conditions, past surgeries..."
            />
          </div>
        </section>

        {isOld && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="glass p-8 rounded-3xl space-y-6 bg-amber-50/20 border-amber-100"
          >
            <div className="flex items-center gap-2 mb-2 border-b border-amber-50 pb-4">
              <Heart size={20} className="text-amber-500" />
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Additional Health Screener (Age &gt; 30)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="BP Condition" value={formData.additionalHealth.bp} onChange={v => setFormData({...formData, additionalHealth: {...formData.additionalHealth, bp: v}})} />
              <Input label="Diabetes Status" value={formData.additionalHealth.diabetes} onChange={v => setFormData({...formData, additionalHealth: {...formData.additionalHealth, diabetes: v}})} />
              <div className="md:col-span-2">
                <Input label="Other Health Issues" value={formData.additionalHealth.other} onChange={v => setFormData({...formData, additionalHealth: {...formData.additionalHealth, other: v}})} />
              </div>
            </div>
          </motion.section>
        )}

        <section className="glass p-8 rounded-3xl space-y-6 bg-rose-50/20 border-rose-100">
          <div className="flex items-center gap-2 mb-2 border-b border-rose-50 pb-4">
            <ShieldAlert size={20} className="text-rose-600" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Emergency Contact Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Contact Name" value={formData.emergencyContact.name} onChange={v => setFormData({...formData, emergencyContact: {...formData.emergencyContact, name: v}})} required />
            <Input label="Contact email" type="email" value={formData.emergencyContact.email} onChange={v => setFormData({...formData, emergencyContact: {...formData.emergencyContact, email: v}})} required />
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Contact Phone</label>
              <div className="flex gap-2">
                <select 
                  value={formData.emergencyContact.countryCode || "+91"}
                  onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, countryCode: e.target.value}})}
                  className="px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="+91">+91 (India)</option>
                  <option value="+1">+1 (USA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (Australia)</option>
                  <option value="+86">+86 (China)</option>
                  <option value="+81">+81 (Japan)</option>
                </select>
                <input 
                  type="tel" 
                  value={formData.emergencyContact.phone} 
                  onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, phone: e.target.value}})}
                  required
                  placeholder="9876543210"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-rose-600 text-white rounded-3xl font-bold text-lg shadow-2xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Registering..." : (
            <>
              Complete Registration <ChevronRight size={24} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const Input: React.FC<{ label: string, type?: string, value: string, onChange: (v: string) => void, required?: boolean }> = ({ label, type = "text", value, onChange, required }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      required={required}
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-300"
    />
  </div>
);

export default RegisterMember;

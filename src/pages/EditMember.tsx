import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Member } from "../types";

type EditableMember = Omit<Member, "id" | "attendance" | "healthData">;

const EditMember: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, updateMember } = useApp();
  const member = members.find(m => m.id === id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EditableMember | null>(null);

  useEffect(() => {
    if (!member) return;
    // Only initialize formData once — don't overwrite user edits
    // when the health pulse updates the members array every 3 seconds.
    setFormData(prev => {
      if (prev !== null) return prev; // Already initialized
      const { id: _id, attendance: _attendance, healthData: _healthData, ...editable } = member;
      return editable;
    });
  }, [member]);

  if (!member || !formData) {
    return <div className="text-center py-20 text-slate-500">Member not found</div>;
  }

  const setField = <K extends keyof EditableMember>(key: K, value: EditableMember[K]) => {
    setFormData(prev => (prev ? { ...prev, [key]: value } : prev));
  };

  const setEmergencyField = (key: string, value: string) => {
    setFormData(prev => (
      prev
        ? {
            ...prev,
            emergencyContact: {
              name: prev.emergencyContact?.name || "",
              email: prev.emergencyContact?.email || "",
              phone: prev.emergencyContact?.phone || "",
              ...{ [key]: value },
            },
          }
        : prev
    ));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateMember(member.id, formData);
      navigate(`/member/${member.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/member/${member.id}`)}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} /> Back to Member
      </button>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Edit Member</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Update profile, health, fees, and emergency contact details.</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" value={formData.name} onChange={value => setField("name", value)} required />
          <Input label="Email" type="email" value={formData.email} onChange={value => setField("email", value)} required />
          <Input label="Age" type="number" value={String(formData.age)} onChange={value => setField("age", Number(value))} required />
          <Input label="Height (cm)" type="number" value={String(formData.height)} onChange={value => setField("height", Number(value))} required />
          <Input label="Weight (kg)" type="number" value={String(formData.weight)} onChange={value => setField("weight", Number(value))} required />
          <Select label="Gender" value={formData.gender} onChange={value => setField("gender", value)} options={["Male", "Female", "Other"]} />
          <Select label="Blood Group" value={formData.bloodGroup} onChange={value => setField("bloodGroup", value)} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
          <Select label="Fees Status" value={formData.feesStatus} onChange={value => setField("feesStatus", value as Member["feesStatus"])} options={["PAID", "UNPAID"]} />
        </section>

        <TextArea label="Medical History" value={formData.medicalHistory} onChange={value => setField("medicalHistory", value)} />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input label="Emergency Name" value={formData.emergencyContact?.name || ""} onChange={value => setEmergencyField("name", value)} required />
          <Input label="Emergency Email" type="email" value={formData.emergencyContact?.email || ""} onChange={value => setEmergencyField("email", value)} required />
          <Input label="Emergency Phone" value={formData.emergencyContact?.phone || ""} onChange={value => setEmergencyField("phone", value)} required />
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full md:w-auto px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

type InputProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

const Input: React.FC<InputProps> = ({ label, type = "text", value, onChange, required }) => (
  <label className="space-y-1.5 block">
    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">{label}</span>
    <input
      type={type}
      value={value}
      onChange={event => onChange(event.target.value)}
      required={required}
      className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all"
    />
  </label>
);

const Select: React.FC<Omit<InputProps, "type" | "required"> & { options: string[] }> = ({ label, value, onChange, options }) => (
  <label className="space-y-1.5 block">
    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">{label}</span>
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all"
    >
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>
);

const TextArea: React.FC<Omit<InputProps, "type" | "required">> = ({ label, value, onChange }) => (
  <label className="space-y-1.5 block">
    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">{label}</span>
    <textarea
      value={value}
      onChange={event => onChange(event.target.value)}
      rows={4}
      className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all resize-none"
    />
  </label>
);

export default EditMember;

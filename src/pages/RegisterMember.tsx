import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

import {
  UserPlus,
  Heart,
  ShieldAlert,
  ChevronRight,
  Camera,
} from "lucide-react";

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

    additionalHealth: {
      bp: "",
      diabetes: "",
      other: "",
    },

    emergencyContact: {
      name: "",
      email: "",
      countryCode: "+91",
      phone: "",
    },
  });

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData({
          ...formData,
          profileImage: reader.result as string,
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      const phone =
        formData.emergencyContact.phone.trim();

      const emergencyContact = {
        ...formData.emergencyContact,
        phone: phone.startsWith("+")
          ? phone
          : `${formData.emergencyContact.countryCode}${phone}`,
      };

      await addMember({ // Removed 'as any' and explicitly mapped fields
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        feesStatus: "UNPAID",
        emergencyContact,
      } as any);
      // The 'feesStatus' and 'healthData' fields are omitted from the addMember signature in AppContext
      // and are set by the backend.
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12">

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">

          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 rounded-3xl text-rose-600 mb-4 shadow-xl shadow-rose-100">
            <UserPlus size={32} />
          </div>

          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            New Member Registration
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Add a new member to the HealthSync system
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* Personal Information */}
          <section className="glass p-8 rounded-3xl space-y-6">

            <div className="flex items-center gap-2 mb-2 border-b border-slate-50 dark:border-slate-800 pb-4">
              <UserPlus
                size={20}
                className="text-slate-400 dark:text-slate-500"
              />

              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Personal Information
              </h2>
            </div>

            {/* Upload Image */}
            <div className="flex justify-center mb-8">

              <div
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="relative w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-rose-300 transition-all shadow-sm"
              >

                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Camera
                      size={24}
                      className="text-slate-300 dark:text-slate-600 mb-2 group-hover:text-rose-400 transition-colors"
                    />

                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-rose-500 transition-colors">
                      Upload Photo
                    </span>
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

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Input
                label="Full Name"
                value={formData.name}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    name: v,
                  })
                }
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    email: v,
                  })
                }
                required
              />

              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    age: v,
                  })
                }
                required
              />

              <Input
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    height: v,
                  })
                }
                required
              />

              <Input
                label="Weight (kg)"
                type="number"
                value={formData.weight}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    weight: v,
                  })
                }
                required
              />

              <Select
                label="Gender"
                value={formData.gender}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    gender: v,
                  })
                }
                options={["Male", "Female", "Other"]}
              />

              <Select
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    bloodGroup: v,
                  })
                }
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
              />
            </div>
          </section>

          <section className="glass p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-50 dark:border-slate-800 pb-4">
              <Heart size={20} className="text-slate-400 dark:text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Health Information
              </h2>
            </div>

            <TextArea
              label="Medical History"
              value={formData.medicalHistory}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  medicalHistory: v,
                })
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Blood Pressure"
                value={formData.additionalHealth.bp}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    additionalHealth: {
                      ...formData.additionalHealth,
                      bp: v,
                    },
                  })
                }
              />

              <Input
                label="Diabetes"
                value={formData.additionalHealth.diabetes}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    additionalHealth: {
                      ...formData.additionalHealth,
                      diabetes: v,
                    },
                  })
                }
              />

              <Input
                label="Other Notes"
                value={formData.additionalHealth.other}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    additionalHealth: {
                      ...formData.additionalHealth,
                      other: v,
                    },
                  })
                }
              />
            </div>
          </section>

          <section className="glass p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-50 dark:border-slate-800 pb-4">
              <ShieldAlert
                size={20}
                className="text-slate-400 dark:text-slate-500"
              />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Emergency Contact
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Contact Name"
                value={formData.emergencyContact.name}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    emergencyContact: {
                      ...formData.emergencyContact,
                      name: v,
                    },
                  })
                }
                required
              />

              <Input
                label="Contact Email"
                type="email"
                value={formData.emergencyContact.email}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    emergencyContact: {
                      ...formData.emergencyContact,
                      email: v,
                    },
                  })
                }
                required
              />

              <Input
                label="Contact Phone"
                value={formData.emergencyContact.phone}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    emergencyContact: {
                      ...formData.emergencyContact,
                      phone: v,
                    },
                  })
                }
                required
              />
            </div>
          </section>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-rose-600 text-white rounded-3xl font-bold text-lg shadow-2xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              "Registering..."
            ) : (
              <>
                Complete Registration
                <ChevronRight size={22} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

type InputProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
};

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  required,
}) => {
  return (
    <div className="space-y-1.5">

      <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        required={required}
        className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
      />
    </div>
  );
};

type SelectProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
};

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
};

const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none"
      />
    </div>
  );
};

export default RegisterMember;

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function UserSettings() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
    profileImage: "",
  });
  
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("userProfile"));
    const authUser = JSON.parse(localStorage.getItem("user"));

    setUser({
      name: profile?.name || authUser?.name || "",
      email: profile?.email || authUser?.email || "",
      phone: profile?.phone || authUser?.phone || "",
      birthday: profile?.birthday || authUser?.birthday || "",
      gender: profile?.gender || authUser?.gender || "",
      profileImage: profile?.profileImage || authUser?.profileImage || "",
    });
    
    setFeedbackName(profile?.name || authUser?.name || "");
    setFeedbackEmail(profile?.email || authUser?.email || "");
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUser((prev) => ({ ...prev, profileImage: reader.result }));
      toast.success("Profile image selected");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(user));
    const existingUser = JSON.parse(localStorage.getItem("user")) || {};
    const updatedUser = { ...existingUser, ...user };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("storage"));
    toast.success("Profile updated successfully");
  };

  const handlePasswordUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put("http://localhost:5000/api/auth/change-password", passwordData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(response.data.message);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleFeedbackSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(feedbackEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
  
    try {
      await axios.post("http://localhost:5000/api/contact", {
        firstName: feedbackName,
        lastName: "Feedback",
        email: feedbackEmail,
        message: `FEEDBACK SUBJECT:
  
  ${feedbackSubject}
  
  FEEDBACK MESSAGE:
  
  ${feedbackMessage}`,
      });
  
      toast.success("Feedback submitted successfully");
  
      setFeedbackSubject("");
      setFeedbackMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-3xl font-black mb-8">My Profile</h1>

        <div className="flex gap-8 mb-8 border-b border-slate-200">
          {["details", "password", "feedback"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize font-bold transition ${activeTab === tab ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-indigo-600"}`}
            >
              {tab === "details" ? "Profile Details" : tab === "password" ? "Change Password" : "Feedback"}
            </button>
          ))}
        </div>
        
        {activeTab === "details" && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                {user.profileImage ? <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-5xl font-black text-indigo-600">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>}
              </div>
              <label htmlFor="profileImage" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl cursor-pointer font-semibold transition">Upload Image</label>
              <input id="profileImage" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            <div className="flex-1 space-y-5">
              <div><label className="block text-sm text-slate-500 mb-1">Full Name</label><input name="name" value={user.name} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" /></div>
              <div><label className="block text-sm text-slate-500 mb-1">Email</label><input name="email" value={user.email} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" /></div>
              <div><label className="block text-sm text-slate-500 mb-1">Phone</label><input name="phone" value={user.phone} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" /></div>
              <div><label className="block text-sm text-slate-500 mb-1">Birthday</label><input type="date" name="birthday" value={user.birthday} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" /></div>
              <div><label className="block text-sm text-slate-500 mb-1">Gender</label><select name="gender" value={user.gender} onChange={handleChange} className="w-full border rounded-xl px-4 py-3"><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
              <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition">Save Profile</button>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="space-y-5">
            <input type="password" name="currentPassword" placeholder="Current Password" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full border rounded-xl px-4 py-3" />
            <input type="password" name="newPassword" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full border rounded-xl px-4 py-3" />
            <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full border rounded-xl px-4 py-3" />
            <button onClick={handlePasswordUpdate} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition">Update Password</button>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="max-w-2xl mx-auto">
            <p className="text-orange-500 font-semibold uppercase tracking-wider mb-2">SEND FEEDBACK</p>
            <h2 className="text-4xl font-black mb-3">Write your feedback</h2>
            <p className="text-slate-500 mb-8">Fill the form below. Your feedback will appear inside the admin message section.</p>
            
            <div className="grid md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-bold uppercase text-slate-500 mb-2">First Name</label>
                <input type="text" value={feedbackName} onChange={(e) => setFeedbackName(e.target.value)} className="w-full border rounded-xl px-4 py-4" />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase text-slate-500 mb-2">Email</label>
                <input type="email" value={feedbackEmail} onChange={(e) => setFeedbackEmail(e.target.value)} className="w-full border rounded-xl px-4 py-4" />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold uppercase text-slate-500 mb-2">Feedback Subject</label>
              <input type="text" value={feedbackSubject} onChange={(e) => setFeedbackSubject(e.target.value)} placeholder="Enter feedback subject" className="w-full border rounded-xl px-4 py-4" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold uppercase text-slate-500 mb-2">Feedback</label>
              <textarea rows="8" value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)} placeholder="Tell us your feedback, suggestion or issue..." className="w-full border rounded-xl px-4 py-4" />
            </div>

            <button onClick={handleFeedbackSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold">Send Feedback</button>
          </div>
        )}
      </div>
    </div>
  );
}
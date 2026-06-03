import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";

export default function UserSettings() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
    profileImage: "",
  });
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [rating, setRating] = useState("");

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
        message: `RATING:
    ${rating}
    
    FEEDBACK SUBJECT:
    
    ${feedbackSubject}
    
    FEEDBACK MESSAGE:
    
    ${feedbackMessage}`,
      });
    
      toast.success("Feedback submitted successfully");
    
      setRating("");
      setFeedbackSubject("");
      setFeedbackMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 bg-[#eef2f7] min-h-screen">
     <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100 p-10">
        <h1 className="text-3xl font-black mb-8">My Profile</h1>

        <div className="flex gap-2 mb-8 bg-slate-100 p-2 rounded-2xl w-fit">
  {["details", "feedback"].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
        activeTab === tab
          ? "bg-indigo-600 text-white shadow-md"
          : "text-slate-600 hover:bg-white"
      }`}
    >
      {tab === "details" ? "Profile Details" : "Feedback"}
    </button>
  ))}
</div>
        
        {activeTab === "details" && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
            <div className="relative group w-40 h-40">

    <div className="w-40 h-40 rounded-full overflow-hidden border-[5px] border-white bg-slate-100 shadow-2xl">
      {user.profileImage ? (
        <img
          src={user.profileImage}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-5xl font-black text-indigo-600">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </span>
        </div>
      )}
    </div>

    <div
  onClick={() => setShowPhotoMenu(!showPhotoMenu)}
  className="
    absolute inset-0
    bg-black/50
    rounded-full
    flex items-center justify-center
    text-white
    opacity-0
    group-hover:opacity-100
    cursor-pointer
    transition
  "
>
  <div className="text-center">
    <Camera size={24} className="mx-auto mb-1" />
    <span className="text-sm font-semibold">
      Change Photo
    </span>
  </div>
</div>
{showPhotoMenu && (
  <div className="absolute top-40 left-0 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 w-48">
    
    <button
      onClick={() => {
        document.getElementById("cameraInput").click();
        setShowPhotoMenu(false);
      }}
      className="w-full px-4 py-3 text-left hover:bg-slate-100"
    >
      📷 Take Photo
    </button>

    <button
      onClick={() => {
        document.getElementById("profileImage").click();
        setShowPhotoMenu(false);
      }}
      className="w-full px-4 py-3 text-left hover:bg-slate-100"
    >
      🖼 Upload Image
    </button>

  </div>
)}
    <input
      id="profileImage"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleImageUpload}
    />

  </div>
</div>
<div className="flex-1 space-y-5">
  <div>
    <label className="block text-sm font-medium text-slate-500 mb-2">
      Full Name
    </label>
    <input
      name="name"
      value={user.name}
      onChange={handleChange}
      className="
        w-full
        bg-slate-50
        border border-slate-200
        rounded-2xl
        px-5 py-3.5
        transition-all
        duration-300
        focus:border-indigo-500
        focus:ring-4
        focus:ring-indigo-100
        outline-none
      "
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-slate-500 mb-2">
      Email
    </label>
    <input
      name="email"
      value={user.email}
      onChange={handleChange}
      className="
        w-full
        bg-slate-50
        border border-slate-200
        rounded-2xl
        px-5 py-3.5
        transition-all
        duration-300
        focus:border-indigo-500
        focus:ring-4
        focus:ring-indigo-100
        outline-none
      "
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-slate-500 mb-2">
      Phone
    </label>
    <input
      name="phone"
      value={user.phone}
      onChange={handleChange}
      className="
        w-full
        bg-slate-50
        border border-slate-200
        rounded-2xl
        px-5 py-3.5
        transition-all
        duration-300
        focus:border-indigo-500
        focus:ring-4
        focus:ring-indigo-100
        outline-none
      "
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-slate-500 mb-2">
      Birthday
    </label>
    <input
      type="date"
      name="birthday"
      value={user.birthday}
      onChange={handleChange}
      className="
        w-full
        bg-slate-50
        border border-slate-200
        rounded-2xl
        px-5 py-3.5
        transition-all
        duration-300
        focus:border-indigo-500
        focus:ring-4
        focus:ring-indigo-100
        outline-none
      "
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-slate-500 mb-2">
      Gender
    </label>
    <select
      name="gender"
      value={user.gender}
      onChange={handleChange}
      className="
        w-full
        bg-slate-50
        border border-slate-200
        rounded-2xl
        px-5 py-3.5
        transition-all
        duration-300
        focus:border-indigo-500
        focus:ring-4
        focus:ring-indigo-100
        outline-none
      "
    >
      <option value="">Select Gender</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
    </select>
  </div>

  <button
    onClick={handleSave}
    className="
      bg-gradient-to-r
      from-indigo-600
      to-purple-600
      hover:from-indigo-700
      hover:to-purple-700
      text-white
      px-8 py-3
      rounded-2xl
      font-bold
      shadow-lg
      hover:shadow-xl
      hover:-translate-y-1
      transition-all
      duration-300
    "
  >
    Save Profile
  </button>
</div>
          </div>
        )}

{activeTab === "feedback" && (
  <div className="max-w-2xl mx-auto">

    <p className="text-orange-500 font-semibold uppercase tracking-wider mb-2">
      SEND FEEDBACK
    </p>

    <h2 className="text-4xl font-black mb-3">
      Write your feedback
    </h2>

    <p className="text-slate-500 mb-8">
      Fill the form below. Your feedback will appear inside the admin message section.
    </p>

    {/* Name + Email */}
    <div className="grid md:grid-cols-2 gap-5 mb-5">

      <div>
        <label className="block text-sm font-bold uppercase text-slate-500 mb-2">
          First Name
        </label>

        <input
          type="text"
          value={feedbackName}
          onChange={(e) => setFeedbackName(e.target.value)}
          className="
            w-full
            bg-slate-50
            border border-slate-200
            rounded-2xl
            px-5 py-4
            transition-all
            duration-300
            focus:border-indigo-500
            focus:ring-4
            focus:ring-indigo-100
            outline-none
          "
        />
      </div>

      <div>
        <label className="block text-sm font-bold uppercase text-slate-500 mb-2">
          Email
        </label>

        <input
          type="email"
          value={feedbackEmail}
          onChange={(e) => setFeedbackEmail(e.target.value)}
          className="
            w-full
            bg-slate-50
            border border-slate-200
            rounded-2xl
            px-5 py-4
            transition-all
            duration-300
            focus:border-indigo-500
            focus:ring-4
            focus:ring-indigo-100
            outline-none
          "
        />
      </div>

    </div>

    {/* Subject */}
    <div className="mb-5">

      <label className="block text-sm font-bold uppercase text-slate-500 mb-2">
        Feedback Subject
      </label>

      <input
        type="text"
        value={feedbackSubject}
        onChange={(e) => setFeedbackSubject(e.target.value)}
        placeholder="Enter feedback subject"
        className="
          w-full
          bg-slate-50
          border border-slate-200
          rounded-2xl
          px-5 py-4
          transition-all
          duration-300
          focus:border-indigo-500
          focus:ring-4
          focus:ring-indigo-100
          outline-none
        "
      />

    </div>

    {/* Feedback Message */}
    <div className="mb-6">

      <label className="block text-sm font-bold uppercase text-slate-500 mb-2">
        Feedback
      </label>

      <textarea
        rows="8"
        value={feedbackMessage}
        onChange={(e) => setFeedbackMessage(e.target.value)}
        placeholder="Tell us your feedback, suggestion or issue..."
        className="
          w-full
          bg-slate-50
          border border-slate-200
          rounded-2xl
          px-5 py-4
          resize-none
          transition-all
          duration-300
          focus:border-indigo-500
          focus:ring-4
          focus:ring-indigo-100
          outline-none
        "
      />

    </div>
{/* Rating */}
<div className="mb-6">

<label className="block text-sm font-bold uppercase text-slate-500 mb-3">
</label>

<div className="grid grid-cols-5 gap-3">

  {[
    { emoji: "😡", value: "Terrible" },
    { emoji: "😕", value: "Poor" },
    { emoji: "😐", value: "Average" },
    { emoji: "😊", value: "Good" },
    { emoji: "🤩", value: "Excellent" },
  ].map((item) => (
    <button
      key={item.value}
      type="button"
      onClick={() => setRating(item.value)}
      className={`bg-white border border-slate-200 rounded-2xl p-4 text-4xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        rating === item.value
          ? "ring-4 ring-indigo-500 shadow-lg"
          : ""
      }`}
    >
      {item.emoji}
    </button>
  ))}

</div>

{rating && (
  <p className="mt-3 text-indigo-600 font-semibold">
    Selected: {rating}
  </p>
)}

</div>
    {/* Submit */}
    <button
      onClick={handleFeedbackSubmit}
      className="
        w-full
        bg-gradient-to-r
        from-indigo-600
        to-purple-600
        hover:from-indigo-700
        hover:to-purple-700
        text-white
        py-4
        rounded-2xl
        font-bold
        shadow-lg
        hover:shadow-xl
        transition-all
        duration-300
      "
    >
      Send Feedback
    </button>

  </div>
)}

      </div>
    </div>
  );
}
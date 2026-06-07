import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  MessageSquare,
  ShieldCheck,
  Lock,
  X,
} from "lucide-react";

export default function UserSettings() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthday: "",
    gender: "",
    profileImage: "",
  });

  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [rating, setRating] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const safeParseLocalStorage = (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  const syncProfileState = (profileData = {}) => {
    const safeUser = {
      name: profileData?.name || "",
      email: profileData?.email || "",
      phone: profileData?.phone || "",
      address: profileData?.address || "",
      birthday: profileData?.birthday || "",
      gender: profileData?.gender || "",
      profileImage: profileData?.profileImage || "",
    };

    setUser(safeUser);
    setFeedbackName(safeUser.name);
    setFeedbackEmail(safeUser.email);

    localStorage.setItem("userProfile", JSON.stringify(safeUser));

    const existingUser = safeParseLocalStorage("user") || {};
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...existingUser,
        ...safeUser,
      })
    );

    window.dispatchEvent(new Event("storage"));
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    const profile = safeParseLocalStorage("userProfile");
    const authUser = safeParseLocalStorage("user");

    const fallbackProfile = {
      name: profile?.name || authUser?.name || "",
      email: profile?.email || authUser?.email || "",
      phone: profile?.phone || authUser?.phone || "",
      address: profile?.address || authUser?.address || "",
      birthday: profile?.birthday || authUser?.birthday || "",
      gender: profile?.gender || authUser?.gender || "",
      profileImage: profile?.profileImage || authUser?.profileImage || "",
    };

    if (!token) {
      syncProfileState(fallbackProfile);
      setLoadingProfile(false);
      return;
    }

    try {
      setLoadingProfile(true);

      const response = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success && response.data?.user) {
        syncProfileState(response.data.user);
      } else {
        syncProfileState(fallbackProfile);
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      syncProfileState(fallbackProfile);
    } finally {
      setLoadingProfile(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
    setCameraLoading(false);
  };

  const startCamera = async () => {
    try {
      setShowPhotoMenu(false);
      setCameraLoading(true);
      setCameraOpen(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Camera is not supported in this browser.");
        setCameraOpen(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (error) {
      console.error("Camera open error:", error);
      toast.error("Camera permission denied or camera not available.");
      setCameraOpen(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) {
      toast.error("Camera is not ready yet.");
      return;
    }

    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      toast.error("Camera is still loading. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.85);

    setUser((prev) => ({
      ...prev,
      profileImage: imageData,
    }));

    stopCamera();
    toast.success("Photo captured. Click Save Profile to store it.");
  };

  useEffect(() => {
    fetchProfile();

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const openHiddenFileInput = (inputId) => {
    const input = document.getElementById(inputId);

    if (!input) {
      toast.error("Image input not found. Please refresh and try again.");
      return;
    }

    input.click();
    setShowPhotoMenu(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 1800 * 1024) {
      toast.error("Profile image is too large. Please choose an image below 1.8MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setUser((prev) => ({
        ...prev,
        profileImage: reader.result,
      }));

      toast.success("Profile image selected");
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to update profile.");
      return;
    }

    if (!user.name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          name: user.name,
          phone: user.phone,
          address: user.address,
          birthday: user.birthday,
          gender: user.gender,
          profileImage: user.profileImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success && response.data?.user) {
        syncProfileState(response.data.user);
      } else {
        syncProfileState(user);
      }

      toast.success(response.data?.message || "Profile updated successfully");
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first.");
        return;
      }

      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        toast.error("All password fields are required.");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
      toast.error(error.response?.data?.error || "Failed to submit feedback");
    }
  };

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-700 font-semibold";

  const labelClass = "block text-sm font-bold text-slate-500 mb-2";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 bg-[#eef2f7] min-h-screen">
      <div className="relative overflow-hidden bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100 p-6 sm:p-10">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-70" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                <User className="w-4 h-4" />
                Customer Profile
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-950">
                My Profile
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Update your phone, address, profile picture, and personal details.
              </p>
            </div>

            <div className="bg-slate-950 text-white rounded-3xl px-5 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Signed in as
              </p>

              <p className="font-black mt-1 truncate max-w-xs">
                {user.email || "Customer"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-2 rounded-2xl w-fit">
            {[
              { key: "details", label: "Profile Details", icon: User },
              { key: "security", label: "Security", icon: ShieldCheck },
              { key: "feedback", label: "Feedback", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all duration-300 ${
                    activeTab === tab.key
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {loadingProfile ? (
            <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-12 flex items-center justify-center">
              <div className="w-9 h-9 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />

              <p className="ml-3 text-sm font-black text-gray-500">
                Loading profile...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "details" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 flex flex-col items-center text-center">
                      <div className="relative group w-40 h-40">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-[5px] border-white bg-slate-100 shadow-2xl">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                              <span className="text-5xl font-black text-indigo-600">
                                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition"
                        >
                          <div className="text-center">
                            <Camera size={24} className="mx-auto mb-1" />
                            <span className="text-sm font-semibold">
                              Change Photo
                            </span>
                          </div>
                        </button>

                        {showPhotoMenu && (
                          <div className="absolute top-40 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 w-48">
                            <button
                              type="button"
                              onClick={startCamera}
                              className="w-full px-4 py-3 text-left hover:bg-slate-100 text-sm font-bold"
                            >
                              📷 Take Photo
                            </button>

                            <button
                              type="button"
                              onClick={() => openHiddenFileInput("profileImage")}
                              className="w-full px-4 py-3 text-left hover:bg-slate-100 text-sm font-bold"
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

                      <h2 className="text-xl font-black text-slate-950 mt-5">
                        {user.name || "Customer"}
                      </h2>

                      <p className="text-sm text-slate-500 mt-1 break-all">
                        {user.email || "No email"}
                      </p>

                      <div className="mt-5 w-full space-y-3 text-left">
                        <div className="bg-white rounded-2xl border border-slate-100 p-4">
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Phone
                          </p>

                          <p className="font-black text-slate-800 mt-1">
                            {user.phone || "Not added yet"}
                          </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-4">
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Address
                          </p>

                          <p className="font-black text-slate-800 mt-1">
                            {user.address || "Not added yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Full Name</label>

                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                          <input
                            name="name"
                            value={user.name}
                            onChange={handleChange}
                            className={`${inputClass} pl-12`}
                            placeholder="Enter full name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Email</label>

                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                          <input
                            name="email"
                            value={user.email}
                            readOnly
                            className={`${inputClass} pl-12 bg-slate-100 cursor-not-allowed text-slate-500`}
                            placeholder="Email"
                          />
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                          Email is used for login and cannot be changed here.
                        </p>
                      </div>

                      <div>
                        <label className={labelClass}>Phone Number</label>

                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                          <input
                            name="phone"
                            value={user.phone}
                            onChange={handleChange}
                            className={`${inputClass} pl-12`}
                            placeholder="Example: 98XXXXXXXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Birthday</label>

                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                          <input
                            type="date"
                            name="birthday"
                            value={user.birthday}
                            onChange={handleChange}
                            className={`${inputClass} pl-12`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Gender</label>

                        <select
                          name="gender"
                          value={user.gender}
                          onChange={handleChange}
                          className={inputClass}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelClass}>Address</label>

                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />

                          <textarea
                            name="address"
                            value={user.address}
                            onChange={handleChange}
                            rows="4"
                            className={`${inputClass} pl-12 resize-none`}
                            placeholder="Enter your full address"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={savingProfile}
                      className="mt-6 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-300 disabled:to-purple-300 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Save className="w-5 h-5" />
                      {savingProfile ? "Saving Profile..." : "Save Profile"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="max-w-2xl">
                  <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Lock className="w-6 h-6" />
                      </div>

                      <div>
                        <h2 className="text-xl font-black text-slate-950">
                          Change Password
                        </h2>

                        <p className="text-sm text-slate-500">
                          Update your account password securely.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className={labelClass}>Current Password</label>

                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>New Password</label>

                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Confirm Password</label>

                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={inputClass}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handlePasswordUpdate}
                        className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black transition-all"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        Update Password
                      </button>
                    </div>
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
                    Fill the form below. Your feedback will appear inside the admin
                    message section.
                  </p>

                  <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-bold uppercase text-slate-500 mb-2">
                        First Name
                      </label>

                      <input
                        type="text"
                        value={feedbackName}
                        onChange={(e) => setFeedbackName(e.target.value)}
                        className={inputClass}
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
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-bold uppercase text-slate-500 mb-2">
                      Feedback Subject
                    </label>

                    <input
                      type="text"
                      value={feedbackSubject}
                      onChange={(e) => setFeedbackSubject(e.target.value)}
                      placeholder="Enter feedback subject"
                      className={inputClass}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold uppercase text-slate-500 mb-2">
                      Feedback
                    </label>

                    <textarea
                      rows="8"
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Tell us your feedback, suggestion or issue..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div className="mb-6">
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
                          className={`bg-white border border-slate-200 rounded-2xl p-4 text-3xl sm:text-4xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
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

                  <button
                    type="button"
                    onClick={handleFeedbackSubmit}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Send Feedback
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-950 text-lg">Take Photo</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Allow camera permission, then capture your profile photo.
                </p>
              </div>

              <button
                type="button"
                onClick={stopCamera}
                className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="w-full aspect-square rounded-[2rem] overflow-hidden bg-slate-950 flex items-center justify-center">
                {cameraLoading ? (
                  <p className="text-white font-black">Opening camera...</p>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3 font-black"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={cameraLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl py-3 font-black"
                >
                  Capture
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-4 text-center">
                After capture, click Save Profile to store the photo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
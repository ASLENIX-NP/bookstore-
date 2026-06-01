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

const [passwordData, setPasswordData] = useState({
currentPassword: "",
newPassword: "",
confirmPassword: "",
});

useEffect(() => {
const profile =
JSON.parse(localStorage.getItem("userProfile"));

const authUser =
  JSON.parse(localStorage.getItem("user"));

setUser({
  name: profile?.name || authUser?.name || "",
  email: profile?.email || authUser?.email || "",
  phone: profile?.phone || authUser?.phone || "",
  birthday: profile?.birthday || authUser?.birthday || "",
  gender: profile?.gender || authUser?.gender || "",
  profileImage:
    profile?.profileImage ||
    authUser?.profileImage ||
    "",
});

}, []);

const handleChange = (e) => {
setUser({
...user,
[e.target.name]: e.target.value,
});
};

const handlePasswordChange = (e) => {
setPasswordData({
...passwordData,
[e.target.name]: e.target.value,
});
};

const handleImageUpload = (e) => {
const file = e.target.files[0];

if (!file) return;

const reader = new FileReader();

reader.onloadend = () => {
  setUser((prev) => ({
    ...prev,
    profileImage: reader.result,
  }));

  toast.success("Profile image selected");
};

reader.readAsDataURL(file);

};

const handleSave = () => {
localStorage.setItem(
"userProfile",
JSON.stringify(user)
);
const existingUser =
  JSON.parse(localStorage.getItem("user")) || {};

const updatedUser = {
  ...existingUser,
  name: user.name,
  email: user.email,
  phone: user.phone,
  birthday: user.birthday,
  gender: user.gender,
  profileImage: user.profileImage,
};

localStorage.setItem(
  "user",
  JSON.stringify(updatedUser)
);

window.dispatchEvent(new Event("storage"));

toast.success("Profile updated successfully");

};

const handlePasswordUpdate = async () => {
try {
const token = localStorage.getItem("token");
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
  toast.error(
    error.response?.data?.message ||
      "Failed to change password"
  );
}

};

return ( <div className="max-w-5xl mx-auto px-4 py-10"> <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"> <h1 className="text-3xl font-black mb-8">
My Profile </h1>

    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex flex-col items-center">
        <div className="w-36 h-36 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl font-black text-indigo-600">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </span>
          )}
        </div>

        <label
          htmlFor="profileImage"
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl cursor-pointer font-semibold transition"
        >
          Upload Image
        </label>

        <input
          id="profileImage"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <div className="flex-1 space-y-5">
        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Full Name
          </label>

          <input
            name="name"
            value={user.name}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Email
          </label>

          <input
            name="email"
            value={user.email}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Phone
          </label>

          <input
            name="phone"
            value={user.phone}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Birthday
          </label>

          <input
            type="date"
            name="birthday"
            value={user.birthday}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Gender
          </label>

          <select
            name="gender"
            value={user.gender}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="">
              Select Gender
            </option>
            <option value="Male">
              Male
            </option>
            <option value="Female">
              Female
            </option>
            <option value="Other">
              Other
            </option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition"
        >
          Save Profile
        </button>

        <hr className="my-8" />

        <h2 className="text-2xl font-bold">
          Change Password
        </h2>

        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={passwordData.currentPassword}
          onChange={handlePasswordChange}
          className="w-full border rounded-xl px-4 py-3"
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={passwordData.newPassword}
          onChange={handlePasswordChange}
          className="w-full border rounded-xl px-4 py-3"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={passwordData.confirmPassword}
          onChange={handlePasswordChange}
          className="w-full border rounded-xl px-4 py-3"
        />

        <button
          onClick={handlePasswordUpdate}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition"
        >
          Update Password
        </button>
      </div>
    </div>
  </div>
</div>
);
}

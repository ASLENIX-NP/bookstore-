import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserRound,
  AlertCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

const getInitial = (name, email) => {
  const source = String(name || email || "U").trim();
  return source.charAt(0).toUpperCase() || "U";
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get("https://bookstore-f3if.onrender.com/api/users");

      const usersData = Array.isArray(response.data)
        ? response.data
        : response.data?.users || response.data?.data || [];

      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setErrorMessage(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load users. Please make sure backend is running."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return safeUsers;

    return safeUsers.filter((user) => {
      return [
        user?.name,
        user?.email,
        user?.phone,
        user?.address,
        user?.role,
        user?.gender,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [safeUsers, searchTerm]);

  const summary = useMemo(() => {
    return {
      total: safeUsers.length,
      withPhone: safeUsers.filter((user) => String(user?.phone || "").trim())
        .length,
      withAddress: safeUsers.filter((user) =>
        String(user?.address || "").trim()
      ).length,
      withPhoto: safeUsers.filter((user) =>
        String(user?.profileImage || "").trim()
      ).length,
    };
  }, [safeUsers]);

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            {title}
          </p>

          <p className={`text-3xl font-black mt-2 ${colorClass}`}>{value}</p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 sm:p-8 shadow-xl shadow-slate-200">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-indigo-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <Users className="w-4 h-4" />
              User Management
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Registered Customers
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
              Search users by name, email, phone number, or address and view
              profile details saved by customers.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 disabled:bg-white/70 text-slate-950 px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh Users"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={summary.total}
          icon={Users}
          colorClass="text-indigo-600"
        />

        <StatCard
          title="Phone Added"
          value={summary.withPhone}
          icon={Phone}
          colorClass="text-green-600"
        />

        <StatCard
          title="Address Added"
          value={summary.withAddress}
          icon={MapPin}
          colorClass="text-orange-600"
        />

        <StatCard
          title="Photo Added"
          value={summary.withPhoto}
          icon={UserRound}
          colorClass="text-purple-600"
        />
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 border border-red-100 p-5 rounded-[2rem] text-sm font-bold flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

          <div>
            <p className="font-black">Users Error</p>
            <p className="text-xs mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-3">
              <Search className="w-4 h-4" />
              Search Customers
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              User Directory
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Showing {filteredUsers.length} of {safeUsers.length} registered
              accounts.
            </p>
          </div>

          <div className="relative w-full lg:w-[420px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, address..."
              className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-500 font-black">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />

          <p className="text-gray-500 font-black">
            {safeUsers.length === 0
              ? "No users found."
              : "No users match your search."}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Try searching by another name, email, phone number, or address.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredUsers.map((user) => {
            const userId = user._id || user.id;
            const name = user.name || "Unnamed User";
            const email = user.email || "No email";
            const phone = user.phone || "";
            const address = user.address || "";
            const profileImage = user.profileImage || "";
            const role = user.role || "customer";

            return (
              <div
                key={userId || email}
                className="group bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] overflow-hidden bg-indigo-50 border-4 border-white shadow-lg ring-1 ring-gray-100">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                            <span className="text-4xl font-black">
                              {getInitial(name, email)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-xl font-black text-slate-950 truncate">
                            {name}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1 break-all">
                            {email}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider w-fit">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {role}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Mail className="w-4 h-4" />
                            <p className="text-[11px] font-black uppercase tracking-widest">
                              Email
                            </p>
                          </div>

                          <p className="text-sm font-black text-slate-800 mt-2 break-all">
                            {email}
                          </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Phone className="w-4 h-4" />
                            <p className="text-[11px] font-black uppercase tracking-widest">
                              Phone
                            </p>
                          </div>

                          <p
                            className={`text-sm font-black mt-2 ${
                              phone ? "text-slate-800" : "text-slate-400"
                            }`}
                          >
                            {phone || "Not added yet"}
                          </p>
                        </div>

                        <div className="md:col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <p className="text-[11px] font-black uppercase tracking-widest">
                              Address
                            </p>
                          </div>

                          <p
                            className={`text-sm font-black mt-2 leading-relaxed ${
                              address ? "text-slate-800" : "text-slate-400"
                            }`}
                          >
                            {address || "Not added yet"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3">
                          <div className="flex items-center gap-2 text-indigo-500">
                            <Calendar className="w-4 h-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">
                              Joined
                            </p>
                          </div>

                          <p className="text-xs font-black text-indigo-700 mt-1">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-orange-50 border border-orange-100 px-4 py-3">
                          <div className="flex items-center gap-2 text-orange-500">
                            <Clock className="w-4 h-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">
                              Last Seen
                            </p>
                          </div>

                          <p className="text-xs font-black text-orange-700 mt-1">
                            {formatDateTime(user.lastSeen)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 border border-purple-100 px-4 py-3">
                          <div className="flex items-center gap-2 text-purple-500">
                            <UserRound className="w-4 h-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">
                              Gender
                            </p>
                          </div>

                          <p className="text-xs font-black text-purple-700 mt-1">
                            {user.gender || "N/A"}
                          </p>
                        </div>
                      </div>

                      {user.birthday && (
                        <div className="mt-4 rounded-2xl bg-slate-950 text-white px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Birthday
                          </p>

                          <p className="text-sm font-black mt-1">
                            {formatDate(user.birthday)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
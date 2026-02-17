"use client";

import { useEffect, useState } from "react";
import { AdminUserView, fetchAllUsersWithData } from "@/lib/adminService";
import { Search, Download, Shield, User as UserIcon } from "lucide-react";
import * as XLSX from 'xlsx';

export default function UserManagement() {
    const [users, setUsers] = useState<AdminUserView[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchAllUsersWithData();
        setUsers(data);
        setLoading(false);
    };

    const handleExport = () => {
        // Flatten data for export
        const exportData = users.map(u => ({
            Name: u.name,
            Email: u.email,
            Role: u.role || 'user',
            Mobile: u.mobile || 'N/A',
            Department: u.department || 'N/A',
            Semester: u.semester || 'N/A',
            House: u.house || 'N/A',
            RegistrationCount: u.registrationCount,
            Events: u.events.join(", "),
            ChestNumbers: u.chestNumbers.join(", ")
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(wb, "jhalak_users_export.xlsx");
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.mobile && user.mobile.includes(searchTerm));
        
        const matchesRole = roleFilter === 'all' || (user.role || 'user') === roleFilter;

        return matchesSearch && matchesRole;
    });

    if (loading) return <div className="text-white text-center py-20 animate-pulse font-unbounded">LOADING USER DATA...</div>;

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or mobile..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#FFD700] focus:outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="admin">Admins</option>
                    </select>

                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-[#FFD700] text-black font-bold px-4 py-2 rounded-lg hover:bg-white transition-colors"
                    >
                        <Download size={18} />
                        <span className="hidden md:inline">Export Excel</span>
                        <span className="md:hidden">Export</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Details</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4 text-center">Events</th>
                            <th className="p-4 text-right">Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-sm">
                        {filteredUsers.map(user => (
                            <tr key={user.uid} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#FFD700] font-bold overflow-hidden">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-[#FFD700] transition-colors">{user.name}</p>
                                            <p className="text-gray-500 text-xs">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><span className="w-1 h-1 bg-[#FFD700] rounded-full"></span> {user.department || "No Dept"}</span>
                                        <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> {user.semester || "No Sem"}</span>
                                        <span className="flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span> {user.house || "No House"}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300 font-mono text-xs">
                                    {user.mobile || "-"}
                                </td>
                                <td className="p-4 text-center">
                                    <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-white">
                                        {user.registrationCount}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {user.role === 'admin' ? (
                                        <span className="inline-flex items-center gap-1 text-[#FFD700] bg-[#FFD700]/10 px-2 py-1 rounded text-xs font-bold border border-[#FFD700]/20">
                                            <Shield size={12} /> ADMIN
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-gray-500 bg-white/5 px-2 py-1 rounded text-xs font-medium border border-white/5">
                                            <UserIcon size={12} /> USER
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredUsers.length === 0 && (
                    <div className="p-10 text-center text-gray-500">
                        No users found matching your search.
                    </div>
                )}
            </div>
            
            <div className="text-right text-xs text-gray-600">
                Total Users: {users.length}
            </div>
        </div>
    );
}

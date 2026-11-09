import React, { useEffect, useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { UserData } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { useMutation } from '../../hooks/useMutation';

export const UserManage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'STUDENT' | 'TEACHER' | 'CENTER_MANAGER'>('STUDENT');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsersList();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch user list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Standard Pessimistic User Invite / Creation Mutation
  const createUserMutation = useMutation(adminService.createUser, {
    successTitle: 'Thêm tài khoản thành công',
    successMessage: (user) =>
      `Tài khoản ${user.name} (${user.role}) đã được lưu trữ vào cơ sở dữ liệu! Mật khẩu mặc định: 030308`,
    errorTitle: 'Không thể thêm người dùng',
    onSuccess: (newUser) => {
      // Pessimistic update: Only update UI after backend confirms 201 Created
      setUsers((prev) => [newUser, ...prev]);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
    },
  });

  // Standard Pessimistic Toggle User Status Mutation
  const toggleStatusMutation = useMutation(
    async ({ userId, nextStatus }: { userId: string; nextStatus: boolean }) => {
      return await adminService.toggleUserStatus(userId, nextStatus);
    },
    {
      successTitle: 'Cập nhật trạng thái thành công',
      successMessage: (_, vars) =>
        `Tài khoản đã được ${vars.nextStatus ? 'kích hoạt' : 'khóa'} trên cơ sở dữ liệu hệ thống.`,
      errorTitle: 'Lỗi cập nhật trạng thái',
      onSuccess: (_, vars) => {
        // Pessimistic update: only updates UI state when server confirms
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === vars.userId) {
              return {
                ...u,
                status: vars.nextStatus ? 'ACTIVE' : 'INACTIVE',
              };
            }
            return u;
          })
        );
      },
    }
  );

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus !== 'ACTIVE';
    await toggleStatusMutation.mutate({ userId, nextStatus });
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    await createUserMutation.mutate({
      name: inviteName.trim(),
      fullName: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quản trị Người dùng & Phân quyền
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Danh sách toàn bộ Học viên, Giảng viên và Quản trị viên cơ sở trên toàn hệ thống
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm người dùng mới
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Tìm theo tên hoặc email người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'STUDENT', label: 'Học viên' },
            { id: 'TEACHER', label: 'Giảng viên' },
            { id: 'CENTER_MANAGER', label: 'Quản lý cơ sở' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRoleFilter(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                roleFilter === item.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader text="Đang tải danh sách người dùng..." />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">Người dùng</th>
                  <th className="py-3 px-6">Vai trò</th>
                  <th className="py-3 px-6">Khóa học tham gia</th>
                  <th className="py-3 px-6">Ngày tham gia</th>
                  <th className="py-3 px-6">Trạng thái</th>
                  <th className="py-3 px-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        user.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-500/30'
                          : user.role === 'CENTER_MANAGER'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : user.role === 'TEACHER'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                      {user.enrolledCoursesCount} khóa
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500">
                      {user.createdAt}
                    </td>

                    <td className="py-4 px-6">
                      {user.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3 text-rose-500" /> Tạm khóa
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button
                        variant={user.status === 'ACTIVE' ? 'outline' : 'secondary'}
                        size="sm"
                        disabled={toggleStatusMutation.isLoading}
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className="text-xs"
                      >
                        {user.status === 'ACTIVE' ? (
                          <>
                            <Lock className="w-3 h-3 mr-1 text-slate-400" /> Khóa
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3 mr-1 text-emerald-500" /> Mở khóa
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Thêm Người Dùng Vào Hệ Thống"
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <Input
            label="Họ và tên"
            placeholder="VD: Nguyễn Văn A"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
          />

          <Input
            label="Địa chỉ Email"
            type="email"
            placeholder="VD: user@englishflow.vn"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Phân quyền tài khoản
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="STUDENT">Học viên (Student)</option>
              <option value="TEACHER">Giáo viên (Teacher)</option>
              <option value="CENTER_MANAGER">Quản lý cơ sở (Center Manager)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsInviteModalOpen(false)} disabled={createUserMutation.isLoading}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={createUserMutation.isLoading} disabled={createUserMutation.isLoading}>
              Kích hoạt tài khoản
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

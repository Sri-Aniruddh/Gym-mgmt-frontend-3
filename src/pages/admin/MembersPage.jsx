import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Eye,
  Edit2,
  Power,
  Send,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

const memberSchema = z.object({
  name: z.string().min(2, 'Name is required (at least 2 chars)'),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits'),
  address: z.string().min(3, 'Address is required'),
  planId: z.string().min(1, 'Please select a membership plan'),
  startDate: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).default('PREFER_NOT_TO_SAY'),
  medicalNotes: z.string().optional(),
  additionalNotes: z.string().optional(),
  initialPaymentAmount: z.number().optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'NET_BANKING', 'OTHER']).default('CASH')
});

const editMemberSchema = z.object({
  name: z.string().min(2, 'Name is required (at least 2 chars)'),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']),
  address: z.string().min(3, 'Address is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  dateOfBirth: z.string().optional().nullable(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalNotes: z.string().optional(),
  additionalNotes: z.string().optional()
});

export const MembersPage = () => {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [statusTogglingId, setStatusTogglingId] = useState(null);

  // Detail Modal Tab
  const [detailTab, setDetailTab] = useState('profile');
  const [detailHistory, setDetailHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Image Upload state for Add Member
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  // Image Upload state for Edit Member
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);

  // Form for Adding Member
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      gender: 'PREFER_NOT_TO_SAY',
      paymentMethod: 'CASH',
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  // Form for Editing Member
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: isSubmittingEdit }
  } = useForm({
    resolver: zodResolver(editMemberSchema)
  });

  const selectedPlanId = watch('planId');
  const watchStartDate = watch('startDate');

  const selectedPlan = plans.find((p) => p._id === selectedPlanId);
  const calculatedEndDate = React.useMemo(() => {
    if (!selectedPlan) return null;
    const start = watchStartDate ? new Date(watchStartDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + selectedPlan.durationDays);
    return end.toLocaleDateString();
  }, [selectedPlan, watchStartDate]);

  // Fetch Members List
  const fetchMembers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (planFilter) params.planId = planFilter;

      const res = await api.get('/members', { params });
      if (res.data?.success) {
        setMembers(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      toastError('Failed to fetch members', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, planFilter, toastError]);

  // Initial Load: Fetch Plans & Settings
  useEffect(() => {
    api.get('/membership-plans')
      .then((res) => {
        if (res.data?.data) setPlans(res.data.data);
      })
      .catch(() => {});

    api.get('/settings')
      .then((res) => {
        if (res.data?.data?.currencySymbol) setCurrencySymbol(res.data.data.currencySymbol);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  // Handle Image File selection and Cloudinary upload
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.data?.imageUrl) {
        setUploadedImageUrl(res.data.data.imageUrl);
        toastSuccess('Profile picture uploaded!');
      }
    } catch (err) {
      toastError('Image upload failed', err.response?.data?.message || 'Using fallback avatar');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Add Member
  const onAddMemberSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        profileImageUrl: uploadedImageUrl || undefined
      };

      const res = await api.post('/members', payload);
      toastSuccess('Member Created!', res.data?.message || 'Member added successfully');

      if (res.data?.data?.invitation?.oneTimeCredentialPreview) {
        toastInfo(
          'One-Time Credential (Preview)',
          `Code: ${res.data.data.invitation.oneTimeCredentialPreview}`
        );
      }

      setIsAddModalOpen(false);
      reset();
      setImageFile(null);
      setImagePreview('');
      setUploadedImageUrl('');
      fetchMembers(1);
    } catch (err) {
      toastError('Failed to create member', err.response?.data?.message || err.message);
    }
  };

  // Open Edit Member Modal
  const openEditModal = (member) => {
    setEditingMember(member);
    setEditImagePreview(member.profileImageUrl || '');
    setEditImageFile(null);
    resetEdit({
      name: member.userId?.name || '',
      email: member.userId?.email || '',
      phone: member.phone || '',
      status: member.status || 'ACTIVE',
      address: member.address || '',
      gender: member.gender || 'PREFER_NOT_TO_SAY',
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      emergencyContactName: member.emergencyContact?.name || '',
      emergencyContactPhone: member.emergencyContact?.phone || '',
      medicalNotes: member.medicalNotes || '',
      additionalNotes: member.additionalNotes || ''
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Image Change
  const handleEditImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  // Submit Edit Member
  const onEditMemberSubmit = async (formData) => {
    if (!editingMember) return;
    setIsUploadingEditImage(true);
    try {
      let finalImageUrl = editingMember.profileImageUrl || '';
      if (editImageFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', editImageFile);
        formDataImg.append('folder', 'members');
        const uploadRes = await api.post('/uploads/image', formDataImg, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const uploaded = uploadRes.data?.data?.imageUrl || uploadRes.data?.data?.url;
        if (uploaded) {
          finalImageUrl = uploaded;
        }
      }

      const res = await api.put(`/members/${editingMember._id}`, {
        ...formData,
        profileImageUrl: finalImageUrl
      });

      toastSuccess('Member Updated', `Successfully updated information for ${formData.name}`);
      setIsEditModalOpen(false);
      setEditingMember(null);
      fetchMembers(pagination.page);

      if (selectedMember && selectedMember._id === editingMember._id) {
        setSelectedMember(res.data?.data || { ...selectedMember, ...formData, profileImageUrl: finalImageUrl });
      }
    } catch (err) {
      toastError('Update Failed', err.response?.data?.message || err.message);
    } finally {
      setIsUploadingEditImage(false);
    }
  };

  // Toggle Member Status (Active <-> Inactive)
  const handleToggleStatus = async (member) => {
    const nextStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatusTogglingId(member._id);

    try {
      const res = await api.patch(`/members/${member._id}/status`, { status: nextStatus });
      toastSuccess(
        nextStatus === 'INACTIVE' ? 'Member Marked Inactive' : 'Member Activated',
        res.data?.message || `Member ${member.memberId} is now ${nextStatus}`
      );
      fetchMembers(pagination.page);
      if (selectedMember && selectedMember._id === member._id) {
        setSelectedMember((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err) {
      toastError('Status Change Failed', err.response?.data?.message || err.message);
    } finally {
      setStatusTogglingId(null);
    }
  };

  // Resend Member Invitation
  const handleResendInvitation = async (member) => {
    try {
      const res = await api.post(`/members/${member._id}/resend-invite`);
      if (res.data?.data?.emailDeliveryFailed) {
        toastError('Email Notice', res.data?.message);
      } else {
        toastSuccess('Invitation Dispatched!', res.data?.message);
      }
      if (res.data?.data?.oneTimeCredentialPreview) {
        toastInfo(
          'Login Credentials Generated',
          `Member: ${member.userId?.name} | One-Time OTP: ${res.data.data.oneTimeCredentialPreview}`
        );
      }
      fetchMembers(pagination.page);
    } catch (err) {
      toastError('Failed to resend invitation', err.response?.data?.message || err.message);
    }
  };

  // Open Details Modal and fetch history
  const openMemberDetails = async (member) => {
    setSelectedMember(member);
    setIsDetailsModalOpen(true);
    setDetailTab('profile');
    loadHistoryTab(member._id, 'profile');
  };

  const loadHistoryTab = async (memberId, tab) => {
    if (tab === 'profile') return;
    setLoadingHistory(true);
    try {
      const res = await api.get(`/members/${memberId}/${tab}`);
      setDetailHistory(res.data?.data || []);
    } catch (err) {
      setDetailHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Member Directory</h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-600 text-white rounded uppercase tracking-wider">
              {pagination.total} Members
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage registrations, credentials, subscriptions, and member profiles.
          </p>
        </div>

        <button
          onClick={() => {
            reset();
            setImagePreview('');
            setUploadedImageUrl('');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or Member ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">All Plans</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Plan & Expiration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Invitation</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-4">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No members match your criteria
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const planName = m.membershipId?.planId?.name || 'Standard';
                  const endDate = m.membershipId?.endDate
                    ? new Date(m.membershipId.endDate).toLocaleDateString()
                    : 'N/A';

                  return (
                    <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {m.profileImageUrl ? (
                            <img
                              src={m.profileImageUrl}
                              alt={m.userId?.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-200 dark:border-emerald-800">
                              {m.userId?.name?.charAt(0) || 'M'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{m.userId?.name}</p>
                            <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{m.memberId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-800 dark:text-slate-200 font-medium">{m.userId?.email}</p>
                        <p className="text-slate-500 text-[11px]">{m.phone}</p>
                      </td>

                      {/* Plan & Expiration */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{planName}</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Expires: {endDate}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge status={m.status} />
                      </td>

                      {/* Invitation Status */}
                      <td className="py-3.5 px-4">
                        <Badge status={m.invitationStatus} />
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openMemberDetails(m)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="View member details & history"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 rounded-lg transition-colors cursor-pointer"
                            title="Edit Member Information"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleResendInvitation(m)}
                            className="p-1.5 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-800 dark:text-yellow-400 border border-yellow-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Resend invitation email & password setup link"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(m)}
                            disabled={statusTogglingId === m._id}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                              m.status === 'ACTIVE'
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
                            }`}
                            title={m.status === 'ACTIVE' ? 'Mark Inactive (Deactivate)' : 'Mark Active (Activate)'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing {members.length} of {pagination.total} registered members
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMembers(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-900 dark:text-white rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-900 dark:text-white px-2">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchMembers(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-900 dark:text-white rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Gym Member"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit(onAddMemberSubmit)} className="space-y-5">
          {/* Profile Picture Upload & Preview */}
          <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <UserPlus className="w-7 h-7" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Profile Picture</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {isUploadingImage && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Uploading image...</p>}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Max size 5MB (JPEG, PNG, WebP). Optional.</p>
            </div>
          </div>

          {/* Primary Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Alexander Hayes"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email Address * (Used for login & QR check-in)
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="alexander@example.com"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Residential Address *
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder="42 Downtown Ave, Suite 101"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address.message}</p>}
            </div>
          </div>

          {/* Membership Plan Selection */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Membership Plan Setup
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Plan *</label>
                <select
                  {...register('planId')}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="">-- Choose a Membership Plan --</option>
                  {plans.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.durationDays} Days) - {currencySymbol}{p.price}
                    </option>
                  ))}
                </select>
                {errors.planId && <p className="text-xs text-rose-500 mt-1">{errors.planId.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {calculatedEndDate && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 p-2.5 rounded-lg flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Calculated Expiration Date: <strong>{calculatedEndDate}</strong></span>
              </p>
            )}
          </div>

          {/* Initial Payment Record (Optional) */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Initial Payment (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Paid ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('initialPaymentAmount', { valueAsNumber: true })}
                  placeholder={selectedPlan ? String(selectedPlan.price) : '0'}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  {...register('paymentMethod')}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Optional Emergency & Medical Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                {...register('emergencyContactName')}
                placeholder="Parent / Spouse / Friend"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                {...register('emergencyContactPhone')}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              {isSubmitting ? 'Creating Member & Sending Invite...' : 'Register Member & Dispatch Invitation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MEMBER DETAILS & HISTORY MODAL */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={selectedMember ? `Member Profile: ${selectedMember.memberId}` : 'Member Details'}
        maxWidth="max-w-4xl"
      >
        {selectedMember && (
          <div className="space-y-6">
            {/* Top Identity Header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {selectedMember.profileImageUrl ? (
                <img
                  src={selectedMember.profileImageUrl}
                  alt={selectedMember.userId?.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center text-lg border border-emerald-200 dark:border-emerald-800">
                  {selectedMember.userId?.name?.charAt(0) || 'M'}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedMember.userId?.name}</h3>
                  <Badge status={selectedMember.status} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedMember.userId?.email} • {selectedMember.phone}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    ID: {selectedMember.memberId}
                  </span>
                </div>
              </div>

              {/* Quick Actions inside Details Modal */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(selectedMember)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedMember)}
                  disabled={statusTogglingId === selectedMember._id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer disabled:opacity-50 ${
                    selectedMember.status === 'ACTIVE'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{selectedMember.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                </button>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
              {['profile', 'memberships', 'payments', 'attendance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setDetailTab(tab);
                    loadHistoryTab(selectedMember._id, tab);
                  }}
                  className={`pb-3 capitalize transition-colors cursor-pointer ${
                    detailTab === tab
                      ? 'border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {detailTab === 'profile' && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Address</span>
                  <p className="text-slate-900 dark:text-slate-200 mt-1 font-medium">{selectedMember.address}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Emergency Contact</span>
                  <p className="text-slate-900 dark:text-slate-200 mt-1 font-medium">
                    {selectedMember.emergencyContact?.name || 'Not provided'}
                    {selectedMember.emergencyContact?.phone ? ` (${selectedMember.emergencyContact.phone})` : ''}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Invitation Status</span>
                  <div className="mt-1">
                    <Badge status={selectedMember.invitationStatus} />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Medical Notes</span>
                  <p className="text-slate-900 dark:text-slate-200 mt-1 font-medium">{selectedMember.medicalNotes || 'None recorded'}</p>
                </div>
              </div>
            )}

            {detailTab !== 'profile' && (
              <div className="overflow-x-auto">
                {loadingHistory ? (
                  <p className="text-xs text-slate-500 text-center py-6">Loading records...</p>
                ) : detailHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 italic">No records found</p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[11px] font-bold">
                      <tr>
                        {detailTab === 'memberships' && (
                          <>
                            <th className="py-2.5 px-3">Plan</th>
                            <th className="py-2.5 px-3">Start Date</th>
                            <th className="py-2.5 px-3">End Date</th>
                            <th className="py-2.5 px-3">Status</th>
                          </>
                        )}
                        {detailTab === 'payments' && (
                          <>
                            <th className="py-2.5 px-3">Reference</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Method</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                          </>
                        )}
                        {detailTab === 'attendance' && (
                          <>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Check-In Time</th>
                            <th className="py-2.5 px-3">Check-Out Time</th>
                            <th className="py-2.5 px-3">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {detailHistory.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          {detailTab === 'memberships' && (
                            <>
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{item.planId?.name}</td>
                              <td className="py-2.5 px-3">{new Date(item.startDate).toLocaleDateString()}</td>
                              <td className="py-2.5 px-3">{new Date(item.endDate).toLocaleDateString()}</td>
                              <td className="py-2.5 px-3"><Badge status={item.status} /></td>
                            </>
                          )}
                          {detailTab === 'payments' && (
                            <>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">{item.transactionReference}</td>
                              <td className="py-2.5 px-3">{new Date(item.paymentDate).toLocaleDateString()}</td>
                              <td className="py-2.5 px-3">{item.paymentMethod}</td>
                              <td className="py-2.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">{currencySymbol}{item.amount}</td>
                            </>
                          )}
                          {detailTab === 'attendance' && (
                            <>
                              <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{item.dateString}</td>
                              <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{new Date(item.checkInAt).toLocaleTimeString()}</td>
                              <td className="py-2.5 px-3">{item.checkOutAt ? new Date(item.checkOutAt).toLocaleTimeString() : 'In gym'}</td>
                              <td className="py-2.5 px-3"><Badge status={item.status} /></td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* EDIT MEMBER INFORMATION MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMember(null);
        }}
        title={editingMember ? `Edit Member: ${editingMember.userId?.name} (${editingMember.memberId})` : 'Edit Member'}
        maxWidth="max-w-2xl"
      >
        {editingMember && (
          <form onSubmit={handleSubmitEdit(onEditMemberSubmit)} className="space-y-4">
            {/* Image Preview & Change */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              {editImagePreview ? (
                <img
                  src={editImagePreview}
                  alt="Preview"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-500 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-lg">
                  {editingMember.userId?.name?.charAt(0) || 'M'}
                </div>
              )}
              <div className="flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Change Profile Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleEditImageChange}
                    className="hidden"
                  />
                </label>
                {isUploadingEditImage && <p className="text-xs text-emerald-600 mt-1">Uploading new photo...</p>}
              </div>
            </div>

            {/* Name, Email Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...registerEdit('name')}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
                {editErrors.name && <p className="text-xs text-rose-500 mt-1">{editErrors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...registerEdit('email')}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                {editErrors.email && <p className="text-xs text-rose-500 mt-1">{editErrors.email.message}</p>}
              </div>
            </div>

            {/* Phone & Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...registerEdit('phone')}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
                {editErrors.phone && <p className="text-xs text-rose-500 mt-1">{editErrors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Membership Status *
                </label>
                <select
                  {...registerEdit('status')}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE (Can Access & Check-In)</option>
                  <option value="INACTIVE">INACTIVE (Access Suspended)</option>
                  <option value="EXPIRED">EXPIRED (Plan Lapsed)</option>
                </select>
              </div>
            </div>

            {/* Address & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  {...registerEdit('address')}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                {editErrors.address && <p className="text-xs text-rose-500 mt-1">{editErrors.address.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  {...registerEdit('gender')}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Date of Birth & Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...registerEdit('dateOfBirth')}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  {...registerEdit('emergencyContactName')}
                  placeholder="e.g. Spouse / Parent"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  {...registerEdit('emergencyContactPhone')}
                  placeholder="+91..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Medical & Additional Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Medical / Physical Notes
                </label>
                <input
                  type="text"
                  {...registerEdit('medicalNotes')}
                  placeholder="Injuries, asthma, allergies..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Internal Staff Notes
                </label>
                <input
                  type="text"
                  {...registerEdit('additionalNotes')}
                  placeholder="Special requests, locker number..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingMember(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingEdit || isUploadingEditImage}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                {isSubmittingEdit ? 'Saving Updates...' : 'Save Member Information'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default MembersPage;

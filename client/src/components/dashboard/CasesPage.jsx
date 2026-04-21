import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { FolderOpen, Plus, Search, Filter, Edit, Trash2, Eye, X, Loader2, Calendar, User, AlertCircle, FileText } from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getCases, createCase, updateCase, deleteCase, getClients } from '../../services/caseManagementService';
import { getAllUsers } from '../../services/auth/authService';
import Pagination from './Pagination';

const CasesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const hasPermission = (action) => user?.role === 'admin' || user?.permissions?.[action];

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Data for selects
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: '',
    caseType: 'civil',
    status: 'open',
    priority: 'medium',
    hearingDate: '',
    assignedTo: ''
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    client: '',
    caseType: 'civil',
    status: 'open',
    priority: 'medium',
    hearingDate: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (showModal || showViewModal || showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showViewModal, showEditModal]);

  useEffect(() => {
    fetchCases();
    fetchDependencies();
  }, []);

  const fetchCases = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getCases(page, pagination.limit);
      setCases(response.data.cases);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [clientsRes, usersRes] = await Promise.all([
        getClients(1, 100),
        getAllUsers(1, 100)
      ]);
      setClients(clientsRes.data.clients || []);
      // Some endpoints return different paths for users
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Failed to fetch clients/users for dropdowns', error);
    }
  };

  const handlePageChange = (page) => {
    fetchCases(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.client || !formData.caseType) {
      toast.error('Title, client, and case type are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await createCase(formData);
      toast.success('Case created successfully');
      setFormData({
        title: '', description: '', client: '', caseType: 'civil',
        status: 'open', priority: 'medium', hearingDate: '', assignedTo: ''
      });
      setShowModal(false);
      fetchCases();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.title || !editFormData.client || !editFormData.caseType) {
      toast.error('Title, client, and case type are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateCase(selectedCase._id, editFormData);
      toast.success('Case updated successfully');
      setShowEditModal(false);
      fetchCases();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCase = (caseItem) => {
    setSelectedCase(caseItem);
    setShowViewModal(true);
  };

  const handleEditCase = (caseItem) => {
    setSelectedCase(caseItem);
    setEditFormData({
      title: caseItem.title || '',
      description: caseItem.description || '',
      client: caseItem.client?._id || '',
      caseType: caseItem.caseType || 'civil',
      status: caseItem.status || 'open',
      priority: caseItem.priority || 'medium',
      hearingDate: caseItem.hearingDate ? (() => {
        const d = new Date(caseItem.hearingDate);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      })() : '',
      assignedTo: caseItem.assignedTo?._id || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteCase = async (caseId, title) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete <strong>${title}</strong>.<br/>This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteCase(caseId);
        toast.success('Case deleted successfully');
        fetchCases();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete case');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', client: '', caseType: 'civil',
      status: 'open', priority: 'medium', hearingDate: '', assignedTo: ''
    });
    setShowModal(false);
  };

  // Option lists for Select
  const caseTypeOptions = [
    { value: 'civil', label: 'Civil' },
    { value: 'criminal', label: 'Criminal' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'family', label: 'Family' },
    { value: 'property', label: 'Property' },
    { value: 'tax', label: 'Tax' },
    { value: 'labor', label: 'Labor' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'closed', label: 'Closed' },
    { value: 'archived', label: 'Archived' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const clientOptions = clients.map(c => ({ value: c._id, label: c.name }));
  const userOptions = users.map(u => ({ value: u._id, label: u.name }));

  const filteredCases = cases.filter(c =>
    (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.caseNumber && c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const customSelectStyles = {
    control: (base) => ({ ...base, backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', minHeight: '42px' }),
    menu: (base) => ({ ...base, backgroundColor: 'var(--bg-primary)', zIndex: 9999 }),
    option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? 'rgb(212, 175, 55)' : state.isFocused ? 'var(--bg-secondary)' : 'transparent', color: state.isSelected ? '#000' : 'var(--text-primary)' }),
    singleValue: (base) => ({ ...base, color: 'var(--text-primary)' })
  };

  return (
    <div className="space-y-6 font-inter">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Cases
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage and track all your legal cases
          </p>
        </div>
        {hasPermission('canWrite') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search cases by title or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gold/50"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
          />
        </div>
      </div>

      <div className="rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              All Cases
            </h2>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <FolderOpen className="w-4 h-4" />
              <span>{pagination.totalItems} total</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gold" />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading cases...</p>
              </div>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gold/50" />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No Cases Found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Create your first case to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Case Number / Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Client</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Type / Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((caseItem) => (
                    <tr key={caseItem._id} className="border-b hover:bg-gold/5 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gold mb-0.5">{caseItem.caseNumber}</span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{caseItem.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{caseItem.client?.name || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${caseItem.status === 'open' ? 'bg-green-500/20 text-green-400' :
                          caseItem.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                            caseItem.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                              'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span style={{ color: 'var(--text-secondary)' }} className="text-xs">{caseItem.caseType.charAt(0).toUpperCase() + caseItem.caseType.slice(1)}</span>
                          <span className={`text-xs font-medium ${caseItem.priority === 'urgent' ? 'text-red-400' :
                            caseItem.priority === 'high' ? 'text-orange-400' :
                              'text-green-400'
                            }`}>
                            {caseItem.priority.charAt(0).toUpperCase() + caseItem.priority.slice(1)} Priority
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {hasPermission('canRead') && (
                            <button onClick={() => handleViewCase(caseItem)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors cursor-pointer" title="View details">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasPermission('canUpdate') && (
                            <button onClick={() => handleEditCase(caseItem)} className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors cursor-pointer" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasPermission('canDelete') && (
                            <button onClick={() => handleDeleteCase(caseItem._id, caseItem.title)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {!loading && (
        <Pagination
          currentPage={pagination.currentPage || 1}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.totalItems || 0}
          limit={pagination.limit || 10}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 font-inter">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative w-full max-w-2xl rounded-xl border shadow-2xl z-10 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', maxHeight: '90vh' }}>
            <div className="shrink-0 flex items-center justify-between p-5 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Create New Case</h2>
              <button type="button" onClick={resetForm} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto scrollbar-hide p-5" style={{ flexGrow: 1 }}>
              <form id="create-case-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} placeholder="Enter Title" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Client <span className="text-red-500">*</span></label>
                  <Select value={clientOptions.find(opt => opt.value === formData.client)} onChange={(selected) => setFormData(prev => ({ ...prev, client: selected ? selected.value : '' }))} options={clientOptions} styles={customSelectStyles} isClearable placeholder="Select a client..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Case Type <span className="text-red-500">*</span></label>
                    <Select
                      value={caseTypeOptions.find(opt => opt.value === formData.caseType)}
                      onChange={(selected) => setFormData(prev => ({ ...prev, caseType: selected.value }))}
                      options={caseTypeOptions}
                      styles={customSelectStyles}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Status</label>
                    <Select
                      value={statusOptions.find(opt => opt.value === formData.status)}
                      onChange={(selected) => setFormData(prev => ({ ...prev, status: selected.value }))}
                      options={statusOptions}
                      styles={customSelectStyles}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Priority</label>
                    <Select
                      value={priorityOptions.find(opt => opt.value === formData.priority)}
                      onChange={(selected) => setFormData(prev => ({ ...prev, priority: selected.value }))}
                      options={priorityOptions}
                      styles={customSelectStyles}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Hearing Date & Time</label>
                    <input type="datetime-local" name="hearingDate" value={formData.hearingDate} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', height: '42px' }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Assigned To</label>
                  <Select value={userOptions.find(opt => opt.value === formData.assignedTo)} onChange={(selected) => setFormData(prev => ({ ...prev, assignedTo: selected ? selected.value : '' }))} options={userOptions} styles={customSelectStyles} isClearable placeholder="Assign a user..." />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} placeholder="Add details..." rows="3" />
                </div>
              </form>
            </div>
            <div className="shrink-0 flex items-center justify-end space-x-3 p-5 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button type="button" disabled={isSubmitting} onClick={resetForm} className="px-5 py-2 border rounded-lg hover:bg-gray-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
              <button type="submit" form="create-case-form" disabled={isSubmitting} className="px-5 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Case'
                )}
              </button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* View Modal */}
      {showViewModal && selectedCase && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
          <div className="relative w-full max-w-2xl rounded-xl border shadow-2xl z-10 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', maxHeight: '90vh' }}>
            <div className="shrink-0 flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText className="w-5 h-5 text-gold" />
                Case Details
              </h2>
              <button type="button" onClick={() => setShowViewModal(false)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto scrollbar-hide p-5 space-y-4">
              <div className="mb-4">
                <div className="text-xs font-semibold text-gold mb-1">{selectedCase.caseNumber}</div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedCase.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${selectedCase.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
                  </span>
                  <span className="inline-flex px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                    {selectedCase.caseType.charAt(0).toUpperCase() + selectedCase.caseType.slice(1)}
                  </span>
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${selectedCase.priority === 'urgent' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-400'}`}>
                    {selectedCase.priority.charAt(0).toUpperCase() + selectedCase.priority.slice(1)} Priority
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {selectedCase.client && (
                  <div className="flex items-start gap-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <User className="w-5 h-5 text-gold mt-0.5" />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Client</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selectedCase.client.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedCase.client.email}</p>
                    </div>
                  </div>
                )}

                {selectedCase.assignedTo && (
                  <div className="flex items-center gap-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <AlertCircle className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Assigned To</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedCase.assignedTo.name}</p>
                    </div>
                  </div>
                )}

                {selectedCase.hearingDate && (
                  <div className="flex items-center gap-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <Calendar className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hearing Date & Time</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {new Date(selectedCase.hearingDate).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {selectedCase.description && (
                  <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Description</p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{selectedCase.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>, document.body
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCase && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-2xl rounded-xl border shadow-2xl z-10 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', maxHeight: '90vh' }}>
            <div className="shrink-0 flex items-center justify-between p-5 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Edit Case</h2>
              <button type="button" onClick={() => setShowEditModal(false)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto scrollbar-hide p-5" style={{ flexGrow: 1 }}>
              <form id="edit-case-form" onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={editFormData.title} onChange={handleEditInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Client <span className="text-red-500">*</span></label>
                  <Select value={clientOptions.find(opt => opt.value === editFormData.client)} onChange={(selected) => setEditFormData(prev => ({ ...prev, client: selected ? selected.value : '' }))} options={clientOptions} styles={customSelectStyles} isClearable />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Case Type <span className="text-red-500">*</span></label>
                    <Select value={caseTypeOptions.find(opt => opt.value === editFormData.caseType)} onChange={(selected) => setEditFormData(prev => ({ ...prev, caseType: selected.value }))} options={caseTypeOptions} styles={customSelectStyles} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Status</label>
                    <Select value={statusOptions.find(opt => opt.value === editFormData.status)} onChange={(selected) => setEditFormData(prev => ({ ...prev, status: selected.value }))} options={statusOptions} styles={customSelectStyles} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Priority</label>
                    <Select value={priorityOptions.find(opt => opt.value === editFormData.priority)} onChange={(selected) => setEditFormData(prev => ({ ...prev, priority: selected.value }))} options={priorityOptions} styles={customSelectStyles} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Hearing Date & Time</label>
                    <input type="datetime-local" name="hearingDate" value={editFormData.hearingDate} onChange={handleEditInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', height: '42px' }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Assigned To</label>
                  <Select value={userOptions.find(opt => opt.value === editFormData.assignedTo)} onChange={(selected) => setEditFormData(prev => ({ ...prev, assignedTo: selected ? selected.value : '' }))} options={userOptions} styles={customSelectStyles} isClearable />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
                  <textarea name="description" value={editFormData.description} onChange={handleEditInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} rows="3" />
                </div>
              </form>
            </div>

            <div className="shrink-0 flex items-center justify-end space-x-3 p-5 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button type="button" disabled={isSubmitting} onClick={() => setShowEditModal(false)} className="px-5 py-2 border rounded-lg hover:bg-gray-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
              <button type="submit" form="edit-case-form" disabled={isSubmitting} className="px-5 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Case'
                )}
              </button>
            </div>
          </div>
        </div>, document.body
      )}

    </div>
  );
};

export default CasesPage;

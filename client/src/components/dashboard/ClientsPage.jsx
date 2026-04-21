import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { Users, Plus, Search, Edit, Trash2, Eye, X, Loader2, Mail, Phone, MapPin } from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getClients, createClient, updateClient, deleteClient } from '../../services/caseManagementService';
import Pagination from './Pagination';

const ClientsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const hasPermission = (action) => user?.role === 'admin' || user?.permissions?.[action];

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
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
    fetchClients();
  }, []);

  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getClients(page, pagination.limit);
      setClients(response.data.clients);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchClients(page);
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
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      await createClient(formData);
      toast.success('Client created successfully');
      setFormData({ name: '', email: '', phone: '', address: '', status: 'active' });
      setShowModal(false);
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create client');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      await updateClient(selectedClient._id, editFormData);
      toast.success('Client updated successfully');
      setShowEditModal(false);
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update client');
    }
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setEditFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      status: client.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleDeleteClient = async (clientId, clientName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete <strong>${clientName}</strong>.<br/>This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteClient(clientId);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete client');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '', status: 'active' });
    setShowModal(false);
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-inter">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Clients
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage your client database
          </p>
        </div>
        {hasPermission('canWrite') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search clients by name or email..."
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
              All Clients
            </h2>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Users className="w-4 h-4" />
              <span>{pagination.totalItems} total</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gold" />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading clients...</p>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gold/50" />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No Clients Found
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Add your first client to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client._id} className="border-b hover:bg-gold/5 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{client.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{client.email}</td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{client.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${client.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          client.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {hasPermission('canRead') && (
                            <button onClick={() => handleViewClient(client)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors cursor-pointer" title="View details">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasPermission('canUpdate') && (
                            <button onClick={() => handleEditClient(client)} className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors cursor-pointer" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasPermission('canDelete') && (
                            <button onClick={() => handleDeleteClient(client._id, client.name)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer" title="Delete">
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
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative w-full max-w-2xl flex flex-col rounded-xl border shadow-2xl z-10 overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', maxHeight: '90vh' }}>
            <div className="shrink-0 flex items-center justify-between p-5 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Add New Client</h2>
              <button type="button" onClick={resetForm} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 scrollbar-hide" style={{ flexGrow: 1 }}>
              <form id="create-client-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} placeholder="Enter full name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Email <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} placeholder="client@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} placeholder="+91 8933745375" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} placeholder="Enter address" rows="3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Status</label>
                  <Select value={statusOptions.find(opt => opt.value === formData.status)} onChange={(selected) => setFormData(prev => ({ ...prev, status: selected.value }))} options={statusOptions} styles={{ control: (base) => ({ ...base, backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', minHeight: '42px' }), menu: (base) => ({ ...base, backgroundColor: 'var(--bg-primary)', zIndex: 9999 }), option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? 'rgb(212, 175, 55)' : state.isFocused ? 'var(--bg-secondary)' : 'transparent', color: state.isSelected ? '#000' : 'var(--text-primary)' }), singleValue: (base) => ({ ...base, color: 'var(--text-primary)' }) }} />
                </div>
              </form>
            </div>
            <div className="shrink-0 flex items-center justify-end space-x-3 p-5 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 border rounded-lg hover:bg-gray-500/10 transition-colors cursor-pointer" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
              <button type="submit" form="create-client-form" className="px-6 py-2.5 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer">Add Client</button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* View Modal */}
      {showViewModal && selectedClient && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
          <div className="relative w-full max-w-md flex flex-col rounded-xl border shadow-2xl z-10" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', maxHeight: '90vh' }}>
            <div className="shrink-0 flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Client Details</h2>
              <button type="button" onClick={() => setShowViewModal(false)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto custom-scrollbar p-5 space-y-4" style={{ flexGrow: 1 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-2xl">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedClient.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${selectedClient.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <Mail className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Email</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedClient.email}</p>
                  </div>
                </div>
                {selectedClient.phone && (
                  <div className="flex items-center gap-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <Phone className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Phone</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedClient.phone}</p>
                    </div>
                  </div>
                )}
                {selectedClient.address && (
                  <div className="flex items-center gap-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <MapPin className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Address</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedClient.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>, document.body
      )}

      {/* Edit Modal */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-2xl flex flex-col rounded-xl border shadow-2xl z-10 overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', maxHeight: '90vh' }}>
            <div className="shrink-0 flex items-center justify-between p-5 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Edit Client</h2>
              <button type="button" onClick={() => setShowEditModal(false)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 scrollbar-hide" style={{ flexGrow: 1 }}>
              <form id="edit-client-form" onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Email <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={editFormData.email} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    maxLength={10}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Address</label>
                  <textarea name="address" value={editFormData.address} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} rows="3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Status</label>
                  <Select value={statusOptions.find(opt => opt.value === editFormData.status)} onChange={(selected) => setEditFormData(prev => ({ ...prev, status: selected.value }))} options={statusOptions} styles={{ control: (base) => ({ ...base, backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', minHeight: '42px' }), menu: (base) => ({ ...base, backgroundColor: 'var(--bg-primary)', zIndex: 9999 }), option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? 'rgb(212, 175, 55)' : state.isFocused ? 'var(--bg-secondary)' : 'transparent', color: state.isSelected ? '#000' : 'var(--text-primary)' }), singleValue: (base) => ({ ...base, color: 'var(--text-primary)' }) }} />
                </div>
              </form>
            </div>
            <div className="shrink-0 flex items-center justify-end space-x-3 p-5 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2.5 border rounded-lg hover:bg-gray-500/10 transition-colors cursor-pointer" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
              <button type="submit" form="edit-client-form" className="px-6 py-2.5 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer">Update Client</button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default ClientsPage;

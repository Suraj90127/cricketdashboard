import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Search, Filter, ChevronUp, ChevronDown, CheckCircle, XCircle, Clock, RefreshCw, Download, AlertCircle, CreditCard, User, Phone, Calendar } from 'lucide-react';
import { userRecharge, updateRrechargeStatus, setCurrentPage, messageClear } from '../redux/reducer/walletReducer';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Constants
const ALLOWED_STATUSES = ['pending', 'completed', 'rejected'];
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  0: 'bg-yellow-100 text-yellow-800', // pending
  1: 'bg-green-100 text-green-800',  // completed
};
const STATUS_LABELS = {
  pending: 'Pending',
  completed: 'Completed',
  rejected: 'Failed',
};
// const ALLOWED_STATUSES = ['pending', 'approved', 'rejected', 'completed'];
const STATUS_ICONS = {
  pending: Clock,
  completed: CheckCircle,
  rejected: XCircle,
  0: Clock,
  1: CheckCircle,
};

function Recharge() {
  const dispatch = useDispatch();
  const { rechargeData = [], loading, updating, pagination, errorMessage, successMessage } = useSelector((state) => state.wallet);

  // State management
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [localPagination, setLocalPagination] = useState({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 1
  });

  // Fetch recharges data
  const fetchRecharges = (page = localPagination.page) => {
    dispatch(userRecharge({
      page,
      limit: localPagination.perPage,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      search: searchQuery || undefined,
      sortBy: sortConfig.key,
      order: sortConfig.direction
    }));
  };

  // Handle status update
  const handleStatusUpdate = async (rechargeId, newStatus) => {
    try {
      const result = await dispatch(updateRrechargeStatus({ rechargeId, status: newStatus })).unwrap();
      
      if (result.success) {
        toast.success(result.message || 'Status updated successfully!');
        
        // If we're filtering by status and the updated status doesn't match, remove it from list
        if (selectedStatus !== 'all' && selectedStatus !== newStatus) {
          fetchRecharges();
        }
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to update status');
    }
  };

  // Handle sort
  const handleSort = (key) => {
    const newSortConfig = {
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    };
    setSortConfig(newSortConfig);
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecharges(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedStatus, sortConfig]);

  // Handle pagination change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(setCurrentPage(newPage));
      fetchRecharges(newPage);
    }
  };

  // Sync local pagination with Redux
  useEffect(() => {
    if (pagination) {
      setLocalPagination(pagination);
    }
  }, [pagination]);

  // Show toast messages
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
    }
  }, [errorMessage, successMessage, dispatch]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get status text
  const getStatusText = (status) => {
    return STATUS_LABELS[status];
  };

  // Get status badge component
  const StatusBadge = ({ status }) => {
    const Icon = STATUS_ICONS[status] || Clock;
    const bgColor = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor}`}>
        <Icon className="w-4 h-4 mr-1" />
        {getStatusText(status)}
      </span>
    );
  };

  // Status update dropdown component
  const StatusUpdateDropdown = ({ currentStatus, rechargeId }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={updating}
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {updating ? 'Updating...' : 'Update Status'}
          <ChevronDown className="ml-1 w-4 h-4" />
        </button>
        
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute flex flex-col right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
              {ALLOWED_STATUSES.map(status => (
                <button
                  key={status}
                  disabled={status === currentStatus}
                  onClick={() => {
                    handleStatusUpdate(rechargeId, status);
                    setShowDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                    (status === currentStatus ) 
                      ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      status === 'pending' ? 'bg-yellow-500' :
                      status === 'completed' ? 'bg-green-500' :
                      status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    {getStatusText(status)}
                    {(status === currentStatus) && (
                      <CheckCircle className="ml-auto w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Calculate stats
  const calculateStats = () => {
    const total = rechargeData.length;
    const pending = rechargeData.filter(r => r.status === 0 || r.status === 'pending').length;
    const completed = rechargeData.filter(r => r.status === 1 || r.status === 'completed').length;
    const rejected = rechargeData.filter(r => r.status === 'rejected').length;
    const totalAmount = rechargeData.reduce((sum, r) => sum + r.money, 0);
    const todayAmount = rechargeData
      .filter(r => (r.status === 1 || r.status === 'completed') && new Date(r.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, r) => sum + r.money, 0);

    return { total, pending, completed, rejected, totalAmount, todayAmount };
  };

  const stats = calculateStats();

  // Get payment type badge
  const PaymentTypeBadge = ({ type }) => {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
        <CreditCard className="w-3 h-3 mr-1" />
        {type === 'online' ? 'Online' : type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="mx-auto overflow-hidden relative text-sm p-2 md:p-6">
        <div className="mt-4">
          <header className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Recharge Management</h1>
                  <p className="text-teal-200 mt-1">Manage user recharge requests and transactions</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => fetchRecharges()}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center transition-colors"
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button 
                    className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
                    onClick={() => {
                      // Export functionality
                      const dataStr = JSON.stringify(rechargeData, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `recharges_${new Date().toISOString().split('T')[0]}.json`;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90">Total Recharges</div>
                  <div className="text-2xl font-bold mt-1">{pagination.total || 0}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90">Pending</div>
                  <div className="text-2xl font-bold mt-1">{stats.pending}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90">Completed</div>
                  <div className="text-2xl font-bold mt-1">{stats.completed}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90">Failed</div>
                  <div className="text-2xl font-bold mt-1">{stats.rejected}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90">Total Amount</div>
                  <div className="text-2xl font-bold mt-1">
                    ₹{stats.totalAmount}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by User ID, Phone, Order ID, or Code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Filter className="w-5 h-5 text-gray-400 mr-2" />
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Failed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Recharges Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {loading && rechargeData.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Order ID', 'User Info', 'Amount', 'Type', 'Status', 'Transaction Details', 'Date', 'Actions'].map((header, idx) => (
                            <th
                              key={idx}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {['Order ID', 'Amount', 'Status', 'Date'].includes(header) ? (
                                <button
                                  onClick={() => handleSort({
                                    'Order ID': 'id_order',
                                    'Amount': 'money',
                                    'Status': 'status',
                                    'Date': 'createdAt'
                                  }[header])}
                                  className="flex items-center hover:text-gray-700"
                                >
                                  {header}
                                  {sortConfig.key === {
                                    'Order ID': 'id_order',
                                    'Amount': 'money',
                                    'Status': 'status',
                                    'Date': 'createdAt'
                                  }[header] && (
                                    sortConfig.direction === 'asc' ? 
                                      <ChevronUp className="w-4 h-4 ml-1" /> : 
                                      <ChevronDown className="w-4 h-4 ml-1" />
                                  )}
                                </button>
                              ) : (
                                header
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rechargeData.map((recharge) => (
                          <tr key={recharge._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 font-mono">
                                {recharge.id_order}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-medium flex items-center">
                                  <User className="w-4 h-4 mr-1 text-gray-400" />
                                  User: {recharge.userId?.slice(-8)}
                                </div>
                                <div className="text-gray-500 flex items-center mt-1">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {recharge.phone}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-semibold text-gray-900">
                                {formatCurrency(recharge.money)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <PaymentTypeBadge type={recharge.type} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={recharge.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm space-y-1">
                                {recharge.code && (
                                  <div className="font-mono">Code: {recharge.code}</div>
                                )}
                                {recharge.invite && (
                                  <div className="font-mono text-gray-500">Invite: {recharge.invite}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                {formatDate(recharge.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {(recharge.status === 0 || recharge.status === 'pending') && (
                                <StatusUpdateDropdown 
                                  currentStatus={recharge.status} 
                                  rechargeId={recharge._id}
                                />
                              )}
                              {(recharge.status === 1 || recharge.status === 'completed') && (
                                <span className="text-green-600">✓ Completed</span>
                              )}
                              {recharge.status === 'rejected' && (
                                <span className="text-red-600">✗ Failed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Empty State */}
                  {rechargeData.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <CreditCard className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No recharges found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination?.totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing <span className="font-medium">{((pagination.page - 1) * pagination.perPage) + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(pagination.page * pagination.perPage, pagination.total)}
                          </span> of{' '}
                          <span className="font-medium">{pagination.total}</span> results
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1 || loading}
                            className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                          >
                            Previous
                          </button>
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                              pageNum = i + 1;
                            } else if (pagination.page >= pagination.totalPages - 2) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = pagination.page - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                disabled={loading}
                                className={`px-3 py-1 border rounded-lg ${
                                  pagination.page === pageNum
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages || loading}
                            className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                <div className="space-y-3">
                  {['pending', 'completed', 'rejected'].map(status => {
                    const count = rechargeData.filter(r => 
                      status === 'pending' ? (r.status === 0 || r.status === 'pending') :
                      status === 'completed' ? (r.status === 1 || r.status === 'completed') :
                      r.status === status
                    ).length;
                    const percentage = rechargeData.length ? (count / rechargeData.length * 100).toFixed(1) : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            status === 'pending' ? 'bg-yellow-500' :
                            status === 'completed' ? 'bg-green-500' :
                            status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                          <span className="text-sm capitalize">{status}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {count} ({percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {rechargeData
                    .filter(r => r.status === 0 || r.status === 'pending')
                    .slice(0, 3)
                    .map(recharge => (
                      <div key={recharge._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">₹{recharge.money}</div>
                          <div className="text-sm text-gray-500">Order: {recharge.id_order?.slice(-8)}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(recharge._id, 'completed')}
                            disabled={updating}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            {updating ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(recharge._id, 'rejected')}
                            disabled={updating}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            {updating ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{stats.totalAmount}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                      {rechargeData.length ? 
                        ((rechargeData.filter(r => r.status === 1 || r.status === 'completed').length / rechargeData.length) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Pending Amount</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      ₹{rechargeData.filter(r => r.status === 0 || r.status === 'pending').reduce((sum, r) => sum + r.money, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {rechargeData.slice(0, 5).map(recharge => (
                  <div key={recharge._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        recharge.status === 1 || recharge.status === 'completed' ? 'bg-green-500' :
                        recharge.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium">Order: {recharge.id_order}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(recharge.createdAt)} • {recharge.phone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{recharge.money}</div>
                      <StatusBadge status={recharge.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Recharge;
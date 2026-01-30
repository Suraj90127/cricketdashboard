import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateWhatsappNumber } from '../redux/reducer/adminReducer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Shield, 
  Send,
  Loader2,
  Copy,
  Globe,
  BadgeCheck,
  Users
} from "lucide-react";

const AddWhatsapp = () => {
  const [formData, setFormData] = useState({
    wnumber: "",
    countryCode: "+91",
    label: "",
    purpose: "support"
  });
  const [validationError, setValidationError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, admin, successMessage } = useSelector((state) => state.admin);

  // Purposes for WhatsApp number
  const purposes = [
    { value: "support", label: "Customer Support", icon: <MessageSquare className="w-4 h-4" />, color: "bg-blue-100 text-blue-700" },
    { value: "sales", label: "Sales", icon: <Users className="w-4 h-4" />, color: "bg-green-100 text-green-700" },
    { value: "technical", label: "Technical", icon: <Shield className="w-4 h-4" />, color: "bg-purple-100 text-purple-700" },
    { value: "general", label: "General Inquiry", icon: <Globe className="w-4 h-4" />, color: "bg-orange-100 text-orange-700" },
  ];

  // Validate phone number
  const validatePhoneNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (!cleanNumber) {
      return "Phone number is required";
    }
    
    if (cleanNumber.length !== 10) {
      return "Phone number must be 10 digits";
    }
    
    if (!/^[6-9]\d{9}$/.test(cleanNumber)) {
      return "Enter a valid Indian phone number";
    }
    
    return "";
  };

  // Handle form submission
  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationError("");
    
    // Validate phone number
    const errorMsg = validatePhoneNumber(formData.wnumber);
    if (errorMsg) {
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Format number with country code
    const formattedNumber = {
      ...formData,
      wnumber: formData.countryCode + formData.wnumber.replace(/\D/g, '')
    };

    try {
      const result = await dispatch(updateWhatsappNumber(formattedNumber)).unwrap();
      
      if (result.success) {
        // Success notification
        toast.success(
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">WhatsApp Number Updated!</p>
              <p className="text-sm text-gray-600">Successfully saved: {formattedNumber.wnumber}</p>
              {formData.label && (
                <p className="text-sm text-gray-600">Label: {formData.label}</p>
              )}
            </div>
          </div>,
          {
            autoClose: 5000,
            closeButton: true,
            progressClassName: 'bg-green-500'
          }
        );

        // Reset form after successful submission
        setFormData({
          wnumber: "",
          countryCode: "+91",
          label: "",
          purpose: "support"
        });
      }
    } catch (error) {
      // Error notification
      toast.error(
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Update Failed</p>
            <p className="text-sm text-gray-600">{error?.message || "Failed to update WhatsApp number"}</p>
          </div>
        </div>,
        {
          autoClose: 5000,
          closeButton: true,
          progressClassName: 'bg-red-500'
        }
      );
    }
  };

  // Copy WhatsApp link to clipboard
  const copyWhatsappLink = () => {
    if (!admin?.wnumber) {
      toast.info("No WhatsApp number saved yet");
      return;
    }

    const whatsappLink = `https://wa.me/${admin.wnumber.replace('+', '')}`;
    navigator.clipboard.writeText(whatsappLink)
      .then(() => {
        setCopySuccess(true);
        toast.success(
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            WhatsApp link copied to clipboard!
          </div>
        );
        
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  // Open WhatsApp directly
  const openWhatsapp = () => {
    if (!admin?.wnumber) {
      toast.info("No WhatsApp number saved yet");
      return;
    }

    const whatsappLink = `https://wa.me/${admin.wnumber.replace('+', '')}`;
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  };

  // Format displayed number
  const formatDisplayNumber = (number) => {
    if (!number) return "";
    const cleanNumber = number.replace('+91', '');
    return `${cleanNumber.slice(0, 5)} ${cleanNumber.slice(5)}`;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (name === "wnumber" && validationError) {
      setValidationError("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4 md:p-6">
      <ToastContainer 
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            WhatsApp Number Management
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage your WhatsApp contact number for customer communication and support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Update WhatsApp Number</h2>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
              {/* Country Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country Code
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white appearance-none"
                    >
                      <option value="+91">India (+91)</option>
                      <option value="+1">USA (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+61">Australia (+61)</option>
                      <option value="+971">UAE (+971)</option>
                      <option value="+65">Singapore (+65)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    WhatsApp Number
                  </label>
                  <span className="text-xs text-gray-500">10 digits required</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-700 font-medium">{formData.countryCode}</span>
                  </div>
                  <input
                    type="tel"
                    name="wnumber"
                    value={formData.wnumber}
                    onChange={handleInputChange}
                    maxLength="10"
                    className={`w-full pl-16 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-mono text-lg ${
                      validationError 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="9876543210"
                  />
                </div>
                {validationError && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{validationError}</span>
                  </div>
                )}
              </div>

              {/* Label (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Label (Optional)
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    e.g., "Support Team", "Sales Department"
                  </span>
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="Enter a label for this number"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Purpose of this Number
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {purposes.map((purpose) => (
                    <label
                      key={purpose.value}
                      className={`relative cursor-pointer ${
                        formData.purpose === purpose.value 
                          ? 'ring-2 ring-green-500 ring-offset-2' 
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="purpose"
                        value={purpose.value}
                        checked={formData.purpose === purpose.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        formData.purpose === purpose.value 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        <div className={`p-2 rounded-lg mb-2 ${purpose.color}`}>
                          {purpose.icon}
                        </div>
                        <span className="text-sm font-medium text-center">{purpose.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Update WhatsApp Number
                  </>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>
                  This number will be used across the platform for WhatsApp communication. 
                  Ensure the number is active and can receive messages.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Current Number & Actions */}
          <div className="space-y-6">
            {/* Current Number Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl p-6 md:p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck className="w-5 h-5" />
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      Active Number
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">Current WhatsApp Number</h3>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

              {admin?.wnumber ? (
                <>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl md:text-4xl font-bold tracking-tight">
                      {formatDisplayNumber(admin.wnumber)}
                    </span>
                    <span className="text-lg opacity-90">{admin.wnumber.slice(0, 3)}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/90">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Verified and active</span>
                    </div>
                    {admin.label && (
                      <div className="inline-block bg-white/20 px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-medium">{admin.label}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4 opacity-80">
                    <Phone className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-lg font-medium">No WhatsApp number added yet</p>
                  <p className="text-white/80 text-sm mt-2">
                    Add a number to enable WhatsApp communication
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {admin?.wnumber && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={openWhatsapp}
                    className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg group"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Open WhatsApp
                    <Send className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button
                    onClick={copyWhatsappLink}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl font-medium transition-all ${
                      copySuccess
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <Copy className="w-5 h-5" />
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>

                {/* WhatsApp Link Preview */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">WhatsApp Link:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm bg-white px-3 py-2 rounded-lg border truncate">
                      {admin.wnumber ? `https://wa.me/${admin.wnumber.replace('+', '')}` : 'No number set'}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* Stats & Info */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Important Information</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Privacy & Security</p>
                    <p className="text-sm text-gray-600">
                      Your WhatsApp number is securely stored and only used for communication purposes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Requirements</p>
                    <p className="text-sm text-gray-600">
                      Ensure the number is registered on WhatsApp and can receive messages.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Note</p>
                    <p className="text-sm text-gray-600">
                      Changing this number will update it across all communication channels.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated Info */}
        {admin?.updatedAt && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              Last updated: {new Date(admin.updatedAt).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddWhatsapp;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Using the popular Feather icon subset from react-icons for a clean look
import { FiX, FiCheckCircle, FiUsers, FiFileText, FiList, FiAlertCircle } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/ai/generate-email-summary`;

const EmailSummaryDrawer = ({ isOpen, onClose, threadId, companyName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && threadId) {
      fetchSummary();
    }
  }, [isOpen, threadId]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL, {
        params: { 
          threadId, 
          companyName 
        },
        headers: {
          'Content-Type': 'application/json',
          // Include your auth headers if requiredSignIn expects them
          // 'Authorization': `Bearer ${token}` 
        }
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch summary');
      }

      setData(result.summary);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch summary';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting for us': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'waiting for client': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      {/* Backdrop */}
      { isOpen && (
        <div 
          className="fixed inset-0   bg-black/40 backdrop-blur-sm z-[40] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 top-0 right-0 w-full max-w-md md:max-w-xl font-google bg-white shadow-2xl z-[50] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
       {/* Header - Minimalist Tech */}
<div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/80 bg-white/80 backdrop-blur-md">
  <div>
    <div className="text-[10px] font-bold tracking-widest text-blue-600 uppercase mb-0.5">
      AI Generated
    </div>
    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
      Email Summary
    </h2>
  </div>

  <div className="flex items-center gap-3">
    {/* Optional Contextual pill metric */}
    {companyName && (
      <span className="hidden sm:inline-block text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200/60 px-2.5 py-1 rounded-lg">
        {companyName}
      </span>
    )}
    
    <button 
      onClick={onClose}
      className="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-150"
    >
      <FiX size={20} />
    </button>
  </div>
</div>

        {/* Content Body */}
        <div className="h-[calc(100vh-73px)] overflow-y-auto p-6 space-y-6">
          
          {/* Loading State */}
         {/* Loading State - AI Pulse & Steps */}
{loading && (
  <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6 animate-pulse">
    {/* Concentric Pulsing Rings */}
    <div className="relative flex items-center justify-center w-16 h-16">
      <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping duration-1000" />
      <div className="absolute w-12 h-12 rounded-full bg-blue-500/20 animate-pulse" />
      <div className="relative w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
        <CgSpinner className="animate-spin text-white" size={18} />
      </div>
    </div>

    {/* Text Context */}
    <div className="text-center space-y-1.5 max-w-xs">
      <h4 className="text-sm font-semibold text-gray-800">Summarizing your email</h4>
      {/* <p className="text-xs text-gray-500 leading-normal">
        Reading thread history, mapping participants, and drafting your overview...
      </p> */}
    </div>

    {/* Micro breadcrumb loading track */}
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
      <span>Fetch</span>
      <span className="text-gray-300">→</span>
      <span className="text-blue-600 animate-pulse">Parse Context</span>
      <span className="text-gray-300">→</span>
      <span>Summarize</span>
    </div>
  </div>
)}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <FiAlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-semibold text-red-800">Error Generating Summary</h4>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button 
                  onClick={fetchSummary}
                  className="mt-3 text-xs bg-white text-red-700 border border-red-300 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Data Presentation State */}
          {!loading && !error && data && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Status Badge */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-sm font-medium text-gray-600">Current Status:</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(data.status)}`}>
                  {data.status || 'Unknown'}
                </span>
              </div>

              {/* Summary Text */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                  <FiFileText size={18} className="text-blue-500" />
                  <h3>Overview</h3>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                  {data.summary?.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Key Points */}
              {data.keyPoints?.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                    <FiCheckCircle size={18} className="text-emerald-500" />
                    <h3>Key Points</h3>
                  </div>
                  <ul className="space-y-2 pl-1">
                    {data.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {data.actionItems?.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                    <FiList size={18} className="text-amber-500" />
                    <h3>Action Items</h3>
                  </div>
                  <ul className="space-y-2 pl-1">
                    {data.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 bg-amber-50/40 p-2.5 rounded-lg border border-amber-100 text-sm text-gray-700">
                        <input type="checkbox" className="mt-1 rounded text-amber-500 focus:ring-amber-400" readOnly />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Participants */}
              {data.participants?.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                    <FiUsers size={18} className="text-purple-500" />
                    <h3>Participants</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-1">
                    {data.participants.map((person, idx) => (
                      <span key={idx} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-md font-medium">
                        {person}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default EmailSummaryDrawer;
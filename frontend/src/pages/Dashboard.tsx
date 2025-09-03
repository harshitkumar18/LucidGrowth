import React, { useState, useEffect } from 'react';
import { Email, SystemStatus as SystemStatusType } from '../types/email';
import { emailService } from '../services/api';
import SystemStatus from '../components/SystemStatus';
import EmailCard from '../components/EmailCard';
import ReceivingChain from '../components/ReceivingChain';
import ESPDetails from '../components/ESPDetails';
import { Mail, ArrowLeft, RefreshCw } from '../components/Icons';

const Dashboard: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatusType | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [emailsData, statusData] = await Promise.all([
        emailService.getAllEmails(),
        emailService.getSystemStatus()
      ]);
      setEmails(emailsData);
      setSystemStatus(statusData);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please check if the backend is running.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleBackToList = () => {
    setSelectedEmail(null);
  };

  const handleRefresh = () => {
    loadData();
  };

  if (loading && emails.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Email Analyzer</h2>
          <p className="text-gray-600">Connecting to backend and loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Email Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Analyze email receiving chains and detect ESP providers
          </p>
        </div>

        {selectedEmail ? (
          /* Email Detail View */
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={handleBackToList}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </button>
              <h2 className="text-2xl font-semibold text-gray-900">
                Email Analysis: {selectedEmail.subject}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ESPDetails espDetails={selectedEmail.espDetails} />
              </div>
              <div>
                <ReceivingChain chain={selectedEmail.receivingChain} />
              </div>
            </div>

            {/* Email Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">From:</span>
                  <span className="ml-2 font-mono">{selectedEmail.from}</span>
                </div>
                <div>
                  <span className="text-gray-500">To:</span>
                  <span className="ml-2 font-mono">{selectedEmail.to}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-2">{new Date(selectedEmail.date).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Message ID:</span>
                  <span className="ml-2 font-mono text-xs">{selectedEmail.messageId}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Email List View */
          <div className="space-y-6">
            {systemStatus && (
              <SystemStatus status={systemStatus} onRefresh={handleRefresh} />
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Processed Emails</h2>
                <button
                  onClick={handleRefresh}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {emails.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Emails Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Send a test email to the configured address to see analysis results here.
                  </p>
                  {systemStatus && (
                    <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-blue-800">
                        <strong>Send to:</strong> {systemStatus.testEmailAddress}
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Subject:</strong> {systemStatus.testEmailSubject}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {emails.map((email) => (
                    <EmailCard
                      key={email._id}
                      email={email}
                      onClick={() => handleEmailClick(email)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

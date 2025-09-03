import React from 'react';
import { SystemStatus as SystemStatusType } from '../types/email';
import { Mail, CheckCircle, Clock, AlertCircle, Server, Settings } from './Icons';

interface SystemStatusProps {
  status: SystemStatusType;
  onRefresh: () => void;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ status, onRefresh }) => {
  const getIMAPStatusColor = (imapStatus: string) => {
    switch (imapStatus.toLowerCase()) {
      case 'authenticated':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'connected':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'disconnected':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getIMAPStatusIcon = (imapStatus: string) => {
    switch (imapStatus.toLowerCase()) {
      case 'authenticated':
        return <CheckCircle className="w-4 h-4" />;
      case 'connected':
        return <Server className="w-4 h-4" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          Refresh Status
        </button>
      </div>

      {/* Email Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Mail className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{status.totalEmails}</div>
          <div className="text-sm text-gray-600">Total Emails</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-900">{status.processedEmails}</div>
          <div className="text-sm text-green-600">Processed</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-900">{status.pendingEmails}</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-900">{status.errorEmails}</div>
          <div className="text-sm text-red-600">Errors</div>
        </div>
      </div>

      {/* IMAP Status */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">IMAP Connection</h4>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getIMAPStatusColor(status.imapStatus)}`}>
            {getIMAPStatusIcon(status.imapStatus)}
            <span className="capitalize">{status.imapStatus}</span>
          </div>
        </div>

        {/* Test Email Configuration */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h5 className="text-sm font-medium text-blue-900 mb-2">Test Email Configuration</h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700">
                <strong>Address:</strong> {status.testEmailAddress}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700">
                <strong>Subject:</strong> {status.testEmailSubject}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h5 className="text-sm font-medium text-gray-900 mb-2">How to Test</h5>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Send an email to the address shown above</li>
          <li>Use the exact subject line specified</li>
          <li>The system will automatically detect and analyze the email</li>
          <li>Results will appear in the email list below</li>
        </ol>
      </div>
    </div>
  );
};

export default SystemStatus;

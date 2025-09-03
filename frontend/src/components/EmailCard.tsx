import React from 'react';
import { Email } from '../types/email';
import { Mail, Clock, Server, Shield, CheckCircle, AlertCircle, XCircle } from './Icons';

interface EmailCardProps {
  email: Email;
  onClick: () => void;
}

const EmailCard: React.FC<EmailCardProps> = ({ email, onClick }) => {
  const getStatusIcon = () => {
    switch (email.status) {
      case 'processed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (email.status) {
      case 'processed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {email.subject}
              </h3>
              <p className="text-sm text-gray-600">
                From: {email.from}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon()}
              <span className="capitalize">{email.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Server className="w-4 h-4" />
            <span className="truncate">{email.espType}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>{Math.round(email.espDetails.confidence * 100)}% confidence</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatDate(email.date)}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Receiving Chain: {email.receivingChain.length} hops</span>
            <span>Processed: {formatDate(email.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCard;

import React from 'react';
import { ESPDetails as ESPDetailsType } from '../types/email';
import { Shield, CheckCircle, AlertTriangle, Info } from './Icons';

interface ESPDetailsProps {
  espDetails: ESPDetailsType;
}

const ESPDetails: React.FC<ESPDetailsProps> = ({ espDetails }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.6) return <AlertTriangle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getESPBadgeColor = (provider: string) => {
    const providerLower = provider.toLowerCase();
    if (providerLower.includes('gmail')) return 'bg-red-100 text-red-800 border-red-200';
    if (providerLower.includes('outlook') || providerLower.includes('microsoft')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (providerLower.includes('yahoo')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (providerLower.includes('amazon') || providerLower.includes('ses')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (providerLower.includes('sendgrid')) return 'bg-green-100 text-green-800 border-green-200';
    if (providerLower.includes('mailgun')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (providerLower.includes('zoho')) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Email Service Provider (ESP)</h3>
      </div>

      {/* ESP Provider */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Detected Provider</h4>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getESPBadgeColor(espDetails.provider)}`}>
            {espDetails.provider}
          </div>
        </div>

        {/* Confidence Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Confidence Score</span>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${getConfidenceColor(espDetails.confidence)}`}>
              {getConfidenceIcon(espDetails.confidence)}
              <span>{Math.round(espDetails.confidence * 100)}%</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                espDetails.confidence >= 0.8 ? 'bg-green-500' : 
                espDetails.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${espDetails.confidence * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Detection Indicators */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-3">Detection Indicators</h5>
          <div className="space-y-2">
            {espDetails.indicators.length > 0 ? (
              espDetails.indicators.map((indicator, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-mono">{indicator}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No specific indicators detected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ESP Information */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-900 mb-1">What is an ESP?</h5>
            <p className="text-sm text-blue-700">
              An Email Service Provider (ESP) is the service used to send emails. 
              Common ESPs include Gmail, Outlook, Amazon SES, SendGrid, and others. 
              Our system analyzes email headers to identify which ESP was used to send each email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESPDetails;

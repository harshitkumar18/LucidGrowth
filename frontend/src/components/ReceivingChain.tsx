import React from 'react';
import { ReceivingChainHop } from '../types/email';
import { ArrowRight, Server, Clock, Shield } from './Icons';

interface ReceivingChainProps {
  chain: ReceivingChainHop[];
}

const ReceivingChain: React.FC<ReceivingChainProps> = ({ chain }) => {
  if (!chain || chain.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Server className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No receiving chain data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Server className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Email Receiving Chain</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {chain.length} hops
        </span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {chain.map((hop, index) => (
          <div key={index} className="relative flex items-start space-x-4 pb-8">
            {/* Timeline dot */}
            <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-lg">
              <span className="text-white font-semibold text-sm">{index + 1}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">{hop.server}</h4>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{hop.timestamp}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">By:</span>
                      <span className="ml-1 font-mono text-gray-900">{hop.by}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">With:</span>
                      <span className="ml-1 font-mono text-gray-900">{hop.with}</span>
                    </div>
                  </div>
                </div>

                {hop.id && hop.id !== 'Unknown' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-500">ID:</span>
                      <span className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                        {hop.id}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow for next hop */}
            {index < chain.length - 1 && (
              <div className="absolute left-6 top-12 transform -translate-x-1/2">
                <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Email traveled through <strong>{chain.length}</strong> server{chain.length !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-500">
            From sender to recipient
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReceivingChain;

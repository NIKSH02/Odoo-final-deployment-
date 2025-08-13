import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ApprovalModal = ({ facility, action, onSubmit, onClose }) => {
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');

  if (!facility || !action) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(action, action === 'reject' ? { reason, comments } : { comments });
  };

  const isApproval = action === 'approve';
  const title = isApproval ? 'Approve Facility' : 'Reject Facility';
  const submitText = isApproval ? 'Approve' : 'Reject';
  const submitButtonClass = isApproval 
    ? 'bg-black text-white hover:bg-gray-800' 
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              You are about to {action} the facility "{facility.name}".
            </p>
          </div>

          {!isApproval && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Select a reason...</option>
                <option value="incomplete_documentation">Incomplete Documentation</option>
                <option value="safety_concerns">Safety Concerns</option>
                <option value="location_issues">Location Issues</option>
                <option value="pricing_concerns">Pricing Concerns</option>
                <option value="facility_standards">Facility Standards Not Met</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isApproval ? 'Approval Comments (Optional)' : 'Additional Comments *'}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required={!isApproval}
              rows={4}
              placeholder={isApproval 
                ? 'Add any notes for the facility owner...' 
                : 'Provide detailed feedback on why this facility is being rejected...'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg transition-colors ${submitButtonClass}`}
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalModal;

'use client';

import { useState } from 'react';
import { saveProperty, unsaveProperty, createEnquiry } from '@/app/property/actions';

export function SaveButton({ propertyId, initialSaved }: { propertyId: string, initialSaved: boolean }) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggleSave = async () => {
    setLoading(true);
    if (isSaved) {
      const res = await unsaveProperty(propertyId);
      if (res.success) setIsSaved(false);
    } else {
      const res = await saveProperty(propertyId);
      if (res.success) setIsSaved(true);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={toggleSave}
      disabled={loading}
      className={`px-4 py-2 rounded-md font-medium border transition-colors ${
        isSaved 
          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
    >
      {isSaved ? '♥ Saved' : '♡ Save Property'}
    </button>
  );
}

export function EnquiryForm({ propertyId }: { propertyId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const res = await createEnquiry(formData);
    
    if (res.error) {
      setStatus('error');
      setErrorMsg(res.error);
    } else {
      setStatus('success');
      (e.target as HTMLFormElement).reset();
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200">
        Your enquiry has been sent to the host. You can view the status in your dashboard.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message to Host</label>
        <textarea 
          name="message" 
          rows={4} 
          required
          minLength={10}
          className="w-full px-3 py-2 border rounded-md resize-none"
          placeholder="Hi, I'm interested in this property. Is it available for a visit?"
        />
      </div>
      <input type="hidden" name="property_id" value={propertyId} />
      {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}
      <button 
        type="submit" 
        disabled={status === 'loading'}
        className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary-hover disabled:opacity-50 transition"
      >
        {status === 'loading' ? 'Sending...' : 'Send Enquiry'}
      </button>
    </form>
  );
}

export function ReportButton({ propertyId }: { propertyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    // We need to import reportListing. I'll add it to the imports.
    // Wait, I can't do that within this replace block easily if the import isn't at the top.
    // Let me close this block and do a separate replace for imports, OR use dynamic import.
    // I'll dynamically import it to save a tool call if possible, or I'll just import it at the top.
    // Actually, I'll close this and then replace the top of the file.
    // Let's just finish the form here first.
    
    const { reportListing } = await import('@/app/property/actions');
    const formData = new FormData(e.currentTarget);
    formData.append('property_id', propertyId);
    
    const res = await reportListing(formData);
    
    if (res.error) {
      setStatus('error');
      setErrorMsg(res.error);
    } else {
      setStatus('success');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm text-gray-500 hover:text-red-600 underline underline-offset-2 transition-colors mt-4 inline-block"
      >
        Report this listing
      </button>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200 mt-4 text-sm">
        Report submitted successfully. Our team will review this.
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="font-bold text-gray-900 mb-2">Report Listing</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <select name="reason" required className="w-full px-3 py-2 border rounded-md text-sm bg-white">
            <option value="">Select a reason...</option>
            <option value="Fake Listing">Fake Listing</option>
            <option value="Incorrect Information">Incorrect Information</option>
            <option value="Offensive Content">Offensive Content</option>
            <option value="Fraud / Scam">Fraud / Scam</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
          <textarea 
            name="description" 
            rows={2} 
            className="w-full px-3 py-2 border rounded-md resize-none text-sm bg-white"
            placeholder="Please provide more details (optional)"
          />
        </div>
        {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}
        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex-1"
          >
            {status === 'loading' ? 'Submitting...' : 'Submit Report'}
          </button>
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

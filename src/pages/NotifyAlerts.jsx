import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, CheckCircle2, MapPin } from 'lucide-react';
import { contactService } from '../services/api';

const predefinedTemplates = [
  "🚨 WILDLIFE ALERT: Leopard sighted near your area. Please stay indoors and secure livestock.",
  "🐘 WILDLIFE ALERT: Elephant herd crossing the main road. Drive carefully and avoid the area.",
  "⚠️ WARNING: Forest department is conducting patrols today. Please avoid entering the restricted forest zones.",
  "ℹ️ INFO: A recently conflicted animal has been safely relocated from your vicinity. The area is now safe."
];

const NotifyAlerts = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for sending SMS
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(predefinedTemplates[0]);
  const [isSending, setIsSending] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await contactService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = () => {
    if (!selectedGroupId || !selectedTemplate) return;
    setIsSending(true);
    
    // Simulate network delay
    setTimeout(() => {
      setIsSending(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      setSelectedGroupId('');
    }, 1500);
  };

  const selectedGroup = groups.find(g => g.id.toString() === selectedGroupId.toString());

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notify & Alerts</h1>
          <p className="text-gray-500 mt-2">Broadcast SMS alerts instantly to registered Alert Zones.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col h-full">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Broadcast SMS Alert</h2>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Target Region / Alert Zone</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? 'Loading zones...' : '-- Choose an alert zone --'}</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.members?.length || 0} members)</option>
              ))}
            </select>
          </div>

          {selectedGroup && (
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center space-x-2 text-blue-800 font-medium mb-1">
                <MapPin className="w-4 h-4" />
                <span>Targeting: {selectedGroup.name}</span>
              </div>
              <p className="text-sm text-blue-600/80">Message will be sent to {selectedGroup.members?.length || 0} registered contacts.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Message Template</label>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {predefinedTemplates.map((template, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-xl border text-sm cursor-pointer transition-all ${selectedTemplate === template ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                >
                  {template}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-auto">
            <button
              onClick={handleSendSMS}
              disabled={!selectedGroupId || isSending}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 relative overflow-hidden"
            >
              {isSending ? (
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Broadcasting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Send Broadcast SMS</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-5000 bg-white shadow-2xl border border-gray-100 rounded-2xl p-4 flex items-center space-x-4 pr-12"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold">SMS Sent Successfully!</h4>
              <p className="text-sm text-gray-500">The alert has been dispatched to all members in the group.</p>
            </div>
            <button onClick={() => setShowToast(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotifyAlerts;

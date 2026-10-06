import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UploadCloud, Plus, Trash2, Edit2, Search, FileSpreadsheet, MapPin, X, Check, BookOpen } from 'lucide-react';
import * as XLSX from 'xlsx';
import { contactService } from '../services/api';

const CommunityDirectory = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Group creation state
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [tempMembers, setTempMembers] = useState([]);
  const fileInputRef = useRef(null);

  // View/Edit state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberData, setEditMemberData] = useState({ name: '', phone: '' });
  const [newMemberData, setNewMemberData] = useState({ name: '', phone: '' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await contactService.getGroups();
      setGroups(data);
      if (selectedGroup) {
        setSelectedGroup(data.find(g => g.id === selectedGroup.id));
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Group Creation Logic ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      const parsedMembers = [];
      data.forEach((row, index) => {
        if (index === 0 && isNaN(parseInt(row[0]))) return; 
        if (row[0] && row[1]) {
          parsedMembers.push({ phone_number: String(row[0]).trim(), name: String(row[1]).trim() });
        }
      });

      setTempMembers([...tempMembers, ...parsedMembers]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleAddTempMember = () => {
    if (newMemberName && newMemberPhone) {
      setTempMembers([...tempMembers, { name: newMemberName, phone_number: newMemberPhone }]);
      setNewMemberName('');
      setNewMemberPhone('');
    }
  };

  const handleRemoveTempMember = (index) => {
    setTempMembers(tempMembers.filter((_, i) => i !== index));
  };

  const handleSaveNewGroup = async () => {
    if (newGroupName) {
      try {
        await contactService.createGroup({ name: newGroupName, members: tempMembers });
        setIsCreatingGroup(false);
        setNewGroupName('');
        setTempMembers([]);
        fetchGroups();
      } catch (error) {
        console.error('Failed to save group:', error);
      }
    }
  };

  const handleDeleteGroup = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this group and all its contacts?')) {
      try {
        await contactService.deleteGroup(id);
        if (selectedGroup?.id === id) setSelectedGroup(null);
        fetchGroups();
      } catch (error) {
        console.error('Failed to delete group:', error);
      }
    }
  };

  // --- Member Management Logic ---
  const handleAddMemberToGroup = async () => {
    if (newMemberData.name && newMemberData.phone && selectedGroup) {
      try {
        await contactService.addMember(selectedGroup.id, { 
          name: newMemberData.name, 
          phone_number: newMemberData.phone 
        });
        setNewMemberData({ name: '', phone: '' });
        fetchGroups();
      } catch (error) {
        console.error('Failed to add member:', error);
      }
    }
  };

  const startEditing = (member) => {
    setEditingMemberId(member.id);
    setEditMemberData({ name: member.name, phone: member.phone_number });
  };

  const saveEdit = async (id) => {
    try {
      await contactService.updateMember(id, { 
        name: editMemberData.name, 
        phone_number: editMemberData.phone 
      });
      setEditingMemberId(null);
      fetchGroups();
    } catch (error) {
      console.error('Failed to update member:', error);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Remove this person from the group?')) {
      try {
        await contactService.deleteMember(id);
        fetchGroups();
      } catch (error) {
        console.error('Failed to delete member:', error);
      }
    }
  };

  const filteredMembers = selectedGroup?.members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.phone_number.includes(searchQuery)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-600" />
            Community Directory
          </h1>
          <p className="text-gray-500 mt-2">Manage contact zones and resident details for safety broadcasts.</p>
        </div>
        <button 
          onClick={() => setIsCreatingGroup(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Contact Zone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Groups List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800">Alert Zones</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="text-center py-10 text-gray-400">Loading zones...</div>
            ) : groups.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No zones created yet.</div>
            ) : (
              groups.map(group => (
                <div 
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all flex justify-between items-center group/item
                    ${selectedGroup?.id === group.id ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
                >
                  <div>
                    <h3 className={`font-semibold ${selectedGroup?.id === group.id ? 'text-emerald-900' : 'text-gray-800'}`}>{group.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{group.members?.length || 0} members</p>
                  </div>
                  <button onClick={(e) => handleDeleteGroup(group.id, e)} className="opacity-0 group-hover/item:opacity-100 text-red-400 hover:text-red-600 p-2 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Members List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {selectedGroup ? (
            <>
              <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-white z-10 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    {selectedGroup.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Total Contacts: {selectedGroup.members?.length || 0}</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search people..." 
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Add New Member row */}
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-3 items-center">
                <input 
                  type="text" 
                  placeholder="Name" 
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  value={newMemberData.name}
                  onChange={e => setNewMemberData({...newMemberData, name: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Phone Number" 
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  value={newMemberData.phone}
                  onChange={e => setNewMemberData({...newMemberData, phone: e.target.value})}
                />
                <button 
                  onClick={handleAddMemberToGroup}
                  disabled={!newMemberData.name || !newMemberData.phone}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  Add Person
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {filteredMembers?.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No contacts found in this zone.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-sm text-gray-500">
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold">Phone Number</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers?.map(member => (
                        <tr key={member.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 group/row transition-colors">
                          <td className="py-3">
                            {editingMemberId === member.id ? (
                              <input 
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                value={editMemberData.name}
                                onChange={e => setEditMemberData({...editMemberData, name: e.target.value})}
                              />
                            ) : (
                              <span className="font-medium text-gray-800">{member.name}</span>
                            )}
                          </td>
                          <td className="py-3 text-gray-600">
                            {editingMemberId === member.id ? (
                              <input 
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                value={editMemberData.phone}
                                onChange={e => setEditMemberData({...editMemberData, phone: e.target.value})}
                              />
                            ) : (
                              <span>{member.phone_number}</span>
                            )}
                          </td>
                          <td className="py-3 text-right space-x-2">
                            {editingMemberId === member.id ? (
                              <>
                                <button onClick={() => saveEdit(member.id)} className="text-green-600 hover:text-green-700 p-1">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingMemberId(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditing(member)} className="text-blue-500 hover:text-blue-700 p-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteMember(member.id)} className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center h-full">
              <Users className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">No Zone Selected</h3>
              <p className="text-sm mt-1">Select an alert zone from the left sidebar to view or manage its contacts.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {isCreatingGroup && (
          <div className="fixed inset-0 z-5000 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreatingGroup(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white">
                <h2 className="text-xl font-bold">Create New Alert Zone</h2>
                <button onClick={() => setIsCreatingGroup(false)} className="hover:bg-emerald-700 p-1 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone / Village Name</label>
                  <input type="text" placeholder="e.g. Masinagudi Town" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Bulk Add via Excel</h3>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition-colors bg-white">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-500 mb-1" />
                      <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> Excel</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Manually Add Contacts</h3>
                  <div className="flex gap-2 mb-2">
                    <input type="text" placeholder="Name" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
                    <input type="text" placeholder="Phone" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" value={newMemberPhone} onChange={(e) => setNewMemberPhone(e.target.value)} />
                    <button onClick={handleAddTempMember} className="bg-gray-800 text-white px-3 rounded-lg"><Plus className="w-4 h-4"/></button>
                  </div>
                  
                  {tempMembers.length > 0 && (
                    <div className="mt-4 border border-gray-200 rounded-lg bg-white overflow-hidden max-h-40 overflow-y-auto">
                      {tempMembers.map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center px-3 py-2 border-b border-gray-100 last:border-0 text-sm">
                          <span>{m.name} - {m.phone_number}</span>
                          <button onClick={() => handleRemoveTempMember(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setIsCreatingGroup(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors">Cancel</button>
                <button onClick={handleSaveNewGroup} disabled={!newGroupName} className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">Save Zone ({tempMembers.length} Contacts)</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityDirectory;

import React, { useState, useEffect, useMemo } from 'react';
import { conflictCaseService, manualRecordService } from '../services/api';
import ManualRecordDialog from '../components/Records/ManualRecordDialog';
import EditConflictDialog from '../components/Conflict/EditConflictDialog';
import { Plus, Search, Filter, FileText, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const getThreatColor = (level) => {
  switch (level) {
    case 'Low': return 'bg-green-100 text-green-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'High': return 'bg-orange-100 text-orange-800';
    case 'Critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const Records = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const [conflictCases, manualRecords] = await Promise.all([
        conflictCaseService.getAllConflictCases(),
        manualRecordService.getAllManualRecords()
      ]);

      // Tag records to identify their source if needed
      const mappedConflicts = conflictCases.map(c => ({ ...c, source: 'Map' }));
      const mappedManual = manualRecords.map(m => ({ ...m, source: 'Manual' }));

      // Merge both arrays
      setRecords([...mappedConflicts, ...mappedManual]);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedRecords = useMemo(() => {
    let result = records;

    // Filter by type
    if (filterType !== 'All') {
      result = result.filter(r => r.case_type === filterType);
    }

    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(r => 
        (r.location_name && r.location_name.toLowerCase().includes(lowerSearch)) ||
        (r.description && r.description.toLowerCase().includes(lowerSearch)) ||
        (r.case_type && r.case_type.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        // combine date and time for sorting
        aVal = new Date(`${a.date}T${a.time}`).getTime();
        bVal = new Date(`${b.date}T${b.time}`).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [records, searchTerm, filterType, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedRecords.length / itemsPerPage);
  const paginatedRecords = filteredAndSortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddClick = () => {
    setSelectedRecord(null);
    setDialogOpen(true);
  };

  const handleRowClick = (record) => {
    if (record.source === 'Manual') {
      setSelectedRecord(record);
      setDialogOpen(true);
    } else if (record.source === 'Map') {
      setSelectedConflict(record);
      setConflictDialogOpen(true);
    }
  };

  const handleDialogSubmit = async (formData) => {
    try {
      if (selectedRecord) {
        await manualRecordService.updateManualRecord(selectedRecord.id, formData);
      } else {
        await manualRecordService.createManualRecord(formData);
      }
      await fetchRecords();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save manual record:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await manualRecordService.deleteManualRecord(id);
        await fetchRecords();
        setDialogOpen(false);
      } catch (error) {
        console.error('Failed to delete record:', error);
      }
    }
  };

  const handleConflictSubmit = async (formData) => {
    try {
      if (selectedConflict) {
        await conflictCaseService.updateConflictCase(selectedConflict.id, formData);
        await fetchRecords();
        setConflictDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to update conflict case:', error);
    }
  };

  const handleConflictDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this conflict case?')) {
      try {
        await conflictCaseService.deleteConflictCase(id);
        await fetchRecords();
        setConflictDialogOpen(false);
      } catch (error) {
        console.error('Failed to delete conflict case:', error);
      }
    }
  };

  // Get unique case types for filter
  const uniqueCaseTypes = ['All', ...new Set(records.map(r => r.case_type))];

  return (
    <div className="h-full p-8 flex flex-col bg-gray-50 overflow-hidden">
      
      <PageHeader
        icon={FileText}
        title="Records Management"
        description="View and manage all recorded wildlife conflicts and incidents."
        stats={[{ label: 'Total records', value: records.length }]}
      >
        <Button onClick={handleAddClick} className="bg-white text-emerald-900 hover:bg-emerald-50">
          <Plus className="w-4 h-4" />
          Add Record
        </Button>
      </PageHeader>

      {/* Controls: Search and Filter */}
      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by location, description, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 rounded-xl bg-white pl-10 shadow-sm"
          />
        </div>
        <div className="relative">
          <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none"
          >
            {uniqueCaseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <Card className="flex-1 gap-0 overflow-hidden rounded-2xl p-0 shadow-sm">
        {loading ? (
          <div className="flex-1 space-y-3 p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredAndSortedRecords.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">No records found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('location_name')}>
                      Location
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('case_type')}>
                      Type
                    </th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('date')}>
                      Date & Time
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('threat_level')}>
                      Threat Level
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('source')}>
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRecords.map((record) => (
                    <tr 
                      key={record.id} 
                      onClick={() => handleRowClick(record)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {record.location_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {record.case_type}
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                        {record.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{record.date}</span>
                          <span className="text-xs text-gray-400">{record.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`font-bold ${getThreatColor(record.threat_level)}`}>
                          {record.threat_level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={record.source === 'Map' ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'}>
                          {record.source}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between mt-auto">
              <span className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedRecords.length)} of {filteredAndSortedRecords.length} records
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1 rounded bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <ManualRecordDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        onDelete={handleDelete}
        initialData={selectedRecord}
      />

      <EditConflictDialog
        isOpen={conflictDialogOpen}
        onClose={() => setConflictDialogOpen(false)}
        onSubmit={handleConflictSubmit}
        onDelete={handleConflictDelete}
        initialData={selectedConflict}
      />
    </div>
  );
};

export default Records;

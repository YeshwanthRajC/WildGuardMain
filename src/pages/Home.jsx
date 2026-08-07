import React, { useState, useEffect } from 'react';
import LiveMap from '../components/Map/LiveMap';
import EditHotspotDialog from '../components/Hotspot/EditHotspotDialog';
import EditConflictDialog from '../components/Conflict/EditConflictDialog';
import { hotspotService, conflictCaseService } from '../services/api';
import { Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [hotspots, setHotspots] = useState([]);
  const [conflictCases, setConflictCases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddMode, setIsAddMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [newMarkerLocation, setNewMarkerLocation] = useState(null);

  const [isAddConflictMode, setIsAddConflictMode] = useState(false);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [newConflictLocation, setNewConflictLocation] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hotspotsData, conflictData] = await Promise.all([
        hotspotService.getAllHotspots(),
        conflictCaseService.getAllConflictCases()
      ]);
      setHotspots(hotspotsData);
      setConflictCases(conflictData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (latlng, isConflict) => {
    if (isConflict) {
      setNewConflictLocation(latlng);
      setSelectedConflict(null);
      setConflictDialogOpen(true);
      setIsAddConflictMode(false);
    } else if (isAddMode) {
      setNewMarkerLocation(latlng);
      setSelectedHotspot(null);
      setDialogOpen(true);
      setIsAddMode(false);
    }
  };

  const handleEditClick = (hotspot) => {
    setSelectedHotspot(hotspot);
    setNewMarkerLocation(null);
    setDialogOpen(true);
  };

  const handleConflictEditClick = (conflict) => {
    setSelectedConflict(conflict);
    setNewConflictLocation(null);
    setConflictDialogOpen(true);
  };

  const handleDialogSubmit = async (animals) => {
    try {
      if (selectedHotspot) {
        // Edit existing
        await hotspotService.updateHotspotAnimals(selectedHotspot.id, animals);
      } else if (newMarkerLocation) {
        // Create new
        // The API currently accepts a single animal in create, we'll create with the first and update the rest if needed
        // Or we can modify our controller slightly. Let's just create one then update if > 1.
        const res = await hotspotService.createHotspot({
          latitude: newMarkerLocation.lat,
          longitude: newMarkerLocation.lng,
          animalName: animals[0]
        });
        
        if (animals.length > 1) {
           await hotspotService.updateHotspotAnimals(res.id, animals);
        }
      }
      await fetchData();
    } catch (error) {
      console.error('Failed to save hotspot:', error);
    } finally {
      setDialogOpen(false);
      setSelectedHotspot(null);
      setNewMarkerLocation(null);
    }
  };

  const handleConflictSubmit = async (formData) => {
    try {
      if (selectedConflict) {
        await conflictCaseService.updateConflictCase(selectedConflict.id, formData);
      } else if (newConflictLocation) {
        await conflictCaseService.createConflictCase({
          ...formData,
          latitude: newConflictLocation.lat,
          longitude: newConflictLocation.lng
        });
      }
      await fetchData();
    } catch (error) {
      console.error('Failed to save conflict case:', error);
    } finally {
      setConflictDialogOpen(false);
      setSelectedConflict(null);
      setNewConflictLocation(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotspot?')) {
      try {
        await hotspotService.deleteHotspot(id);
        await fetchData();
        setDialogOpen(false);
      } catch (error) {
        console.error('Failed to delete hotspot:', error);
      }
    }
  };

  const handleConflictDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this conflict case?')) {
      try {
        await conflictCaseService.deleteConflictCase(id);
        await fetchData();
        setConflictDialogOpen(false);
      } catch (error) {
        console.error('Failed to delete conflict case:', error);
      }
    }
  };

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-green-500" />
        </div>
      )}

      {/* Map Component */}
      <LiveMap 
        hotspots={hotspots}
        conflictCases={conflictCases}
        onMapClick={handleMapClick}
        onEditClick={handleEditClick}
        onConflictEditClick={handleConflictEditClick}
        isAddMode={isAddMode}
        isAddConflictMode={isAddConflictMode}
      />

      {/* Hotspot Panel - Floating UI */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col space-y-4 items-end">
        
        {/* Hotspot Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsAddMode(!isAddMode);
              if (isAddConflictMode) setIsAddConflictMode(false);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl shadow-xl font-medium transition-all duration-300 ${
              isAddMode 
                ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
            }`}
          >
            <Plus className={`w-5 h-5 transition-transform duration-300 ${isAddMode ? 'rotate-45' : ''}`} />
            <span>{isAddMode ? 'Cancel Placement' : 'Add Hotspot'}</span>
          </motion.button>
          
          <AnimatePresence>
            {isAddMode && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="absolute top-14 right-0 bg-white px-4 py-3 rounded-xl shadow-lg border border-green-100 text-sm text-gray-700 w-48 text-center"
               >
                 Click on the map to place a green hotspot marker.
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Conflict Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsAddConflictMode(!isAddConflictMode);
              if (isAddMode) setIsAddMode(false);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl shadow-xl font-medium transition-all duration-300 ${
              isAddConflictMode 
                ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span>{isAddConflictMode ? 'Cancel Placement' : 'Add Conflict Case'}</span>
          </motion.button>

          <AnimatePresence>
            {isAddConflictMode && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="absolute top-14 right-0 bg-white px-4 py-3 rounded-xl shadow-lg border border-red-100 text-sm text-gray-700 w-48 text-center"
               >
                 Click on the map to place a red conflict marker.
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <EditHotspotDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        onDelete={handleDelete}
        initialData={selectedHotspot}
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

export default Home;

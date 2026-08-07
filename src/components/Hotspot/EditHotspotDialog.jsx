import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

const EditHotspotDialog = ({ isOpen, onClose, onSubmit, onDelete, initialData }) => {
  const [animals, setAnimals] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData && initialData.hotspot_animals) {
        setAnimals(initialData.hotspot_animals.map(a => a.animal_name));
      } else {
        setAnimals([]);
      }
      setInputValue('');
    }
  }, [isOpen, initialData]);

  const handleAddAnimal = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !animals.includes(inputValue.trim())) {
      setAnimals([...animals, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveAnimal = (animalToRemove) => {
    setAnimals(animals.filter(a => a !== animalToRemove));
  };

  const handleSubmit = () => {
    if (animals.length === 0) {
      alert("Please add at least one animal.");
      return;
    }
    onSubmit(animals);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? 'Edit Hotspot' : 'New Hotspot'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleAddAnimal} className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Detected Wildlife Species
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. Elephant, Tiger..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-800"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </button>
              </div>
            </form>

            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 min-h-[120px]">
              {animals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {animals.map((animal, idx) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={idx}
                      className="bg-white border border-green-200 shadow-sm text-gray-800 px-3 py-1.5 rounded-lg flex items-center space-x-2"
                    >
                      <span className="font-medium text-sm">{animal}</span>
                      <button
                        onClick={() => handleRemoveAnimal(animal)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400 italic">
                  No species added yet.
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
            {initialData ? (
              <button
                onClick={() => onDelete(initialData.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center text-sm font-medium"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Hotspot
              </button>
            ) : (
              <div /> // Spacer
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={animals.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Save Records
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditHotspotDialog;

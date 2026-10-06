import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { Edit2 } from 'lucide-react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon paths in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Create custom green marker icon for hotspots
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create custom red marker icon for conflict cases
const conflictIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
const MapClickHandler = ({ onMapClick, isAddMode, isAddConflictMode }) => {
  useMapEvents({
    click(e) {
      if (isAddMode || isAddConflictMode) {
        onMapClick(e.latlng, isAddConflictMode);
      }
    },
  });
  return null;
};

const getThreatColor = (level) => {
  switch (level) {
    case 'Low': return 'bg-green-100 text-green-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'High': return 'bg-orange-100 text-orange-800';
    case 'Critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const LiveMap = ({ hotspots = [], conflictCases = [], onMapClick, onEditClick, onConflictEditClick, isAddMode, isAddConflictMode }) => {
  // Center map on India
  const center = [20.5937, 78.9629];
  const zoom = 5;

  const cursorStyle = isAddMode || isAddConflictMode ? 'cursor-crosshair' : '';

  return (
    <div className={`w-full h-full ${cursorStyle}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="OpenStreetMap (Default)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrain Map">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite Map (Hybrid)">
            <LayerGroup>
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              />
            </LayerGroup>
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapClickHandler onMapClick={onMapClick} isAddMode={isAddMode} isAddConflictMode={isAddConflictMode} />

        {/* Hotspot Markers (Green) */}
        {hotspots.map((hotspot) => (
          <Marker 
            key={`hotspot-${hotspot.id}`} 
            position={[hotspot.latitude, hotspot.longitude]}
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-50">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 border-b pb-2">Hotspot Details</h3>
                
                <div className="mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Detected Wildlife</span>
                  {hotspot.hotspot_animals && hotspot.hotspot_animals.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {hotspot.hotspot_animals.map(a => (
                        <span key={a.id} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          {a.animal_name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No data</span>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-4 grid grid-cols-2 gap-2">
                  <div>
                    <span className="block font-semibold">Lat:</span> 
                    {hotspot.latitude.toFixed(4)}
                  </div>
                  <div>
                    <span className="block font-semibold">Lng:</span> 
                    {hotspot.longitude.toFixed(4)}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(hotspot);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-1.5 rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Records</span>
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Conflict Markers (Red) */}
        {conflictCases.map((conflict) => (
          <Marker 
            key={`conflict-${conflict.id}`} 
            position={[conflict.latitude, conflict.longitude]}
            icon={conflictIcon}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-55">
                <div className="flex justify-between items-start mb-2 border-b pb-2">
                  <h3 className="font-semibold text-lg text-gray-800">Conflict Case</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${getThreatColor(conflict.threat_level)}`}>
                    {conflict.threat_level}
                  </span>
                </div>
                
                <div className="mb-2">
                  <span className="font-medium text-sm text-gray-800 block">{conflict.case_type}</span>
                  <span className="text-xs text-gray-500 block truncate">{conflict.location_name}</span>
                </div>

                <div className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="block mb-1 font-medium text-gray-700">Description:</span>
                  <p className="italic line-clamp-2">{conflict.description || 'No description provided.'}</p>
                </div>

                <div className="text-xs text-gray-500 mb-4 grid grid-cols-2 gap-2 border-t pt-2 mt-2">
                  <div>
                    <span className="block font-semibold">Date:</span> 
                    {conflict.date}
                  </div>
                  <div>
                    <span className="block font-semibold">Time:</span> 
                    {conflict.time}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onConflictEditClick(conflict);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 py-1.5 rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Case</span>
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;

import supabase from '../config/supabase.js';
import { initMQTT, subscribeToNewDevice } from '../services/mqttService.js';

const seedPrototypeNode = async () => {
  const prototypeDevice = {
    device_name: 'Node 1',
    location: 'Prototype Node',
    latitude: 20.5937, // default to center
    longitude: 78.9629,
    mqtt_broker: 'broker.emqx.io',
    mqtt_port: 1883,
    mqtt_topic: 'elephantalert/yeshwanthraj/project',
    status: 'Online',
    last_service_date: new Date().toISOString().split('T')[0],
  };

  // calculate next service date (+2 months)
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 2);
  prototypeDevice.next_service_date = nextDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('edge_devices')
    .insert([prototypeDevice])
    .select()
    .single();

  if (error) {
    console.error('Error seeding prototype node:', error);
    return null;
  }
  
  // Re-init MQTT to catch the new seeded device
  initMQTT();
  return data;
};

// GET all edge devices
export const getAllEdgeDevices = async (req, res) => {
  try {
    let { data, error } = await supabase
      .from('edge_devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Auto-seed if empty
    if (data.length === 0) {
      const seededDevice = await seedPrototypeNode();
      if (seededDevice) {
        data = [seededDevice];
      }
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching edge devices:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// POST a new edge device
export const createEdgeDevice = async (req, res) => {
  const deviceData = req.body;

  try {
    if (deviceData.last_service_date) {
      const nextDate = new Date(deviceData.last_service_date);
      nextDate.setMonth(nextDate.getMonth() + 2);
      deviceData.next_service_date = nextDate.toISOString().split('T')[0];
    }
    
    if (!deviceData.status) {
      deviceData.status = 'Unknown';
    }

    const { data, error } = await supabase
      .from('edge_devices')
      .insert([deviceData])
      .select()
      .single();

    if (error) throw error;

    subscribeToNewDevice(data);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating edge device:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT to update an edge device (e.g. mark as serviced)
export const updateEdgeDevice = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  updates.updated_at = new Date().toISOString();

  if (updates.last_service_date) {
    const nextDate = new Date(updates.last_service_date);
    nextDate.setMonth(nextDate.getMonth() + 2);
    updates.next_service_date = nextDate.toISOString().split('T')[0];
    // if it was marked as serviced, update status
    updates.status = 'Online';
  }

  try {
    const { data, error } = await supabase
      .from('edge_devices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If marked as serviced, we should also delete existing maintenance notifications for this device
    if (updates.last_service_date) {
       await supabase
        .from('notifications')
        .delete()
        .eq('device_id', id)
        .eq('type', 'MAINTENANCE_ALERT');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating edge device:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE an edge device
export const deleteEdgeDevice = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('edge_devices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Edge device deleted successfully' });
  } catch (error) {
    console.error('Error deleting edge device:', error.message);
    res.status(500).json({ error: error.message });
  }
};

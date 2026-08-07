import supabase from '../config/supabase.js';

export const checkMaintenance = async () => {
  try {
    // Fetch devices where next_service_date is less than or equal to today
    // and status is not already "Maintenance Overdue" (or we just generate a notification if one doesn't exist today)
    const today = new Date().toISOString().split('T')[0];
    
    const { data: devices, error: devError } = await supabase
      .from('edge_devices')
      .select('*')
      .lte('next_service_date', today);

    if (devError) throw devError;

    if (!devices || devices.length === 0) return;

    for (const device of devices) {
      // Check if a maintenance notification already exists and is unread for this device
      const { data: existingNotifs, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('device_id', device.id)
        .eq('type', 'MAINTENANCE_ALERT')
        .eq('read_status', false);

      if (notifError) {
        console.error('Error checking existing notifications:', notifError);
        continue;
      }

      // If no unread maintenance notification exists, create one
      if (!existingNotifs || existingNotifs.length === 0) {
        const message = `Maintenance Required for ${device.device_name} at ${device.location}. Status: Maintenance Overdue.`;
        
        await supabase.from('notifications').insert([{
          type: 'MAINTENANCE_ALERT',
          device_id: device.id,
          device_name: device.device_name,
          location: device.location,
          message: message
        }]);

        // Optionally update the device status to 'Maintenance Overdue'
        await supabase
          .from('edge_devices')
          .update({ status: 'Maintenance Overdue' })
          .eq('id', device.id);
      }
    }
  } catch (error) {
    console.error('Maintenance check failed:', error);
  }
};

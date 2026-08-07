import supabase from '../config/supabase.js';
import { checkMaintenance } from '../services/maintenanceService.js';

// GET all notifications (unread first, then by date)
export const getNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('read_status', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT mark notification as read
export const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_status: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error marking notification read:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE a notification
export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// POST manually trigger maintenance check
export const triggerMaintenanceCheck = async (req, res) => {
  try {
    await checkMaintenance();
    res.status(200).json({ message: 'Maintenance check completed' });
  } catch (error) {
    console.error('Error checking maintenance:', error.message);
    res.status(500).json({ error: error.message });
  }
};

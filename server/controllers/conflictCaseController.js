import supabase from '../config/supabase.js';

// GET all conflict map cases
export const getAllConflictCases = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conflict_map_cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching conflict map cases:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// POST a new conflict map case
export const createConflictCase = async (req, res) => {
  const { latitude, longitude, location_name, case_type, description, date, time, threat_level } = req.body;

  if (!latitude || !longitude || !location_name || !case_type || !date || !time || !threat_level) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const { data, error } = await supabase
      .from('conflict_map_cases')
      .insert([{ latitude, longitude, location_name, case_type, description, date, time, threat_level }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating conflict map case:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT to update a conflict map case
export const updateConflictCase = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  updates.updated_at = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('conflict_map_cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating conflict map case:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE a conflict map case
export const deleteConflictCase = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('conflict_map_cases')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Conflict map case deleted successfully' });
  } catch (error) {
    console.error('Error deleting conflict map case:', error.message);
    res.status(500).json({ error: error.message });
  }
};

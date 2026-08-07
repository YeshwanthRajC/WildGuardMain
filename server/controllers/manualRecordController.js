import supabase from '../config/supabase.js';

// GET all manual records
export const getAllManualRecords = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('manual_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching manual records:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// POST a new manual record
export const createManualRecord = async (req, res) => {
  const { location_name, case_type, description, date, time, threat_level } = req.body;

  if (!location_name || !case_type || !date || !time || !threat_level) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const { data, error } = await supabase
      .from('manual_records')
      .insert([{ location_name, case_type, description, date, time, threat_level }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating manual record:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT to update a manual record
export const updateManualRecord = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  updates.updated_at = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('manual_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating manual record:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE a manual record
export const deleteManualRecord = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('manual_records')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Manual record deleted successfully' });
  } catch (error) {
    console.error('Error deleting manual record:', error.message);
    res.status(500).json({ error: error.message });
  }
};

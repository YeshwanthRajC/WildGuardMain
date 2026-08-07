import supabase from '../config/supabase.js';

// GET all hotspots with their associated animals
export const getAllHotspots = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('hotspots')
      .select('*, hotspot_animals(id, animal_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching hotspots:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// POST a new hotspot with initial animal
export const createHotspot = async (req, res) => {
  const { latitude, longitude, animalName } = req.body;

  if (!latitude || !longitude || !animalName) {
    return res.status(400).json({ error: 'Latitude, longitude, and animalName are required.' });
  }

  try {
    // 1. Insert hotspot
    const { data: hotspotData, error: hotspotError } = await supabase
      .from('hotspots')
      .insert([{ latitude, longitude }])
      .select()
      .single();

    if (hotspotError) throw hotspotError;

    // 2. Insert initial animal for this hotspot
    const { data: animalData, error: animalError } = await supabase
      .from('hotspot_animals')
      .insert([{ hotspot_id: hotspotData.id, animal_name: animalName }])
      .select();

    if (animalError) throw animalError;

    // 3. Return combined data
    const newHotspot = {
      ...hotspotData,
      hotspot_animals: animalData
    };

    res.status(201).json(newHotspot);
  } catch (error) {
    console.error('Error creating hotspot:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT to update a hotspot's animals (add or overwrite list)
// For simplicity, we can accept an array of animal names, delete existing ones, and insert the new list.
export const updateHotspotAnimals = async (req, res) => {
  const { id } = req.params;
  const { animals } = req.body; // Array of strings e.g. ["Elephant", "Tiger"]

  if (!Array.isArray(animals)) {
    return res.status(400).json({ error: 'Animals must be an array of strings.' });
  }

  try {
    // 1. Delete existing animals for this hotspot
    const { error: deleteError } = await supabase
      .from('hotspot_animals')
      .delete()
      .eq('hotspot_id', id);

    if (deleteError) throw deleteError;

    // 2. Insert new list if not empty
    let newAnimals = [];
    if (animals.length > 0) {
      const inserts = animals.map(animal_name => ({
        hotspot_id: id,
        animal_name
      }));

      const { data, error: insertError } = await supabase
        .from('hotspot_animals')
        .insert(inserts)
        .select();

      if (insertError) throw insertError;
      newAnimals = data;
    }

    // 3. Update the hotspot's updated_at timestamp
    const { error: updateError } = await supabase
      .from('hotspots')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(200).json({ hotspot_id: id, hotspot_animals: newAnimals });
  } catch (error) {
    console.error('Error updating hotspot animals:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE a hotspot
export const deleteHotspot = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('hotspots')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Hotspot deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotspot:', error.message);
    res.status(500).json({ error: error.message });
  }
};

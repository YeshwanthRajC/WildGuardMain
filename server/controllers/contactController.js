import supabase from '../config/supabase.js';

export const getGroups = async (req, res) => {
  try {
    const { data: groups, error: groupsError } = await supabase
      .from('alert_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (groupsError) throw groupsError;

    const { data: contacts, error: contactsError } = await supabase
      .from('alert_contacts')
      .select('*');

    if (contactsError) throw contactsError;

    const groupsWithMembers = groups.map(group => ({
      ...group,
      members: contacts.filter(contact => contact.group_id === group.id)
    }));

    res.json(groupsWithMembers);
  } catch (error) {
    console.error('Error in getGroups:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body; 

    const { data: groupData, error: groupError } = await supabase
      .from('alert_groups')
      .insert([{ name }])
      .select()
      .single();

    if (groupError) throw groupError;

    if (members && members.length > 0) {
      const contactsToInsert = members.map(m => ({
        group_id: groupData.id,
        name: m.name,
        phone_number: m.phone || m.phone_number
      }));

      const { error: contactsError } = await supabase
        .from('alert_contacts')
        .insert(contactsToInsert);

      if (contactsError) throw contactsError;
    }

    res.status(201).json(groupData);
  } catch (error) {
    console.error('Error in createGroup:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('alert_groups').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error in deleteGroup:', error);
    res.status(500).json({ error: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { name, phone_number } = req.body;
    
    const { data, error } = await supabase
      .from('alert_contacts')
      .insert([{ group_id, name, phone_number }])
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error in addMember:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone_number } = req.body;
    
    const { data, error } = await supabase
      .from('alert_contacts')
      .update({ name, phone_number })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error in updateMember:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('alert_contacts').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMember:', error);
    res.status(500).json({ error: error.message });
  }
};

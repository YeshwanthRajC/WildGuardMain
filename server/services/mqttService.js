import mqtt from 'mqtt';
import supabase from '../config/supabase.js';

let client = null;
let subscribedTopics = new Set();

export const initMQTT = async () => {
  try {
    // 1. Fetch all devices to get their broker and topic configurations
    const { data: devices, error } = await supabase.from('edge_devices').select('*');
    if (error) {
      console.error('Error fetching edge devices for MQTT init:', error);
      return;
    }

    // For simplicity in this prototype, we assume a single primary broker (broker.emqx.io)
    // In a multi-broker setup, you'd manage multiple clients.
    const brokerUrl = 'mqtt://broker.emqx.io:1883';
    
    if (client) {
      // If already connected, just end it and restart to refresh subscriptions
      client.end();
    }

    console.log(`Connecting to MQTT broker: ${brokerUrl}`);
    client = mqtt.connect(brokerUrl, {
      reconnectPeriod: 5000, // standard exponential backoff config base
    });

    client.on('connect', () => {
      console.log('Connected to MQTT broker.');
      
      devices.forEach(device => {
        if (device.mqtt_topic && !subscribedTopics.has(device.mqtt_topic)) {
          client.subscribe(device.mqtt_topic, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${device.mqtt_topic}`, err);
            } else {
              console.log(`Subscribed to topic: ${device.mqtt_topic}`);
              subscribedTopics.add(device.mqtt_topic);
            }
          });
        }
      });
    });

    client.on('message', async (topic, message) => {
      const payload = message.toString();
      console.log(`Received message on ${topic}: ${payload}`);

      if (payload === 'DETECTED') {
        // Find which device this topic belongs to
        const device = devices.find(d => d.mqtt_topic === topic);
        if (device) {
          await processWildlifeAlert(device);
        } else {
          console.warn(`Received DETECTED on unknown topic: ${topic}`);
        }
      }
    });

    client.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
    });

    client.on('close', () => {
      console.log('MQTT Connection Closed');
    });

  } catch (error) {
    console.error('Failed to initialize MQTT:', error);
  }
};

// Expose a way to dynamically add a subscription without restarting
export const subscribeToNewDevice = (device) => {
  if (client && client.connected && device.mqtt_topic && !subscribedTopics.has(device.mqtt_topic)) {
    client.subscribe(device.mqtt_topic, (err) => {
      if (!err) {
        console.log(`Dynamically subscribed to topic: ${device.mqtt_topic}`);
        subscribedTopics.add(device.mqtt_topic);
      }
    });
  }
};

const processWildlifeAlert = async (device) => {
  try {
    const message = `Elephant Detection from ${device.device_name} at ${device.location}.`;
    
    const { error } = await supabase.from('notifications').insert([{
      type: 'WILDLIFE_ALERT',
      device_id: device.id,
      device_name: device.device_name,
      location: device.location,
      message: message
    }]);

    if (error) {
      console.error('Failed to save wildlife alert:', error);
    } else {
      console.log('Successfully recorded wildlife alert.');
    }
  } catch (err) {
    console.error('Error processing wildlife alert:', err);
  }
};

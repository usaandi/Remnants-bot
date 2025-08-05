import {Client, GatewayIntentBits } from 'discord.js';

import dotenv from 'dotenv';
import { CONFIG } from './config-globals.js';
import { parseMembers } from './wom-group.js';

dotenv.config();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CHANNEL_ID = CONFIG.CHANNEL_ID;
let channel; // Declare globally

client.login(process.env.DISCORD_BOT_TOKEN);

client.once('ready', () => {

  channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) {
    console.error('Channel not found!');
    return;
  }
  console.log(Date.now());
  channel.send('Bot is now online!').catch(console.error);
  parseMembers();
});


// Listen for the process exit event
process.on('exit', () => {
  console.log('Bot logged out (process exit).');
});

// Handle Ctrl+C (SIGINT)
process.on('SIGINT', async () => {
  console.log('Bot logged out (SIGINT).');

  if (channel) {
    try {
      await channel.send('Bot is logging out now. Goodbye!');
    } catch (error) {
      console.error('Failed to send logout message:', error);
    }
  }

  client.destroy();
  process.exit();
});

export default client;
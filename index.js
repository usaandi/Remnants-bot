import client from './main.js';
import { listAllMembers } from './members.js';
import { fetchWOMData } from './womData.js';

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const guildId = '1382206133153955952';

    const data = await listAllMembers(client, guildId);
    await fetchWOMData(data);
});
import client from './main.js';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { AttachmentBuilder } from 'discord.js';
import { fileURLToPath } from 'node:url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export async function fetchWOMData(data, batchSize = 20) {

    const API_URL = 'https://api.wiseoldman.net/v2';

    const endDate = new Date().toISOString();
    const results = [];
    for (let i = 0; i < data.length; i+= batchSize) {
        const batch = data.slice(i, i + batchSize);


        const promises = batch.map(async (entry) => {

            const username = encodeURIComponent(entry.name);
            const startDate = entry.date_joined_at;
            const params = new URLSearchParams({
                startDate,
                endDate
            });

            const url = `${API_URL}/players/${username}/gained?${params.toString()}`;

        try {
            const WOM_API_KEY = process.env.WOM_API_KEY;
            const USER_AGENT = 'us_ai|discord_id: 1228569681355603981'

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-api-key': WOM_API_KEY,
                    'User-Agent': USER_AGENT
                }
            });
            if (!response.ok) {
                console.error(`Error: ${response.statusText}. ${entry.name}`);
                return {
                    username: entry.name,
                    ehp: 0,
                    ehb: 0,
                    combined: 0
                }
            }

            const json_data = await response.json();
            const ehp = json_data.data.computed.ehp.value.gained.toFixed(1);
            const ehb = json_data.data.computed.ehb.value.gained.toFixed(1);
            const result = {
                username: entry.name,
                ehp: Number(ehp),
                ehb: Number(ehb),
                combined: Number(ehp) + Number(ehb)
            };
            
            console.log()
            console.log(`EHP data for ${entry.name}:`, result);
            return result;
            }  catch (error) {
                    console.error(`Error fetching data for ${entry.name}:`, error);
                return null;
            }   
        });
        const batchResult = await Promise.all(promises);
        results.push(...batchResult.filter(Boolean));
    }
    const filePath = await saveToCSV(results);
    await postCSVToDiscord(filePath);
    return results;

}


async function postToDiscord(data) {

    const CHANNEL_ID = '1397129160148783188';
    const channel = await client.channels.fetch(CHANNEL_ID);
    if(!channel.isTextBased()) {
        console.error('Target channel is not a text-based channel');
        return;
    }
    
    const message = `Information about: ${data.username}. EHP: ${data.ehp}, EHB: ${data.ehb}, Combined:${data.combinedEH}`;
    channel.send(message).catch(console.error);

}

async function saveToCSV(data) {
    const headers = ['username', 'ehp', 'ehb', 'combined'];
    const rows = data.map(d => [d.username, d.ehp.toFixed(1), d.ehb.toFixed(1), d.combined.toFixed(1)].join(','));
    const content = [headers.join(','), ...rows].join('\n');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(__dirname,`wom_data-${timestamp}.csv`);
    fs.writeFileSync(filePath, content);
    console.log(`Saved CSV to ${filePath}`);

    return filePath;
}

async function postCSVToDiscord(filePath) {
    const CHANNEL_ID = '1397129160148783188';
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel.isTextBased()) {
        console.error('Target channel is not a text-based channel');
        return;
    }

    const attachment = new AttachmentBuilder(filePath, { name: 'wom_data.csv' });
    await channel.send({
        content: 'Here is the EHP/EHB CSV data:',
        files: [attachment]
    });

    console.log('CSV file posted to Discord');
}


export default fetchWOMData;
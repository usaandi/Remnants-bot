import dotenv from 'dotenv';
import { CONFIG } from './config-globals.js';

import fs from 'fs/promises';
import fetchWOMData from './womData.js';

dotenv.config();

const CACHE_GROUP_FILE = './group-info.json';
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; //1h

export async function fetchGroupInfo() {
    const WOM_API_KEY = process.env.WOM_API_KEY || '';
    const request_url = `${CONFIG.API_URL}/groups/${CONFIG.WOM_GROUP_ID}`; 

    try {
        const stat = await fs.stat(CACHE_GROUP_FILE);
        const now = Date.now();
        const modified = new Date(stat.mtime).getTime();

        if ((now-modified) < CACHE_MAX_AGE_MS) {
            //Getting info from cache
            const cached = await fs.readFile(CACHE_GROUP_FILE, 'utf-8');
            const parsed = JSON.parse(cached);
            return parsed;
        }
    } catch (error) {
        console.error(`Error: ${error}`);
    }
   

    // Fetch from API
    console.log('Fetching fresh data from API...');
    const response = await fetch(request_url, {
        method: 'GET',
        headers: {
            'x-api-key': WOM_API_KEY,
            'User-Agent': CONFIG.USER_AGENT
        },
    
    });

    if(!response.ok) {
        console.error(`Error: ${response.statusText}`);
    }
    const json_data = await response.json();
    await fs.writeFile(CACHE_GROUP_FILE, JSON.stringify(json_data, null , 2));

    return json_data;
}


export async function parseMembers() {
    const json_data = await fetchGroupInfo();
    const members = json_data.memberships;

    const simplified = members.map(member => ({
        name: member.player.username,
        date_joined_at: member.createdAt
    }));

    await fetchWOMData(simplified);
}


async function processMemberInfo(member) {
    //unused for now
    const now = new Date().toISOString();
    const join_date = member.createdAt;
    const params = new URLSearchParams({
        startDate: join_date,
        endDate: now
    });
    const username = member.player.username;
    const url = `${CONFIG.API_URL}/players/${username}/gained?${params.toString()}`;
}

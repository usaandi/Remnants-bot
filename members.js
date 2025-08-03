export async function listAllMembers(client, guildId) {

    const dataForWOM = [];
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error('Guild not found');
        return;
    }

    const staffRoleId = ['1382216510667227136', '1382287237818875924']; //Staff role id
    const membersRoleId = '1382240699801403423'; //Members role id
    const CHANNEL_ID = '1397129160148783188';
    try {
        await guild.members.fetch();

        const membersRole = guild.roles.cache.get(membersRoleId);
        if (!membersRole) {
            console.error('Members role not found!');
        }
        const lines = [];

        membersRole.members.forEach(member => {
            if (member.user.bot) return;
            const isStaff = member.roles.cache.some(role => staffRoleId.includes(role.id))
            if (isStaff) return;
            
            const joinedDate = member.joinedAt.toISOString();
            const displayName = member.nickname || member.user.username;
            dataForWOM.push({
                name: displayName,
                date_joined_at: member.joinedAt.toISOString()
            });
            lines.push(`<@${member.id}> joined on  ${joinedDate}`);
            console.log(`${member.user.tag} joined at ${member.joinedAt}`);
            
        });

        const channel = await client.channels.fetch(CHANNEL_ID);
        if(!channel.isTextBased()) {
            console.error('Target channel is not a text-based channel');
            return;
        }

        const chunkSize = 1900;
        let chunk = '';

        /*for (const line of lines) {
            if ((chunk + line + '\n').length > chunkSize ) {
                await channel.send(chunk);
                chunk = '';
            }
            chunk += line + '\n';
        }
        if (chunk.length > 0) {
            await channel.send(chunk);
        }*/

        console.log('Sent member join messages!');
    } catch(error) {
            console.error('Failed to fetch members:', error)
    }
    return dataForWOM;
}

export default listAllMembers;
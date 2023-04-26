import { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, UserContextMenuCommandInteraction, CacheType } from "discord.js";
import { D3_discord } from "../../Core/client.js";
import { Command } from "../../Core/command.js";

interface opts {
    interaction: UserContextMenuCommandInteraction<CacheType>,
    client: D3_discord
}

export default new Command({
    name: 'semantle-invite',
    description: 'Invite anyone to play semantle with you',
    emote: false,
    // @ts-ignore
    data: new ContextMenuCommandBuilder()
    .setName('semantle-invite')
    .setType(ApplicationCommandType.User),
    // @ts-ignore
    run: async (params: opts) => {
        const { interaction, client } = params;
        if (interaction === undefined) return;
        try {

            await interaction.deferReply();
        
            const person = interaction.targetUser.id;
        
            let d3mantleRole = interaction.guild?.roles.cache.find(role => role.name === 'D3mantle');
        
            if (!d3mantleRole) {
                d3mantleRole = await interaction.guild?.roles.create({
                    name: 'D3mantle',
                    reason: "There were no D3mantle role in this server. It is necessary for the game to work."
                })
            }
        
            await interaction.guild?.members.cache.get(person)?.roles.add(d3mantleRole!);
        
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Semantle Invite")
                        .setDescription(`Added <@${person}> to the Semantle channel`)
                        .setColor("Green")
                ]
            });
        } catch (err: Error | any) {
            console.error("Error generated, check logs")
            console.log(err)
        }
    }
});
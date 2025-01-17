const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { default: axios } = require('axios');
const { pagination, ButtonTypes, ButtonStyles } = require('@devraelfreeze/discordjs-pagination');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fortniteshop')
        .setDescription("Gives today's current Fortnite item shop!"),

    async execute(interaction) {
        try {
            const response = await axios.get('https://fortnite-api.com/v2/shop');
            const brOutfitItems = response.data.data.entries
                .filter(item => item.hasOwnProperty('brItems'))
                .flatMap(item => item.brItems)
                .filter(item => item.type.value === 'outfit');

            // Get unique item names and icons
            const brItemsNames = [...new Set(brOutfitItems.map(item => item.name))];
            const brItemsIcons = [...new Set(brOutfitItems.map(item => item.images.icon))];

            // Create attachments and embeds
            const files = brItemsIcons.map(icon => new AttachmentBuilder(icon));
            const embeds = brItemsNames.map((name, index) =>
                new EmbedBuilder()
                    .setTitle(name)
                    .setImage(brItemsIcons[index])
            );

            // Paginate the embeds
            await pagination({
                embeds,
                author: interaction.member.user,
                interaction,
                ephemeral: true,
                time: 3600000,
                disableButtons: false,
                fastSkip: false,
                pageTravel: false,
                buttons: [
                    {
                        type: ButtonTypes.previous,
                        label: 'Previous Page',
                        style: ButtonStyles.Primary,
                    },
                    {
                        type: ButtonTypes.next,
                        label: 'Next Page',
                        style: ButtonStyles.Success,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching Fortnite shop:', error);
            await interaction.reply({
                content: 'There was an error fetching the Fortnite item shop. Please try again later.',
                ephemeral: true,
            });
        }
    },
};


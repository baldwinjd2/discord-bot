const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js'); 
const { default: axios } = require('axios');
const {pagination, ButtonTypes, ButtonStyles} = require('@devraelfreeze/discordjs-pagination');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fortniteshop')
        .setDescription('Gives todays current Fortnite item shop!'),
    async execute(interaction) {
        await axios.get('https://fortnite-api.com/v2/shop').then((response) => {
            const brOutfitItems = response.data.data.entries.filter(item => item.hasOwnProperty('brItems'))
                                                            .flatMap(item => item.brItems)
                                                            .filter(item => item.type.value === 'outfit');
            let brItemsNames = brOutfitItems.map(item => item.name);
            //Remove duplicates
            brItemsNames = brItemsNames.filter((item, index) => brItemsNames.indexOf(item) === index);
            let brItemsIcons = brOutfitItems.map(item => item.images.icon);
            //Remove duplicates
            brItemsIcons = brItemsIcons.filter((item, index) => brItemsIcons.indexOf(item) === index);

            const files = [];

            brItemsIcons.forEach(element => {
                files.push(new AttachmentBuilder(element));
            });

            const embeds = [];

            brItemsNames.forEach(element => {
                const embed = new EmbedBuilder()
                    .setTitle(element)
                    .setImage(brItemsIcons[brItemsNames.indexOf(element)]);
                embeds.push(embed);
            });

            console.log(embeds);

            pagination({
                embeds: embeds,
                author: interaction.member.user,
                interaction: interaction,
                ephemeral: true,
                time: 3600000,
                disableButtons: false,
                fastSkip: false,
                pageTravel: false,
                buttons: [
                    {
                        type: ButtonTypes.previous,
                        label: 'Previous Page',
                        style: ButtonStyles.Primary
                      },
                      {
                        type: ButtonTypes.next,
                        label: 'Next Page',
                        style: ButtonStyles.Success
                      }
                ]
            })
        });
    }
}
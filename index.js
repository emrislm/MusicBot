import { config } from 'dotenv';
import { DisTube } from 'distube';
import { REST, Client, GatewayIntentBits, Routes, IntentsBitField, EmbedBuilder, ActivityType } from "discord.js";

config();
const TOKEN = process.env.MUSICBOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.HY_GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates
  ]
});
const rest = new REST({ version: '10' }).setToken(TOKEN);

/////////////////////////////////////////////// CLIENT ///////////////////////////////////////////////
client.on('ready', async () => {
  console.log(`${client.user.username} is online.`);

  client.user.setPresence({
    activities: [{ name: '?help', type: ActivityType.Listening }],
    status: 'dnd'
  });
});

client.DisTube = new DisTube(client, {
  leaveOnStop: false,
  leaveOnEmpty: true,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: true,
  emitAddListWhenCreatingQueue: true
});

client.on("messageCreate", message => {
  if (message.author.bot || !message.guild) return;
  const prefix = '?';
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (!message.content.toLowerCase().startsWith(prefix)) return;
  console.log(command);

  if (command === 'help') {
    message.channel.send({
      embeds: [new EmbedBuilder()
        .setTitle('Command list')
        .setColor('DarkBlue')
        .setFields(
          { name: '?play', value: 'Play OR add song to queue', inline: false },
          { name: '?stop', value: 'Stop ther stream', inline: false },
          { name: '?pause', value: 'Pause the stream', inline: false },
          { name: '?resume', value: 'Resume the stream', inline: false },
          { name: '?skip', value: 'Skip the playing song', inline: false },
        )
      ]
    });
  }

  if (command === 'play') {
    client.DisTube.play(message.member.voice.channel, args.join(' '), {
      member: message.member,
      textChannel: message.channel,
      message
    });
  }

  if (command === 'stop') {
    if (client.DisTube.queues.size > 0) {
      client.DisTube.stop(message.member.voice.channel);
      message.channel.send("Stopped!");
    }
    message.channel.send("Queue is already empty!");
  }

  if (command === 'pause') {
    client.DisTube.pause(message.member.voice.channel);
    message.channel.send("Paused!");
  }

  if (command === 'resume') {
    client.DisTube.resume(message.member.voice.channel);
    message.channel.send("Resumed!");
  }

  if (command === 'skip') {
    client.DisTube.skip(message.member.voice.channel);
    message.channel.send("Skipped!");
  }
});

client.DisTube.on('playSong', (queue, song) => {
  queue.textChannel.send('NOW PLAYING: ' + song.name);
});

client.DisTube.on('addSong', (queue, song) => {
  queue.textChannel.send('Added to queue: ' + song.name);
});

/////////////////////////////////////////////// METHODS //////////////////////////////////////////////
async function main() {
  const commands = [];

  try {
    console.log("Started refreshing commands.");

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    client.login(TOKEN);
  } catch (error) {
    console.log(error);
  }
}

/////////////////////////////////////////////// BASE /////////////////////////////////////////////////
main();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    `እንኳን ወደ Tsion Tasks Bot በደህና መጡ!

👤 Profile
📋 Tasks
💰 Balance
🎁 Referral
💸 Withdraw`
  );
});

bot.launch();

console.log("Tsion Tasks Bot is running...");

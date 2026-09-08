uconst { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = 562673622;
bot.start((ctx) => {
  ctx.reply(
    "እንኳን ወደ Tsion Tasks Bot በደህና መጡ!",
    Markup.keyboard([
      ["📋 Tasks", "💰 Balance"],
      ["🎁 Referral", "💸 Withdraw"],
      ["👤 Profile", "📞 Support"]
    ]).resize()
  );
});

bot.hears("💰 Balance", (ctx) => {
  ctx.reply("Balance: 0 ETB");
});

bot.hears("👤 Profile", (ctx) => {
  ctx.reply(`ID: ${ctx.from.id}\nName: ${ctx.from.first_name}`);
});

bot.hears("📋 Tasks", (ctx) => {
  ctx.reply("No tasks available yet.");
});bot.command("admin", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("Access denied");
  }

  ctx.reply(
    "🔐 Admin Panel",
    Markup.keyboard([
      ["➕ Create Task"],
      ["⏳ Pending Proofs"],
      ["👥 Users"],
      ["📊 Statistics"]
    ]).resize()
  );
});

bot.hears("➕ Create Task", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  ctx.reply("Task Created!\n\n📌 Test Task\n💰 Reward: 5 ETB");
});

bot.launch();
console.log("Bot running...");

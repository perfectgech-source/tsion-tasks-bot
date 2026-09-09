const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = 562673622;
let tasks = [];
let proofs = [];
bot.on("photo", (ctx) => {
  proofs.push({
    userId: ctx.from.id,
    name: ctx.from.first_name
  });

  ctx.reply("✅ Proof submitted. Waiting for admin approval.");

  bot.telegram.sendMessage(
    ADMIN_ID,
    `📸 New Proof\nUser: ${ctx.from.first_name}\nID: ${ctx.from.id}`
  );
});
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
  if (tasks.length === 0) {
    return ctx.reply("No tasks available yet.");
  }

  let message = "📋 Available Tasks\n\n";

  tasks.forEach((task, index) => {
    message += `${index + 1}. ${task.title}\n💰 ${task.reward} ETB\n\n`;
  });

  ctx.reply(message);
});
});

bot.command("admin", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("Access denied");
  }

  ctx.reply(
    "🔐 Admin Panel",
    Markup.keyboard([
      ["➕ Create Task"],
      ["⏳ Pending Proofs"],n
      ["👥 Users"],
      ["📊 Statistics"]
    ]).resize()
  );
});

bot.hears("➕ Create Task", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  tasks.push({
    title: "Join Telegram Channel",
    reward: 5
  });

  ctx.reply("✅ Task created successfully");
});
bot.hears("⏳ Pending Proofs", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  ctx.reply(`Pending proofs: ${proofs.length}`);
});
bot.launch();
const http = require("http");

const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(PORT);
console.log("Bot running...");

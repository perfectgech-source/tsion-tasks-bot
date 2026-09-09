const { Telegraf, Markup } = require("telegraf");
const http = require("http");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = 562673622;

let tasks = [];
let proofs = [];

// Start
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

// Balance
bot.hears("💰 Balance", (ctx) => {
  ctx.reply("Balance: 0 ETB");
});

// Profile
bot.hears("👤 Profile", (ctx) => {
  ctx.reply(
    `ID: ${ctx.from.id}\nName: ${ctx.from.first_name}`
  );
});

// Tasks
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

// Admin panel
bot.command("admin", (ctx) => {
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

// Create Task
bot.hears("➕ Create Task", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  tasks.push({
    title: "Join Telegram Channel",
    reward: 5
  });

  ctx.reply("✅ Task created successfully");
});

// Pending Proofs
bot.hears("⏳ Pending Proofs", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  ctx.reply(`Pending proofs: ${proofs.length}`);
});

// Receive proof screenshots
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

// Launch bot
bot.launch();

// Render port
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(PORT);

console.log("Bot running...");

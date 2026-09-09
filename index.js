const { Telegraf, Markup } = require("telegraf");
const http = require("http");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = 562673622;

let tasks = [];
let proofs = [];
let balances = {};

const REFERRAL_BONUS = 2.5;
// START
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

// PROFILE
bot.hears("👤 Profile", (ctx) => {
  ctx.reply(
    `ID: ${ctx.from.id}\nName: ${ctx.from.first_name}`
  );
});

// BALANCE
bot.hears("💰 Balance", (ctx) => {
  const balance = balances[ctx.from.id] || 0;
  ctx.reply(`💰 Balance: ${balance} ETB`);
});

// TASKS
bot.hears("📋 Tasks", (ctx) => {
  if (tasks.length === 0) {
    return ctx.reply("No tasks available yet.");
  }

  let message = "📋 Available Tasks\n\n";

  tasks.forEach((task, index) => {
    message += `${index + 1}. ${task.title}\n💰 Reward: ${task.reward} ETB\n\n`;
  });

  ctx.reply(message);
});

// ADMIN PANEL
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

// CREATE TASK
bot.hears("➕ Create Task", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  tasks.push({
    title: "Join Telegram Channel",
    reward: 5
  });

  ctx.reply("✅ Task created successfully");
});

// PENDING PROOFS
bot.hears("⏳ Pending Proofs", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  ctx.reply(`📸 Pending proofs: ${proofs.length}`);
});

// RECEIVE SCREENSHOTS
bot.on("photo", (ctx) => {
  proofs.push({
    userId: ctx.from.id,
    name: ctx.from.first_name
  });

  ctx.reply("✅ Proof submitted. Waiting for admin approval.");

  bot.telegram.sendMessage(
    ADMIN_ID,
    `📸 New Proof\nUser: ${ctx.from.first_name}\nID: ${ctx.from.id}\n\nApprove:\n/approve ${ctx.from.id}\n\nReject:\n/reject ${ctx.from.id}`
  );
});

// APPROVE
bot.command("approve", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const parts = ctx.message.text.split(" ");
  const userId = parts[1];

  if (!userId) {
    return ctx.reply("Usage: /approve USER_ID");
  }

  balances[userId] = (balances[userId] || 0) + 5;

  bot.telegram.sendMessage(
    userId,
    "🎉 Proof approved!\n💰 5 ETB added to your balance."
  );

  ctx.reply(`✅ Approved ${userId}`);
});

// REJECT
bot.command("reject", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const parts = ctx.message.text.split(" ");
  const userId = parts[1];

  if (!userId) {
    return ctx.reply("Usage: /reject USER_ID");
  }

  bot.telegram.sendMessage(
    userId,
    "❌ Your proof was rejected."
  );

  ctx.reply(`❌ Rejected ${userId}`);
});

// WITHDRAW
bot.hears("💸 Withdraw", (ctx) => {
  const balance = balances[ctx.from.id] || 0;

  if (balance < 1000) {
    return ctx.reply("❌ Minimum withdrawal is 1000 ETB");
  }

  bot.telegram.sendMessage(
    ADMIN_ID,
    `💸 Withdrawal Request

User: ${ctx.from.first_name}
ID: ${ctx.from.id}
Balance: ${balance} ETB`
  );

  ctx.reply("✅ Withdrawal request sent to admin.");
});

// SUPPORT
bot.hears("📞 Support", (ctx) => {
  ctx.reply("@onlineworktas");
});

// REFERRAL
bot.hears("🎁 Referral", (ctx) => {
  ctx.reply(
    `Invite friends using your ID:\n${ctx.from.id}`
  );
});

// USERS
bot.hears("👥 Users", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  ctx.reply(`Users with balances: ${Object.keys(balances).length}`);
});

// STATS
bot.hears("📊 Statistics", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  ctx.reply(
    `📊 Stats\nTasks: ${tasks.length}\nProofs: ${proofs.length}`
  );
});

// START BOT
bot.launch();

// RENDER PORT
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(PORT);

console.log("Bot running...");

const mongoose = require("mongoose");
const { Telegraf, Markup } = require("telegraf");
const http = require("http");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = 562673622;

const userSchema = new mongoose.Schema({
  userId: String,
  balance: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model("User", userSchema);
const taskSchema = new mongoose.Schema({
  title: String,
  reward: Number,
  link: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model("Task", taskSchema);

let proofs = [];

const REFERRAL_BONUS = 2.5;
bot.command("addtask", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const text = ctx.message.text.replace("/addtask ", "");

  const parts = text.split("|");

  if (parts.length < 2) {
    return ctx.reply(
      "Usage:\n/addtask Task Title|Reward"
    );
  }

  const title = parts[0];
  const reward = Number(parts[1]);

  await Task.create({
    title,
    reward
  });

  ctx.reply("✅ Task Added");
});
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
bot.hears("💰 Balance", async (ctx) => {
  let user = await User.findOne({
    userId: ctx.from.id
  });

  if (!user) {
    user = await User.create({
      userId: ctx.from.id,
      balance: 0
    });
  }

  ctx.reply(`💰 Balance: ${user.balance} ETB`);
});
// TASKS
bot.hears("📋 Tasks", async (ctx) => {
  const tasks = await Task.find();

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
let waitingForTask = false;

bot.hears("➕ Create Task", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  waitingForTask = true;

  ctx.reply(
    "Send task like:\nTask Title|Reward\n\nExample:\nJoin Telegram Channel|5"
  );
});

bot.on("text", async (ctx, next) => {
  if (!waitingForTask || ctx.from.id !== ADMIN_ID) {
    return next();
  }

  if (ctx.message.text.startsWith("/")) {
    return next();
  }

  const parts = ctx.message.text.split("|");

  if (parts.length < 2) {
    return ctx.reply("Format:\nTask Title|Reward");
  }

  await Task.create({
    title: parts[0],
    reward: Number(parts[1])
  });

  waitingForTask = false;

  ctx.reply("✅ Task Added Successfully");
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
    ADMIN_ID,
    `📸 New Proof\nUser: ${ctx.from.first_name}\nID: ${ctx.from.id}\n\nApprove:\n/approve ${ctx.from.id}\n\nReject:\n/reject ${ctx.from.id}`
  );
});

// APPROVE
bot.command("approve", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const parts = ctx.message.text.split(" ");
  const userId = parts[1];

  if (!userId) {
    return ctx.reply("Usage: /approve USER_ID");
  }

  let user = await User.findOne({
    userId: userId
  });

  if (!user) {
    user = await User.create({
      userId,
      balance: 0
    });
  }

  user.balance += 5;
  await user.save();

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
bot.hears("💸 Withdraw", async (ctx) => {
  let user = await User.findOne({
    userId: ctx.from.id
  });

  if (!user) {
    return ctx.reply("❌ No account found");
  }

  if (user.balance < 1000) {
    return ctx.reply("❌ Minimum withdrawal is 1000 ETB");
  }

  bot.telegram.sendMessage(
    ADMIN_ID,
    `💸 Withdrawal Request

User: ${ctx.from.first_name}
ID: ${ctx.from.id}
Balance: ${user.balance} ETB`
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


// STATS
bot.hears("📊 Statistics", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const taskCount = await Task.countDocuments();
  const userCount = await User.countDocuments();

  ctx.reply(
    `📊 Stats

👥 Users: ${userCount}
📋 Tasks: ${taskCount}
📸 Proofs: ${proofs.length}`
  );
});

// START BOT
bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// RENDER PORT
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(PORT);

console.log("Bot running...");

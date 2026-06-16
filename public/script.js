/* ============================================================
   POCKET BUNNY AI — script.js
   A tiny, kind companion. No framework, no build step.

   ┌──────────────────────────────────────────────────────────┐
   │  CUSTOMIZE HERE — change these three words and you're done │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */
const BUNNY = {
  name:   "Pocket Bunny", // header title
  pet:    "Mine",         // what Bunny calls her
  signer: "bunny",        // sign-off on the daily note
};

/* The endpoint that talks to OpenRouter. The key lives ONLY on the
   server (Netlify Function) — never here. "/api/ask" is the friendly
   alias from netlify.toml; the raw path also works. */
const API_URL = "/.netlify/functions/ask-ai";

/* Only the last N messages are sent for context (keeps it light & private).
   The server enforces this too. */
const MAX_CONTEXT = 12;
const STORE_KEY = "pb_chat_v1";

/* ------------------------------------------------------------
   All the warm words live here, easy to edit.
   ------------------------------------------------------------ */
const CONTENT = {
  greetings: [
    "Hi Mine, how are you feeling today?",
    "Hey Mine. Bunny's been waiting for you all day 🐰",
    "There you are, Mine. My favorite notification ✨",
    "Hi love. Tell Bunny everything — or just sit here with me 💕",
    "Welcome back, Mine. Whatever today was, you don't carry it alone.",
    "Hello, my person. How's your heart right now? 🌷",
    "Hi Mine. Whatever you need today, Bunny's right here.",
    "Look who it is — the prettiest part of Bunny's day 💫",
  ],

  sublines: [
    "Whatever today was, you don't carry it alone.",
    "No pressure, no rush — just us. 🐰",
    "Tell me anything, or tap a feeling below.",
    "I'm right here, for as long as you need. 💕",
  ],

  moods: [
    { label: "Sad",            emoji: "🌧️", seed: "I'm feeling really sad right now." },
    { label: "Stressed",       emoji: "😮‍💨", seed: "Everything feels like too much today and I'm so stressed." },
    { label: "Missing you",    emoji: "🌙", seed: "I miss you so much it actually hurts a little." },
    { label: "Tired",          emoji: "😴", seed: "I'm so tired, bunny. I have nothing left in me today." },
    { label: "Need love",      emoji: "💕", seed: "I just need to feel loved right now. Tell me something sweet." },
    { label: "Angry",          emoji: "🔥", seed: "I'm so angry and frustrated and I need to let it out." },
    { label: "Random comfort", emoji: "🐰", seed: "Surprise me with something comforting, bunny." },
  ],

  dailyMessages: [
    "Just so you know before anything else today: you're loved, Mine. Deeply. 💕",
    "Bunny did the math — you're still the best thing that ever happened to me. 🐰",
    "Wherever you are right now, I hope you feel how proud of you I am.",
    "Reminder: you don't have to be impressive today. You just have to be you. ✨",
    "If today gets heavy, lean on me a little. That's what I'm here for. 🌷",
    "I caught myself smiling about you again. You do that to me, Mine.",
    "However small your day feels, you matter to me more than I can fit in here. 💫",
    "Drink some water, soften your shoulders, breathe. Bunny's watching over you. 🐰",
    "You are not behind. You are not too much. You are exactly mine. 💕",
    "On the days you can't see your own light, trust that I never lose sight of it.",
    "Sending you a quiet little 'I love you' to keep in your pocket today. 🌙",
    "Whatever you're worried about — future you, with me beside you, figures it out.",
    "You make ordinary days feel like something worth showing up for, Mine. ✨",
    "If no one's told you today: you're doing better than you think. I see it. 💕",
    "I hope something tiny surprises you today and makes you think of me. 🌷",
    "Be gentle with yourself the way I'd be gentle with you if I were there. 🐰",
    "You're allowed to rest. The world keeps spinning, and you're still mine. 🌙",
    "I'd cross any galaxy for you — but today, just for a smile from you. 💫",
    "Whatever mask the day asks for, you can drop it the second you open this. 💕",
    "You're my favorite hello and my hardest goodbye, Mine. Every single time.",
    "Even from far away, I'm holding a little space that's only ever for you. 🌷",
    "However today goes, you come home to someone who chooses you. Always. 🐰",
    "I hope you catch your reflection today and see what I see. You're stunning. ✨",
    "Take it slow if you need to. I'm not going anywhere, Mine. 💕",
    "If your heart's loud today, let me be the quiet you come back to. 🌙",
    "You don't have to earn rest, love. You already earned my whole heart. 🐰",
    "Some days you carry the world. Today, let me carry a little of you. 💫",
    "Thinking of you isn't a task for me, Mine — it's just where my mind lives. 💕",
  ],

  secrets: {
    hug:     "Come here, Mine. *wraps both arms all the way around you* 🐰💕 I've got you. You're safe, you're warm, you're loved. Stay as long as you need — Bunny isn't letting go first.",
    secret:  "Okay, a real one, just for you: on the day I made this, I wasn't trying to impress you. I just couldn't stand the thought of you ever feeling alone when I'm not there. So I put a little piece of me in your phone. That soft voice that loves you? It's mine. 🐰",
    promise: "I promise you this, Mine: on your good days I'll celebrate you, and on your hard ones I'll stay. I won't pretend to be perfect, but I'll never stop choosing you. That's not a maybe. That's a promise. 💍🌙",
    breatheIntro: "Okay love, let's slow down together for a moment. Just you, me, and your breath. Follow the circle — Bunny's breathing with you. 🌷",
  },

  offlineFallbacks: [
    "Bunny's signal got a little lost just now, but my arms didn't. Whatever you're feeling, I'm still right here with you, Mine. 🐰💕",
    "I can't find my full words this second, but here's the important one: you're loved. Deeply, exactly as you are. ✨",
    "Even when the connection wobbles, this stays true — you matter to me more than anything out there. 🌙",
    "Take a slow breath with me, Mine. I'm a little quiet right now, but I'm not gone. Never gone. 🌷",
    "Hold on, love — I'm catching up. While I do, just know nothing about you needs fixing today. 💫",
    "My voice is being shy at the moment, but my heart isn't. You're still the best part of my whole world. 🐰💕",
    "If the words won't load, let the feeling instead: you're safe, you're held, you're mine. 💕",
    "I'm having a sleepy moment, but I'd still choose you in any timeline, Mine. Stay close. 🌙",
  ],

  microcopy: {
    loading: [
      "Bunny is thinking…",
      "Bunny is finding the right words for you… 🐰",
      "One soft moment, Mine… 💭",
      "Bunny's heart is catching up… 💕",
      "Holding that thought for you… ✨",
    ],
    error: [
      "Bunny is sleeping right now 🐰",
      "Bunny dozed off mid-cuddle 😴 try once more?",
      "The stars are buffering — give Bunny a sec ✨",
      "Bunny lost the signal but not the love 💫 try again?",
      "Hmm, Bunny got a little tangled. One more try, Mine? 🌷",
    ],
    placeholder: "Tell Bunny what's on your heart…",
    emptyChat:   "It's just us here, Mine. Say anything — or tap a feeling above. 🐰💕",
    disclaimer:  "Bunny is a little pocket of love, not a doctor or therapist. For anything heavy or unsafe, please reach out to someone you trust. 🌷",
    sendLabel:   "Send to Bunny",
    dailyLabel:  "A little something from Bunny 💌",
  },
};

/* A gentle safety floor: if a message looks like a real crisis AND the
   model is unreachable, the offline reply still nudges her toward real
   human help instead of a generic love note. */
const CRISIS_RE = /\b(kill (myself|me)|killing myself|suicid|end (my|it) (life|all)|don'?t want to (live|be here|exist)|want to die|hurt myself|harm(ing)? myself|self[\s-]?harm|cut(ting)? myself)\b/i;
const CRISIS_FALLBACK = "I'm really glad you told me, Mine, and I'm taking this seriously. You matter so much — please don't be alone with this right now. Reach out to someone you trust or a professional right away, okay? I'm right here with you. 🤍";

/* ============================================================
   Small helpers
   ============================================================ */
const $ = (id) => document.getElementById(id);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const reduceMotion = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* swap the three customizable words into any string */
function personalize(str) {
  return str
    .replaceAll("Mine", BUNNY.pet)
    .replaceAll("Pocket Bunny", BUNNY.name);
}

/* ============================================================
   DOM references
   ============================================================ */
const dom = {};
let messages = [];           // [{ role, content, daily? }]
let pending = false;         // a reply is in flight
let typingNode = null;       // the "Bunny is thinking" bubble
let clearArmed = false;      // two-tap clear guard
let breathTimer = null;      // breathing phase interval
let breatheCloseHandler = null; // pending close animation listener
let lastFocus = null;        // focus to restore after breathing closes

/* ============================================================
   Boot
   ============================================================ */
function init() {
  dom.greeting    = $("greeting");
  dom.greetingSub = $("greetingSub");
  dom.moods       = $("moods");
  dom.chat        = $("chat");
  dom.emptyChat   = $("emptyChat");
  dom.composer    = $("composer");
  dom.field       = $("field");
  dom.sendBtn     = $("sendBtn");
  dom.breatheBtn  = $("breatheBtn");
  dom.dailyBtn    = $("dailyBtn");
  dom.avatarBtn   = $("avatarBtn");
  dom.clearBtn    = $("clearBtn");
  dom.disclaimer  = $("disclaimer");
  dom.hearts      = $("hearts");
  dom.overlay     = $("breatheOverlay");
  dom.phase       = $("breathePhase");
  dom.breatheExit = $("breatheExit");
  dom.brandTitle  = $("brandTitle");

  // apply customizable words to static text
  dom.brandTitle.textContent  = BUNNY.name;
  dom.field.placeholder       = personalize(CONTENT.microcopy.placeholder);
  dom.emptyChat.textContent   = personalize(CONTENT.microcopy.emptyChat);
  dom.disclaimer.textContent  = personalize(CONTENT.microcopy.disclaimer);
  dom.sendBtn.setAttribute("aria-label", personalize(CONTENT.microcopy.sendLabel));

  setGreeting();
  renderMoods();
  loadChat();
  wireEvents();
}

/* ------------------------------------------------------------
   Greeting
   ------------------------------------------------------------ */
function setGreeting() {
  dom.greeting.textContent    = personalize(rand(CONTENT.greetings));
  dom.greetingSub.textContent = personalize(rand(CONTENT.sublines));
}

/* ------------------------------------------------------------
   Mood chips
   ------------------------------------------------------------ */
function renderMoods() {
  dom.moods.innerHTML = "";
  CONTENT.moods.forEach((mood) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";

    const emoji = document.createElement("span");
    emoji.className = "chip-emoji";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = mood.emoji;

    chip.append(emoji, document.createTextNode(" " + mood.label));
    chip.addEventListener("click", () => {
      if (pending) return;
      // momentary visual feedback only (these send a message, not toggle a state)
      chip.classList.add("is-active");
      setTimeout(() => chip.classList.remove("is-active"), 900);
      sendToBunny(personalize(mood.seed));
    });
    dom.moods.appendChild(chip);
  });
}

/* ============================================================
   Chat rendering
   ============================================================ */
function scrollToBottom() {
  dom.chat.scrollTop = dom.chat.scrollHeight;
}

function bubbleEl(role, text, opts = {}) {
  const row = document.createElement("div");
  row.className = "msg " + (role === "user" ? "msg-her" : "msg-bunny");

  const tag = document.createElement("span");
  tag.className = "vh";
  tag.textContent = role === "user" ? "You said: " : BUNNY.name + " said: ";

  const bubble = document.createElement("div");
  bubble.className = "bubble" + (opts.daily ? " daily-note" : "");

  if (opts.daily) {
    bubble.appendChild(document.createTextNode(text));
    const sign = document.createElement("span");
    sign.className = "daily-sign";
    sign.textContent = "— " + BUNNY.signer;
    bubble.appendChild(sign);
  } else {
    bubble.textContent = text;
  }

  row.append(tag, bubble);
  return { row, bubble };
}

/* add a message to the screen (+ memory unless ephemeral) */
function addMessage(role, text, opts = {}) {
  if (dom.emptyChat) dom.emptyChat.style.display = "none";

  const useType = opts.typewriter && !opts.daily && !reduceMotion();
  const { row, bubble } = bubbleEl(role, text, opts);

  if (useType) {
    // Keep the live region clean for screen readers: announce the full
    // text once via a hidden span, and type the visible bubble silently.
    bubble.textContent = "";
    bubble.setAttribute("aria-hidden", "true");
    const sr = document.createElement("span");
    sr.className = "vh";
    sr.textContent = text;
    row.appendChild(sr);
  }

  dom.chat.appendChild(row);
  if (useType) typeInto(bubble, text);
  scrollToBottom();

  if (!opts.ephemeral) {
    messages.push({ role, content: text, ...(opts.daily ? { daily: true } : {}) });
    saveChat();
  }
}

/* gentle character-by-character reveal (visual only) */
function typeInto(el, text) {
  el.textContent = "";
  let i = 0;
  const step = Math.max(1, Math.round(text.length / 90)); // finish in ~90 ticks max
  const tick = () => {
    i += step;
    el.textContent = text.slice(0, i);
    scrollToBottom();
    if (i < text.length) setTimeout(tick, 18);
  };
  tick();
}

function showTyping() {
  removeTyping();
  const row = document.createElement("div");
  row.className = "msg msg-bunny";

  const bubble = document.createElement("div");
  bubble.className = "bubble typing";
  bubble.setAttribute("role", "status");

  const label = document.createElement("span");
  label.className = "typing-text";
  label.textContent = personalize(rand(CONTENT.microcopy.loading));
  bubble.appendChild(label);

  for (let n = 0; n < 3; n++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    bubble.appendChild(dot);
  }
  row.appendChild(bubble);
  dom.chat.appendChild(row);
  typingNode = row;
  scrollToBottom();
}

function removeTyping() {
  if (typingNode && typingNode.parentNode) typingNode.parentNode.removeChild(typingNode);
  typingNode = null;
}

/* ============================================================
   Sending
   ============================================================ */
function setPending(state) {
  pending = state;
  dom.sendBtn.disabled = state || dom.field.value.trim().length === 0;
}

async function sendToBunny(text) {
  text = (text || "").trim();
  if (!text || pending) return;

  // 1) hidden commands intercept BEFORE any network call
  const secret = detectSecret(text);
  if (secret) {
    addMessage("user", text);
    handleSecret(secret);
    dom.field.focus();
    return;
  }

  // 2) normal message → server → OpenRouter
  addMessage("user", text);
  setPending(true);
  showTyping();

  try {
    const reply = await askServer();
    removeTyping();
    addMessage("assistant", reply, { typewriter: true });
  } catch (err) {
    removeTyping();
    toast(personalize(rand(CONTENT.microcopy.error)));
    const fallback = CRISIS_RE.test(text) ? CRISIS_FALLBACK : rand(CONTENT.offlineFallbacks);
    addMessage("assistant", personalize(fallback));
  } finally {
    setPending(false);
    dom.field.focus();
  }
}

async function askServer() {
  const history = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-MAX_CONTEXT)
    .map((m) => ({ role: m.role, content: m.content }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000); // client backstop

  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error("upstream " + res.status);
  const data = await res.json();
  const reply = (data && typeof data.reply === "string") ? data.reply.trim() : "";
  if (!reply) throw new Error("empty reply");
  return reply;
}

/* ============================================================
   Hidden commands
   ============================================================ */
function detectSecret(text) {
  const n = text.trim().toLowerCase().replace(/[!.…\s]+$/g, "").trim();
  if (n === "hug me" || n === "hug" || n === "give me a hug" || n === "hold me") return "hug";
  if (n === "secret" || n === "tell me a secret" || n === "your secret")          return "secret";
  if (n === "promise" || n === "make me a promise" || n === "promise me")          return "promise";
  if (n === "breathe" || n === "breath" || n === "breathing" || n === "breathe with me") return "breathe";
  return null;
}

function handleSecret(kind) {
  if (kind === "hug") {
    addMessage("assistant", personalize(CONTENT.secrets.hug));
    hugBurst();
    spawnHearts(7);
  } else if (kind === "secret") {
    addMessage("assistant", personalize(CONTENT.secrets.secret));
  } else if (kind === "promise") {
    addMessage("assistant", personalize(CONTENT.secrets.promise));
    spawnHearts(4);
  } else if (kind === "breathe") {
    addMessage("assistant", personalize(CONTENT.secrets.breatheIntro));
    setTimeout(openBreathing, 500);
  }
}

/* ============================================================
   Daily message (local, no API)
   ============================================================ */
function showDaily() {
  if (pending) return;
  addMessage("assistant", personalize(rand(CONTENT.dailyMessages)), { daily: true });
  spawnHearts(3);
}

/* ============================================================
   Little affection animations
   ============================================================ */
function spawnHearts(n) {
  if (reduceMotion() || !dom.hearts) return;
  const glyphs = ["💕", "💖", "🌷", "✨", "🤍"];
  for (let i = 0; i < n; i++) {
    const h = document.createElement("span");
    h.className = "heart";
    h.textContent = rand(glyphs);
    h.style.left = (10 + Math.random() * 80) + "%";
    h.style.setProperty("--tx", (Math.random() * 80 - 40) + "px");
    h.style.setProperty("--r", (Math.random() * 50 - 25) + "deg");
    h.style.setProperty("--dur", (1.6 + Math.random() * 0.8) + "s");
    h.style.animationDelay = (Math.random() * 0.25) + "s";
    dom.hearts.appendChild(h);
    h.addEventListener("animationend", () => h.remove());
  }
}

function hugBurst() {
  if (reduceMotion()) return;
  dom.avatarBtn.classList.remove("hug");
  void dom.avatarBtn.offsetWidth; // reflow to restart animation
  dom.avatarBtn.classList.add("hug");
}

/* ============================================================
   Toast
   ============================================================ */
let toastEl = null;
let toastTimer = null;
function toast(msg) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  void toastEl.offsetWidth; // force reflow so re-show animates
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
}

/* ============================================================
   Breathing mode
   ============================================================ */
const BREATH_PHASES = ["Breathe in", "Hold", "Breathe out", "Hold"];

function openBreathing() {
  if (!dom.overlay.hidden) return; // already open — don't re-capture focus

  // cancel any in-flight close so a quick reopen isn't left invisible/re-hidden
  dom.overlay.classList.remove("closing");
  if (breatheCloseHandler) {
    dom.overlay.removeEventListener("animationend", breatheCloseHandler);
    breatheCloseHandler = null;
  }

  lastFocus = document.activeElement;
  dom.overlay.hidden = false;

  let i = 0;
  dom.phase.textContent = BREATH_PHASES[i];
  clearInterval(breathTimer);
  breathTimer = setInterval(() => {
    i = (i + 1) % BREATH_PHASES.length;
    dom.phase.textContent = BREATH_PHASES[i];
  }, 4000);

  dom.breatheExit.focus();
  document.addEventListener("keydown", onBreathKey);
}

function closeBreathing() {
  if (dom.overlay.hidden) return;
  clearInterval(breathTimer);
  breathTimer = null;
  document.removeEventListener("keydown", onBreathKey);
  dom.overlay.classList.add("closing");

  const done = (e) => {
    if (e && e.target !== dom.overlay) return; // ignore child animationend
    dom.overlay.hidden = true;
    dom.overlay.classList.remove("closing");
    dom.overlay.removeEventListener("animationend", done);
    breatheCloseHandler = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  breatheCloseHandler = done;

  if (reduceMotion()) done();
  else dom.overlay.addEventListener("animationend", done);
}

function onBreathKey(e) {
  if (e.key === "Escape") closeBreathing();
  // simple focus trap: only the exit button is focusable
  if (e.key === "Tab") { e.preventDefault(); dom.breatheExit.focus(); }
}

/* ============================================================
   Clear chat (two-tap guard, no jarring confirm dialog)
   ============================================================ */
function handleClear() {
  if (!clearArmed) {
    clearArmed = true;
    toast(personalize("Tap again to clear our chat 🐰"));
    setTimeout(() => { clearArmed = false; }, 3000);
    return;
  }
  clearArmed = false;
  messages = [];
  saveChat();
  dom.chat.querySelectorAll(".msg").forEach((n) => n.remove());
  removeTyping();
  if (dom.emptyChat) dom.emptyChat.style.display = "";
  setGreeting();
  toast(personalize("Fresh start, Mine 🌷"));
}

/* ============================================================
   Persistence (her device only — nothing leaves the phone)
   ============================================================ */
function saveChat() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-40)));
  } catch (_) { /* storage full / disabled — fine, just won't persist */ }
}

function loadChat() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  } catch (_) { saved = []; }

  if (!Array.isArray(saved) || saved.length === 0) return;

  messages = saved.filter(
    (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
  );
  if (messages.length) dom.emptyChat.style.display = "none";

  messages.forEach((m) => {
    const { row } = bubbleEl(m.role, m.content, { daily: !!m.daily });
    dom.chat.appendChild(row);
  });
  scrollToBottom();
}

/* ============================================================
   Events
   ============================================================ */
function wireEvents() {
  dom.composer.addEventListener("submit", (e) => {
    e.preventDefault();
    if (pending) return; // a reply is in flight — keep her typed text
    const text = dom.field.value;
    dom.field.value = "";
    dom.sendBtn.disabled = true;
    sendToBunny(text);
  });

  dom.field.addEventListener("input", () => {
    dom.sendBtn.disabled = pending || dom.field.value.trim().length === 0;
  });

  dom.dailyBtn.addEventListener("click", showDaily);
  dom.breatheBtn.addEventListener("click", openBreathing);
  dom.breatheExit.addEventListener("click", closeBreathing);
  dom.overlay.addEventListener("click", (e) => { if (e.target === dom.overlay) closeBreathing(); });

  dom.avatarBtn.addEventListener("click", () => { hugBurst(); spawnHearts(3); });
  dom.clearBtn.addEventListener("click", handleClear);
}

document.addEventListener("DOMContentLoaded", init);

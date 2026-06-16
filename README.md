# Pocket Bunny 🐰

A tiny, kind little companion — a soft pocket of comfort made as a gift.
She can tap how she feels or just type what's on her heart, and Bunny replies
in a warm, short, gentle way. It also has secret commands, a breathing
exercise, and a daily love note.

Plain **HTML + CSS + JavaScript** on the front, one small **Netlify Function**
on the back. The model key stays on the server and is never exposed to the
browser.

---

## How it works

```
browser  →  Netlify Function (ask-ai.js)  →  OpenRouter  →  reply  →  browser
```

The page never calls OpenRouter directly, so the API key is never in the
frontend, in GitHub, or in network requests the browser can see.

---

## Project structure

```
.
├── public/                     # ← the ONLY folder Netlify publishes
│   ├── index.html              #   the app shell (header, chat, breathing overlay)
│   ├── style.css               #   the soft romantic design system
│   └── script.js               #   all the front-end logic + the warm words
├── netlify/
│   └── functions/
│       └── ask-ai.js           # the server: talks to OpenRouter, holds the key
├── netlify.toml                # Netlify config (publish=public, function dir, redirect)
├── package.json                # scripts + Node engine
├── .env.example                # copy to .env for local dev (never commit .env)
└── README.md
```

> Everything that should reach the live site lives in `public/`. Anything kept
> at the repo root (personal photos, notes, etc.) is **never** published — that's
> the whole reason the app lives in its own folder.

| File | What it does |
|------|--------------|
| `public/index.html` | Markup only — header with the bunny avatar, greeting, mood chips, chat log, the input bar, and the breathing overlay. |
| `public/style.css`  | Palette, glassmorphism, typography, chat bubbles, animations, breathing mode, and full reduced-motion / focus / contrast handling. |
| `public/script.js`  | Sends messages to the function, shows replies, intercepts secret commands, runs breathing mode and the daily note, and stores the chat on her device only. |
| `netlify/functions/ask-ai.js` | The only place the key is used. Validates input, caps length, soft rate-limits, calls OpenRouter with the persona, and returns a short reply (or a gentle "sleeping" state). |

---

## Run it locally

You need the [Netlify CLI](https://docs.netlify.com/cli/get-started/) so the
function runs alongside the page.

```bash
npm install -g netlify-cli      # one time
cp .env.example .env            # then put your real key in .env
npm run dev                     # → http://localhost:8888
```

> Opening `index.html` directly (without `netlify dev`) still shows the whole
> interface — Bunny just falls back to its built-in offline replies because the
> function isn't running. To get live replies, use `npm run dev`.

---

## Deploy to Netlify

1. Push to a Git repo and **“Add new site → Import an existing project”** on Netlify (or run `netlify deploy --prod`).
2. Netlify reads `netlify.toml` automatically — no build command needed.
3. Add the environment variables (next section).
4. Done. Share the link. 💌

> **If you deploy via Git:** only committed files ship. Make sure
> `public/`, `netlify/functions/ask-ai.js`, `netlify.toml`, and `package.json`
> are committed — otherwise the site goes live **without** the function and
> every chat silently falls back to the offline replies. Verify with
> `git ls-files`. Keep private files (photos, personal notes) **out** of the
> commit; since they live at the repo root and not in `public/`, they're never
> published even if they are committed.

### Environment variables (Netlify dashboard)

**Site settings → Environment variables → Add a variable**

| Key | Required | Value |
|-----|----------|-------|
| `OPENROUTER_API_KEY` | ✅ yes | Your key from <https://openrouter.ai/keys> |
| `OPENROUTER_MODEL`   | optional | Override the model (see below) |
| `SITE_URL`           | recommended | Your live URL as an **origin** (scheme + host, no trailing slash), e.g. `https://your-site.netlify.app`. Improves attribution **and** stops other websites' browsers from calling your function on the visitor's behalf (it rejects requests whose origin isn't your site or localhost). It is not a hard abuse wall on its own — the soft rate limit handles the rest — but you should set it before sharing the link. |

After adding variables, **redeploy** so the function picks them up.

---

## Change the model

Free models come and go, and they can be busy. Two ways to switch:

- **Quickest:** set `OPENROUTER_MODEL` in Netlify to any model id from
  <https://openrouter.ai/models> (free ones end in `:free`).
- **In code:** edit `DEFAULT_MODEL` and the `FALLBACK_MODELS` list at the top of
  `netlify/functions/ask-ai.js`. The function sends the whole list so OpenRouter
  automatically tries the next model if the first is unavailable.

Good warm, short-reply free options to try:
`meta-llama/llama-3.3-70b-instruct:free`,
`deepseek/deepseek-chat-v3-0324:free`,
`google/gemini-2.0-flash-exp:free`.

> Free tiers are limited (around 20 requests/minute) and occasionally down — the
> built-in fallback list and offline replies keep the app feeling alive anyway.

---

## Make it yours

**The three words.** At the top of `script.js`:

```js
const BUNNY = {
  name:   "Pocket Bunny", // header title
  pet:    "Mine",         // what Bunny calls her
  signer: "bunny",        // sign-off on the daily note
};
```

Changing these updates all the on-screen text. To change what the **replies**
call her, also edit the three `[CUSTOMIZE]` spots in the `SYSTEM_PROMPT` inside
`netlify/functions/ask-ai.js`.

**The messages.** Everything warm lives in the `CONTENT` object in `script.js`:
greetings, mood buttons, the 28 daily notes, the secret-command replies, the
offline fallbacks, and all the little loading/error lines. Edit freely.

**The look.** Colors, glass, and spacing are CSS custom properties at the top of
`style.css` (`--bunny-rose`, `--bunny-blush`, …). Change a few values to reskin
the whole thing.

---

## Hidden things to try

Type any of these into the chat:

- `hug me` — a hug, with floating hearts 🐰
- `secret` — a little secret
- `promise` — a promise
- `breathe` — opens the breathing exercise

There's also a **breathing button** in the input bar, a **daily note** button,
and the **bunny avatar** gives a little squeeze when tapped.

---

## Safety & privacy

- The key lives only in the Netlify environment — never in the page or in Git.
- Messages aren't stored on any server and aren't logged; the only history is
  saved in her own browser (`localStorage`) and can be wiped with the header's
  fresh-start button.
- Replies are capped short, input length is capped, and the function soft
  rate-limits per visitor.
- Bunny is intentionally **not** a therapist or doctor. If something heavy or
  unsafe comes up, it gently encourages reaching out to a real, trusted person.
"# bunny-new-" 

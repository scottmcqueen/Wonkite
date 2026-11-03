# Wonkite

**[Try it → scottmcqueen.github.io/Wonkite](https://scottmcqueen.github.io/Wonkite/)**

*Good evening.*

Word tonight of a new interviewer. It does not argue, it does not advise, and it does not finish your sentences for you. It asks a question, and then it listens.

It is called Wonkite. Its mission is a modest one: to get a person past the blank page. You tell it about your day, about a subject of your choosing, or simply about yourself. For that last, it keeps a bank of some two hundred and fifty getting-to-know-you questions on sixteen themes, from growing up to the road ahead. It asks one question at a time, each drawn from what you have just said. When you are through, it hands back your own words, set down as a Markdown draft. The questions, if you want them, can come along too.

## The report

**It works offline.** The questions come from the device itself. Wonkite picks out a detail from your last answer, a place, a name, a "your brother's truck," and builds its next question around it. It moves through the reporter's standard set: the detail, the why, the people involved, what it looked and sounded like, how it differed from what you expected, and what someone hearing the short version would get wrong. When you mention a feeling, it follows the feeling. When you say "and then," it asks what happened next. After four questions on one line of inquiry, it steps back and asks what else belongs in the story. Nothing you say leaves the device.

**It interviews by the book.** Its questions follow the working rules of journalists, oral historians and researchers: short, open and neutral; the speaker's own words handed back to them; the story and its details first, and only then what it meant. The full account, with sources, is in [docs/INTERVIEWING.md](docs/INTERVIEWING.md).

**It can be smarter, if you ask.** In Settings, a reporter may switch on the online mode and give the address of a question service, found in `worker/`. Only the last six questions and answers are sent. Should the service be slow, or fail to answer at all, the offline interviewer takes the next question without missing a beat.

**It keeps your attention on the question.** While you are answering, the rest of the page dims and the answer box comes forward. Move the mouse away, or press Esc, and the room comes back up.

**It keeps your notes.** The session, and any answer not yet sent, stay in the browser's local storage. On browsers that offer it, Chrome and Safari among them, you may speak your answers rather than type them.

## Putting it on the air

Any static host will do. The entire program is four files:

    index.html  manifest.webmanifest  sw.js  icon.svg

Served over HTTPS, it can be added to a phone's home screen and will work without a connection.

To try it locally:

    python3 -m http.server 8080

and open http://localhost:8080.

## The question service

The optional service runs on Cloudflare Workers AI.

    cd worker
    npx wrangler deploy

Its address will be `https://wonkite-api.<your-subdomain>.workers.dev/question`. Once the app has a permanent home, set `ALLOWED_ORIGIN` in `wrangler.toml` to that origin. The model is named at the top of `src/index.js`.

---

*And that's the way it is.*

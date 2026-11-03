# Wonkite

**[Try it → scottmcqueen.github.io/Wonkite](https://scottmcqueen.github.io/Wonkite/)**

*Good evening.*

Word tonight of a new interviewer. It does not argue, it does not advise, and it does not finish your sentences for you. It asks a question, and then it listens.

It is called Wonkite. Its mission is a modest one: to get a person past the blank page. You tell it about your day, about a subject of your choosing, or simply about yourself. For that last, it keeps a bank of some two hundred and fifty getting-to-know-you questions on sixteen themes, from growing up to the road ahead. It asks one question at a time, each drawn from what you have just said. When you are through, it hands back your own words, set down as a Markdown draft. The questions, if you want them, can come along too.

## The report

**It works offline.** The questions come from the device itself. Wonkite picks out a detail from your last answer, a place, a name, a "your old truck," and builds its next question around it. Each line of inquiry starts with the story, moves to the details, the people, the moments before and after, and only at the end asks what you make of it all. When you use a describing word, it asks what you mean by it. When you mention a feeling, it follows the feeling. When you say "and then," it asks what happened next. Threads you mentioned and it didn't follow, it comes back to later. Nothing you say leaves the device.

**It interviews by the book.** Its questions follow the working rules of journalists, oral historians and researchers: short, open and neutral; the speaker's own words handed back to them; the story and its details first, and only then what it meant. The full account, with sources, is in [docs/INTERVIEWING.md](docs/INTERVIEWING.md).

**It can be smarter, if you ask.** In Settings, a reporter may switch on the online mode and give the address of a question service, found in `worker/`. Only the last six questions and answers are sent. Should the service be slow, or fail to answer at all, the offline interviewer takes the next question without missing a beat.

**It keeps your attention on the question.** While you are answering, the rest of the page dims and the answer box comes forward. Move the mouse away, or press Esc, and the room comes back up. In Settings there are eight colour themes, from Paper to Lamplight, and the page eases from one to the next through a soft blur.

**It takes notes on itself.** Every question carries a thumbs up and a thumbs down, and so does each one in the log. A question rated down twice is set aside on that device, and a bank question rated down is not asked again. Those who choose to may also share their ratings with the question service, so the questions can be improved for everyone. The answer that prompted a question is sent only if the reporter ticks that box as well.

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

Its address will be `https://wonkite-api.<your-subdomain>.workers.dev/question`. To collect shared question ratings, the service needs a small database and a private token for reading the results. Follow the steps in `wrangler.toml`, then redeploy. The summary, worst-rated questions first, with the latest answer that led to a thumbs down, is at:

    curl -H "Authorization: Bearer $ADMIN_TOKEN" https://wonkite-api.<your-subdomain>.workers.dev/feedback/summary

Once the app has a permanent home, set `ALLOWED_ORIGIN` in `wrangler.toml` to that origin. The model is named at the top of `src/index.js`.

---

*And that's the way it is.*

# Wonkite

**[Try it → scottmcqueen.github.io/Wonkite](https://scottmcqueen.github.io/Wonkite/)**

A small interviewer, named with a nod to Walter Cronkite. It asks one question at a time so you can talk your way past the blank page. When you're done, it hands back what you said as a Markdown draft.

## How it works

- **Offline (default).** Questions come from a question bank on the device. It picks a phrase from your last answer ("your brother's truck", "Marquette") and rotates through question types: detail, why, people, senses, contrast, example, what someone would get wrong. It notices feelings and "and then" moments and follows them. After about four questions on one thread it steps back. Nothing leaves the device.
- **Online (optional).** In Settings, turn on smarter questions and give it the URL of the question service in `worker/`. It sends the last six questions and answers and gets one question back. If the service is slow or fails, the offline interviewer answers instead.
- Sessions and the unsent answer are kept in the browser's local storage.
- Voice input uses the browser's speech recognition where available (Chrome, Safari).

## Run it

Any static host works. The files at the root are the whole app:

    index.html  manifest.webmanifest  sw.js  icon.svg

Served over HTTPS it can be added to a phone's home screen and works offline.

Locally: `python3 -m http.server 8080` and open http://localhost:8080.

## Question service (Cloudflare Workers AI)

    cd worker
    npx wrangler deploy

The endpoint is `https://wonkite-api.<your-subdomain>.workers.dev/question`. Once the app has a home, set `ALLOWED_ORIGIN` in `wrangler.toml` to its origin. The model is set at the top of `src/index.js`.

const functions = require("firebase-functions")
const { URL } = require("url")
const puppeteer = require("puppeteer")
const lighthouse = require("lighthouse")

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: "1GB",
}

exports.lh = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (request, response) => {
    if (!request.query.url) {
      response.status(400).send("No URL sent for report.")
    }
    const message = await runLighthouseReport(request.query.url)
      .then(message => {
        return message
      })
      .catch(error => {
        response.status(500)
        return error
      })
    response.send(message)
  })

const runLighthouseReport = async url => {
  // Use Puppeteer to launch Chrome
  const browser = await puppeteer.launch({
    args: ["--show-paint-rects"]
  });

  // Lighthouse will open the URL.
  const { lhr } = await lighthouse(url, {
    port: new URL(browser.wsEndpoint()).port,
    output: "json",
    logLevel: "info",
  })

  await browser.close()

  return `Lighthouse scores: ${Object.values(lhr.categories)
    .map(c => `${c.title} ${c.score * 100}`)
    .join(", ")}`
}

require("dotenv").config()
const functions = require("firebase-functions")
const { URL } = require("url")
const puppeteer = require("puppeteer")
const lighthouse = require("lighthouse")
const admin = require("firebase-admin")
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})
const db = admin.database()

/**
 * @type {functions.RuntimeOptions}
 */
const runtimeOpts = {
  timeoutSeconds: 300,
  memory: "1GB",
}

exports.lh = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (request, response) => {
    response.status(404)
    let responseBody = "Nothing here."

    // Create a report
    if (request.method === "POST") {
      if (!request.body.url) {
        response.status(400).send("No URL sent for report.")
        return
      }
      responseBody = await runLighthouseReport(request.body.url).then(
        message => {
          response.status(200)
          return message
        }
      )
      .catch(error => {
        response.status(500)
        return `${error.name}: ${error.message} at ${error.stack}`
      })
    }

    // Get a report
    if (request.method === "GET") {
      if (!request.query.url) {
        response.status(400).send("No URL sent for generating a report.")
        return
      }
      responseBody = await getLighthouseReport(request.query.url).then(
        snapshot => {
          if (snapshot.exists()) {
            response.status(200)
            return snapshot.val()
          } else {
            response.status(404)
            return "No report was found for this URL."
          }
        }
      )
      .catch(error => {
        response.status(500)
        return `${error.name}: ${error.message} at ${error.stack}`
      })
    }

    // TODO: Update a report with PUT

    // TODO: Delete a report with DELETE

    response.send(responseBody)
  })

const runLighthouseReport = async url => {
  // Use Puppeteer to launch Chrome
  const browser = await puppeteer.launch({
    args: ["--show-paint-rects"],
  })

  // Lighthouse will open the URL.
  const { lhr } = await lighthouse(url, {
    port: new URL(browser.wsEndpoint()).port,
    output: "json",
  })

  await browser.close()

  // Save on Realtime Database
  const reportsRef = db.ref(
    `reports/${encodeURIComponent(url).replace(/\./g, "dot")}`
  )
  const categories = Object.fromEntries(
    Object.values(lhr.categories).map(({ title, score }) => [title, score])
  )
  reportsRef.set(categories)

  // Return message
  return categories
}

const getLighthouseReport = async url => {
  const reportRef = db.ref(
    `reports/${encodeURIComponent(url).replace(/\./g, "dot")}`
  )
  const snapshot = await reportRef.once("value");
  return snapshot;
}

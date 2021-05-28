const functions = require("firebase-functions")
const { URL } = require("url")
const puppeteer = require("puppeteer")
const lighthouse = require("lighthouse")
const cors = require("cors")({ origin: true })
const admin = require("firebase-admin")
const serviceAccount = require("./service-account-key.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://web-vitals-seo-audit-default-rtdb.firebaseio.com/",
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
  .https.onRequest((request, response) => {
    cors(request, response, () => {
      response.status(404)
      response.set("Access-Control-Allow-Origin", "*")

      console.log(request.method)

      // Create a report
      if (request.method === "POST") {
        if (!request.body.url) {
          response.status(400).send("No URL sent for report.")
          return
        }
        runLighthouseReport(request.body.url)
          .then(message => {
            response.status(200).send(message)
            return
          })
          .catch(error => {
            response
              .status(500)
              .send(`${error.name}: ${error.message} at ${error.stack}`)
          })
        return
      }

      // Get a report
      if (request.method === "GET") {
        if (!request.query.url) {
          response.status(400).send("No URL sent for generating a report.")
          return
        }
        getLighthouseReport(request.query.url)
          .then(snapshot => {
            if (snapshot.exists()) {
              response.status(200).send(snapshot.val())
              return
            } else {
              response.status(404).send("No report was found for this URL.")
              return
            }
          })
          .catch(error => {
            response
              .status(500)
              .send(`${error.name}: ${error.message} at ${error.stack}`)
          })
        return
      }

      // Delete a report
      if (request.method === "DELETE") {
        if (!request.body.url) {
          response.status(400).send("No URL sent for generating a report.")
          return
        }
        deleteLighthouseReport(request.body.url).catch(error => {
          response
            .status(500)
            .send(`${error.name}: ${error.message} at ${error.stack}`)
        })
        return
      }

      response.status(400).send("Bad request.")
    })
  })

/**
 * Runs a Lighthouse report and saves on DB
 * @param {String} url
 * @returns {String}
 */
const runLighthouseReport = async url => {
  // Use Puppeteer to launch Chrome
  const browser = await puppeteer.launch({
    args: ["--show-paint-rects"],
  })

  // Lighthouse will open the URL.
  const { lhr } = await lighthouse(url, {
    port: new URL(browser.wsEndpoint()).port,
    output: "json",
    onlyCategories: ["performance"],
    logLevel: "info",
  })

  await browser.close()

  // Save on Realtime Database
  const reportsRef = db.ref(
    `reports/${encodeURIComponent(url).replace(/\./g, "dot")}`
  )
  const usedAudits = [
    "first-contentful-paint",
    "speed-index",
    "largest-contentful-paint",
    "interactive",
    "cumulative-layout-shift",
    "total-blocking-time",
  ]
  const audits = Object.fromEntries(
    Object.values(lhr.audits)
      .filter(({ id }) => {
        return usedAudits.some(auditId => auditId === id)
      })
      .map(({ title, displayValue }) => [title, displayValue])
  )
  reportsRef.set(audits)

  // Return message
  return JSON.stringify(audits)
}

/**
 * Get a report from DB
 * @param {String} url
 * @returns {admin.database.DataSnapshot}
 */
const getLighthouseReport = async url => {
  const reportRef = db.ref(
    `reports/${encodeURIComponent(url).replace(/\./g, "dot")}`
  )
  const snapshot = await reportRef.once("value")
  return snapshot
}

/**
 * Delete a report from DB
 * @param {String} url
 * @returns {String}
 */
const deleteLighthouseReport = async url => {
  const parentRef = db.ref(`reports`)
  const parentSnapshot = await parentRef.once("value")
  const reportExists = parentSnapshot.hasChild(
    encodeURIComponent(url).replace(/\./g, "dot")
  )
  if (reportExists) {
    const reportRef = db.ref(
      `reports/${encodeURIComponent(url).replace(/\./g, "dot")}`
    )
    await reportRef.remove()
    return `Report from url ${url} removed successfully.`
  } else {
    return `No report exists with url "${url}".`
  }
}

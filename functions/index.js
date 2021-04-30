require("dotenv").config()
const functions = require("firebase-functions")
const { URL } = require("url")
const puppeteer = require("puppeteer")
const lighthouse = require("lighthouse")
const admin = require("firebase-admin")
const serviceAccount = require('./service-account-key.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: functions.config().database.url,
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
      responseBody = await runLighthouseReport(request.body.url)
        .then(message => {
          response.status(200)
          return message
        })
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
      responseBody = await getLighthouseReport(request.query.url)
        .then(snapshot => {
          if (snapshot.exists()) {
            response.status(200)
            return snapshot.val()
          } else {
            response.status(404)
            return "No report was found for this URL."
          }
        })
        .catch(error => {
          response.status(500)
          return `${error.name}: ${error.message} at ${error.stack}`
        })
    }

    // Delete a report
    if (request.method === "DELETE") {
      if (!request.body.url) {
        response.status(400).send("No URL sent for generating a report.")
        return
      }
      responseBody = await deleteLighthouseReport(request.body.url).catch(
        error => {
          response.status(500)
          return `${error.name}: ${error.message} at ${error.stack}`
        }
      )
    }

    response.send(responseBody)
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
  const parentRef = db.ref(
    `reports`
  )
  const parentSnapshot = await parentRef.once("value")
  const reportExists = parentSnapshot.hasChild(encodeURIComponent(url).replace(/\./g, "dot"))
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

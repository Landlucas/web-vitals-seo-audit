const functions = require("firebase-functions")
const { URL } = require("url")
const puppeteer = require("puppeteer")
const lighthouse = require("lighthouse")
const cors = require("cors")({ origin: true })
const fetch = require("node-fetch")
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
          response
            .status(400)
            .send("No URL sent for generating a lighthouse report.")
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
          response
            .status(400)
            .send("No URL sent for generating a lighthouse report.")
          return
        }
        deleteLighthouseReport(request.body.url).catch(error => {
          response
            .status(500)
            .send(`${error.name}: ${error.message} at ${error.stack}`)
        })
        return
      }

      response.status(400).send("Bad request.").end()
    })
  })

exports.moz = functions
  .runWith(runtimeOpts)
  .https.onRequest((request, response) => {
    cors(request, response, () => {
      response.status(404)
      response.set("Access-Control-Allow-Origin", "*")

      // Create a moz report
      if (request.method === "POST") {
        if (!request.body.url) {
          response.status(400).send("No URL sent for moz report.")
          return
        }
        getMozUrlMetrics(request.body.url)
          .then(metrics => {
            if (metrics.results) {
              const message = {
                "page-authority": {
                  id: "page-authority",
                  displayValue: metrics.results[0].page_authority,
                  score: -1,
                  title: "Page Authority (PA)",
                  description:
                    "Page Authority (PA) is a score developed by Moz that predicts how well a specific page will rank on search engine result pages (SERP)",
                },
                "domain-authority": {
                  id: "domain-authority",
                  displayValue: metrics.results[0].domain_authority,
                  score: -1,
                  title: "Domain Authority (DA)",
                  description:
                    "Domain Authority (DA) is a search engine ranking score developed by Moz that predicts how likely a website is to rank in search engine result pages (SERPs)",
                },
              }
              response.status(200).send(message)
            } else {
              response.status(400).send(metrics)
            }
            return
          })
          .catch(error => {
            response
              .status(500)
              .send(`${error.name}: ${error.message} at ${error.stack}`)
          })
        return
      }

      response.status(400).send("Bad request.").end()
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

  let audits = {}
  for (usedAuditId of usedAudits) {
    audits[usedAuditId] = lhr.audits[usedAuditId]
  }
  reportsRef.set(JSON.parse(JSON.stringify(audits)))

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

const getMozUrlMetrics = async url => {
  return await fetch(`https://lsapi.seomoz.com/v2/url_metrics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " +
        Buffer.from(
          functions.config().moz.id + ":" + functions.config().moz.key
        ).toString("base64"),
    },
    mode: "no-cors",
    body: JSON.stringify({ targets: [url] }),
  }).then(response => {
    return response.json()
  })
}

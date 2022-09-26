export const newMozReport = async url => {
  let report = {
    found: false,
    error: false,
    data: null,
  }
  report.data = await fetch(`${process.env.GATSBY_MOZ_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url }),
  })
    .then(response => {
      if (response.status === 200) {
        report.found = true
        return response.json()
      } else if (response.status === 500) {
        report.error = true
        return response.text()
      } else {
        return response.text()
      }
    })
    .then(response => {
      if (report.found) {
        return response
      } else if (report.error) {
        console.error(response)
      } else {
        console.warn(response)
      }
    })
    .catch(error => {
      report.error = true
      console.error(error)
    })
  return report
}

export const getLhReport = async url => {
  let report = {
    found: false,
    error: false,
    data: null,
  }
  report.data = await fetch(`${process.env.GATSBY_LHR_URL}?url=${url}`)
    .then(response => {
      if (response.status === 200) {
        report.found = true
        return response.json()
      } else {
        return response.text()
      }
    })
    .then(response => {
      if (report.found) {
        return response
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

export const newLhReport = async url => {
  let report = {
    found: false,
    error: false,
    data: null,
  }
  report.data = await fetch(`${process.env.GATSBY_LHR_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url }),
  })
    .then(response => {
      if (response.status === 200) {
        report.found = true
        return response.json()
      } else {
        return response.text()
      }
    })
    .then(response => {
      if (report.found) {
        return response
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

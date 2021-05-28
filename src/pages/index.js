import * as React from "react"
import { useState } from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Masthead from "../components/masthead"
import { makeStyles } from "@material-ui/core/styles"
import {
  Box,
  Button,
  Container,
  TextField,
  CircularProgress,
} from "@material-ui/core"

import { useStaticQuery, graphql } from "gatsby"

const useStyles = makeStyles(theme => ({
  urlField: {
    marginTop: 0,
    marginRight: theme.spacing(2),
    marginBottom: 0,
    marginLeft: theme.spacing(2),
    width: "100%",
    maxWidth: "45ch",
  },
}))

const IndexPage = () => {
  const classes = useStyles()
  const query = useStaticQuery(graphql`
    query {
      allDataYaml(filter: { slug: { eq: "home" } }) {
        edges {
          node {
            masthead {
              title
              description
            }
          }
        }
      }
    }
  `)
  const data = query.allDataYaml.edges[0].node
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState("")
  let reportFound = false

  const handleSubmit = async event => {
    event.preventDefault()
    if (url.length > 0 && !loading) {
      reportFound = false
      setResult("")
      setLoading(true)
      getReport().then(response => {
        if (reportFound) {
          setResult(JSON.stringify(response))
          setSuccess(true)
          setLoading(false)
        } else {
          newReport().then(response => {
            if (reportFound) {
              setSuccess(true)
              setResult(JSON.stringify(response))
            } else {
              setSuccess(false)
            }
            setLoading(false)
          })
        }
      })
    }
  }

  const getReport = async () => {
    return await fetch(
      `http://127.0.0.1:5001/web-vitals-seo-audit/us-central1/lh?url=${url}`
    )
      .then(response => {
        if (response.status === 200) {
          reportFound = true
          return response.json()
        } else {
          return response.text()
        }
      })
      .then(response => {
        if (reportFound) {
          return JSON.stringify(response)
        } else {
          console.warn(response)
        }
      })
      .catch(error => {
        setSuccess(false)
        console.error(error)
      })
  }

  const newReport = async () => {
    return await fetch(
      `http://127.0.0.1:5001/web-vitals-seo-audit/us-central1/lh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url }),
      }
    )
      .then(response => {
        if (response.status === 200) {
          reportFound = true
          return response.json()
        } else {
          return response.text()
        }
      })
      .then(response => {
        if (reportFound) {
          return JSON.stringify(response)
        } else {
          console.error(response)
        }
      })
      .catch(error => {
        setSuccess(false)
        console.error(error)
      })
  }

  return (
    <Layout>
      <Seo title="Home" />
      <Masthead data={data.masthead} />
      <Container maxWidth="md">
        <Box my={4}>
          <form onSubmit={handleSubmit}>
            <Box display="flex" justifyContent="center">
              <TextField
                label="URL de uma página"
                variant="filled"
                margin="dense"
                className={classes.urlField}
                name="url"
                value={url}
                onInput={e => setUrl(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={loading}
              >
                Analisar
              </Button>
            </Box>
          </form>
        </Box>
        <Box my={4} display="flex" justifyContent="center">
          {loading && <CircularProgress />}
          {success && !loading && result}
        </Box>
      </Container>
    </Layout>
  )
}

export default IndexPage

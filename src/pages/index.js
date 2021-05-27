import * as React from "react"
import { useState } from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Masthead from "../components/masthead"
import { makeStyles } from "@material-ui/core/styles"
import { Box, Button, Container, TextField } from "@material-ui/core"

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
  const handleSubmit = event => {
    event.preventDefault()
    if (url.length > 0) {
      // TODO: Fetch with GET to get cached results
      fetch(`https://us-central1-web-vitals-seo-audit.cloudfunctions.net/lh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url }),
      })
    }
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
              >
                Analisar
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </Layout>
  )
}

export default IndexPage

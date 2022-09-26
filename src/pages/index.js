import * as React from "react"
import { useState } from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"
import Masthead from "../components/masthead"
import Metrics from "../components/metrics"
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  TextField,
  CircularProgress,
  IconButton,
  Collapse,
} from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';

import { getLhReport, newLhReport } from "../utils/lh-reports"
import { newMozReport } from "../utils/moz-reports"

import { useStaticQuery, graphql } from "gatsby"

const IndexPage = () => {
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
  const [invalid, setInvalid] = useState(false)
  const [error, setError] = useState(false)
  const [result, setResult] = useState({})

  const handleSubmit = async event => {
    event.preventDefault()
    setError(false)
    setInvalid(false)
    if (url.length > 0 && !loading) {
      setResult({})
      setLoading(true)
      let lhReport = await getLhReport(url)
      if (lhReport.error) {
        setSuccess(false)
        setError(true)
      } else if (lhReport.found) {
        setResult(lhReport.data)
        setSuccess(true)
      } else {
        lhReport = await newLhReport(url)
        if (lhReport.error) {
          setSuccess(false)
          setError(true)
        } else if (lhReport.found) {
          setSuccess(true)
          setResult(lhReport.data)
        } else {
          setInvalid(true)
          setSuccess(false)
        }
      }
      if (lhReport.found) {
        let mozReport = await newMozReport(url)
        if (mozReport.error) {
          setSuccess(false)
          setError(true)
        } else if (mozReport.found) {
          setResult({
            ...lhReport.data,
            ...mozReport.data,
          })
        } else {
          setSuccess(false)
          setInvalid(true)
        }
      }
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Seo title="Home" />
      <Masthead data={data.masthead} />
      <Box py={5} bgcolor="background.secondary">
        <Container maxWidth="md" bgcolor="primary.main">
          <form onSubmit={handleSubmit}>
            <Box display="flex" justifyContent="center">
              <TextField
                label="URL de uma página"
                variant="filled"
                margin="dense"
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
          {loading && (
            <Box mt={4} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          )}
          {success && !loading && result && (
            <Metrics items={Object.values(result)} />
          )}
          <Collapse in={error}>
            <Box maxWidth={550} mt={3} mx="auto">
              <Alert
                severity="error"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setError(false)
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                <AlertTitle>Oops!</AlertTitle>
                Houve um erro inesperado ao analisar essa URL.
              </Alert>
            </Box>
          </Collapse>
          <Collapse in={invalid}>
            <Box maxWidth={550} mt={3} mx="auto">
              <Alert
                severity="warning"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setInvalid(false)
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                <AlertTitle>Oops!</AlertTitle>A URL solicitada é inválida ou não
                existe.
              </Alert>
            </Box>
          </Collapse>
        </Container>
      </Box>
    </Layout>
  )
}

export default IndexPage

import * as React from "react"
import PropTypes from "prop-types"
import { Box, Container, Typography } from "@mui/material"

const Masthead = ({ data }) => (
  <Container maxWidth="lg">
    <Box my={8} textAlign="center">
      <Typography variant="h3" component="h1" gutterBottom>
        {data.title}
      </Typography>
      <Typography variant="subtitle1" component="span" gutterBottom>
        {data.description}
      </Typography>
    </Box>
  </Container>
)

Masthead.propTypes = {
  data: PropTypes.exact({
    title: PropTypes.string,
    description: PropTypes.string,
  }),
}

Masthead.defaultProps = {
  data: {
    title: ``,
    description: ``,
  },
}

export default Masthead

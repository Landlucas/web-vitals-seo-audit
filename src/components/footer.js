import * as React from "react"
import PropTypes from "prop-types"
import { Box, Container, Typography } from "@mui/material"

const Footer = ({ siteTitle }) => (
  <footer>
    <Container maxWidth="lg">
      <Box my={6} textAlign="center">
        <Typography variant="body2" component="span" gutterBottom>
          © {new Date().getFullYear()} {siteTitle}
        </Typography>
      </Box>
    </Container>
  </footer>
)

Footer.propTypes = {
  siteTitle: PropTypes.string,
}

Footer.defaultProps = {
  siteTitle: ``,
}

export default Footer

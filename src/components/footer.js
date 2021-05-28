import * as React from "react"
import PropTypes from "prop-types"
import Container from "@material-ui/core/Container"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"

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

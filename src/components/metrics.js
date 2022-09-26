import * as React from "react"
import PropTypes from "prop-types"
import { Box, Grid } from "@mui/material"
import MetricCard from "./metric-card"

const Metrics = ({ items }) => {
  const listItems = items.map(item => (
    <Grid item xs={4}>
      <MetricCard item={item}></MetricCard>
    </Grid>
  ))
  return (
    <Box mt={4}>
      <Grid container spacing={2}>
        {listItems}
      </Grid>
    </Box>
  )
}

Metrics.propTypes = {
  items: PropTypes.array,
}

Metrics.defaultProps = {
  items: {},
}

export default Metrics

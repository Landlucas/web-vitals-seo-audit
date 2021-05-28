import * as React from "react"
import PropTypes from "prop-types"
import { Box, Typography, Card, CardContent, Grid } from "@material-ui/core"

const Metrics = ({ items }) => {
  const listItems = items.map(item =>
    <Grid item xs={4}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {item.title}
          </Typography>
          <Typography variant="body1" component="p" gutterBottom>
            {item.displayValue}
          </Typography>
          <Typography variant="body2" component="p" gutterBottom>
            {item.description}
          </Typography>
        </CardContent>
      </Card>
    </Grid>  
  );
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

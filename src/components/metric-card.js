import * as React from "react"
import PropTypes from "prop-types"
import { Typography, Card, CardContent } from "@mui/material"
import ReactMarkdown from "react-markdown"

const scoreColor = score => {
  if (score === 1) {
    return "#e53935"
  } else if (score === -1) {
    return "inherit"
  } else if (score < 0.7) {
    return "#fb8c00"
  } else {
    return "#18b663"
  }
}

const MetricCard = ({ item }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {item.title}
        </Typography>
        <Typography
          variant="h6"
          component="p"
          gutterBottom
        >
          {item.displayValue}
        </Typography>
        <Typography variant="body2" component="p" gutterBottom>
          <ReactMarkdown>{item.description}</ReactMarkdown>
        </Typography>
      </CardContent>
    </Card>
  )
}

MetricCard.propTypes = {
  item: PropTypes.object,
}

MetricCard.defaultProps = {
  item: {},
}

export default MetricCard

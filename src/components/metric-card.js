import * as React from "react"
import PropTypes from "prop-types"
import { makeStyles } from "@material-ui/core/styles"
import { Typography, Card, CardContent } from "@material-ui/core"
import ReactMarkdown from "react-markdown"

const useStyles = makeStyles({
  root: {
    height: "100%",
  },
  score: (props) => ({
    color: props.scoreColor
  })
})

const scoreColor = (score) => {
  if (score === 1) {
    return '#e53935'
  } else if (score === -1) {
    return 'inherit'
  } else if (score < 0.7) {
    return '#fb8c00'
  } else {
    return '#18b663'
  }
}

const MetricCard = ({ item }) => {
  const props = { scoreColor: scoreColor(item.score) };
  const classes = useStyles(props)
  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {item.title}
        </Typography>
        <Typography
          className={classes.score}
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

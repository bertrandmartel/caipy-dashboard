import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';

const styles = theme => ({
    progress: {
        margin: `0 ${theme.spacing.unit * 2}px`,
    },
});

class ProgressView extends Component {

    render(){
      const { classes } = this.props;

      return (
          <div className={this.props.value ? "center-div hidden" : "center-div"}>
            <CircularProgress className={classes.progress} size={50} />
            <p className="error-message">{this.props.message}</p>
          </div>
      );
    }
}

ProgressView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ProgressView);
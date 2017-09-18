/* eslint-disable flowtype/require-valid-file-annotation */

import React, { Component } from 'react';
import Dialog, {
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import CloseIcon from 'material-ui-icons/Close';

import Flowchart from './FlowChart.js';

const styles = theme => ({
    title: {
        margin: '0 auto'
    }
});

/**
 * FlowChart view
 */
class FlowChartView extends Component {

    chartParams = {
        code: "",
        options: {}
    };

    created = false;

    constructor(props) {
        super(props);
        this.close = this.close.bind(this);
    }

    close() {
        if (typeof this.props.onDialogClose === 'function') {
            this.props.onDialogClose();
        }
    };

    /**
     * handle the enter key
     * 
     * @param  {Object} e event
     */
    handleKeyPress(e) {
        if (e.key === 'Enter') {}
    }

    render() {
        const { classes } = this.props;

        if (this.props.chartCode) {
            this.chartParams.chartCode = this.props.chartCode;
        }
        if (this.props.chartOptions) {
            this.chartParams.chartOptions = this.props.chartOptions;
        }

        if (this.created || this.props.state === "create") {

            this.created = true;

            return <div>
                    <Dialog 
                        fullScreen
                        open={this.props.open} 
                        onRequestClose={this.close}
                        transition={<Slide direction="up" />}>
                        <AppBar className={classes.appBar}>
                            <Toolbar>
                              <IconButton color="contrast" onClick={this.close} aria-label="Close">
                                <CloseIcon />
                              </IconButton>
                              <Typography type="title" color="inherit" className={classes.flex}>
                                Close
                              </Typography>
                              <Typography type="title" color="inherit" className={classes.title}>
                                {'Start Over Flowchart : ' + this.props.startoverType}
                              </Typography>
                            </Toolbar>
                        </AppBar>
                        <DialogTitle>{'Start Over Flowchart : ' + this.props.startoverType}</DialogTitle>
                        <DialogContent>
                          <Flowchart
                                chartCode={this.chartParams.chartCode}
                                options={this.chartParams.chartOptions}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
        } else {
            return <div>
                    <Dialog fullScreen open={this.props.open} onRequestClose={this.close} transition={<Slide direction="up" />}>
                        <DialogTitle>{'Start Over Flowchart : ' + this.props.startoverType}</DialogTitle>
                        <DialogContent>
                        </DialogContent>
                    </Dialog>
                </div>
        }
    }
}

FlowChartView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FlowChartView);
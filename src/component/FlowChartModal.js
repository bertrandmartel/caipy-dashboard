/* eslint-disable flowtype/require-valid-file-annotation */

import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Flowchart from './FlowChart.js';

const styles = theme => ({
    dialog: {
        maxWidth: 900,
        width: '100%'
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

    opacity = false;
    created = false;

    constructor(props) {
        super(props);
        this.close = this.close.bind(this);
    }

    componentDidMount() {
        this.opacity = this.props.flowChartOpacity;
        this.setOpacity();
    }

    close() {
        if (typeof this.props.onDialogClose === 'function') {
            this.props.onDialogClose();
        }
    };

    setOpacity() {
        /*
        //waiting for react materialize to implement className on modal
        if (!this.opacity) {
            $('#flowchart-modal').css('background-color', 'rgba(255, 255, 255, 0.5)');
        } else {
            $('#flowchart-modal').css('background-color', 'rgba(255, 255, 255, 255)');
        }
        this.props.onSetFlowChartOpacity(this.opacity);
        this.opacity = !this.opacity;
        */
    }

    /**
     * handle the enter key
     * 
     * @param  {Object} e event
     */
    handleKeyPress(e) {
        if (e.key === 'Enter') {}
    }

    render() {
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
                        open={this.props.open} 
                        onRequestClose={this.close}>
                        <DialogTitle>{'Start Over Flowchart : ' + this.props.startoverType}</DialogTitle>
                        <DialogContent>
                          <Flowchart
                                
                                chartCode={this.chartParams.chartCode}
                                options={this.chartParams.chartOptions}
                            />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => this.setOpacity()}>Toggle opacity</Button>   
                          <Button onClick={() => this.close()}>Close</Button>
                        </DialogActions>
                    </Dialog>
                </div>
        } else {
            return <div>
                    <Dialog open={this.props.open} onRequestClose={this.close}>
                        <DialogTitle>{'Start Over Flowchart : ' + this.props.startoverType}</DialogTitle>
                        <DialogContent>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => this.setOpacity()}>Toggle opacity</Button>   
                          <Button onClick={() => this.close()}>Close</Button>
                        </DialogActions>
                    </Dialog>
                </div>
        }
        /*
        if (this.created || this.props.state === "create") {
            
            this.created = true;

            return <Modal
                    fixedFooter
                    id="flowchart-modal"
                    header={'Start Over Flowchart : ' + this.props.startoverType}
                    actions={
                        <div>
                            <Button className="blue darken-1" waves='light' onClick={() => this.close()}>Close</Button>
                            <Button className="blue darken-1" waves='light' onClick={() => this.setOpacity()}>Toggle opacity</Button>
                        </div>
                    }
                    >
                    <Flowchart
                        chartCode={this.chartParams.chartCode}
                        options={this.chartParams.chartOptions}
                    />
                </Modal>
        } else {
            return <Modal
                    fixedFooter
                    id="flowchart-modal"
                    header='Start Over flowchart'
                    actions={
                        <div>
                            <Button className="blue darken-1" waves='light' onClick={() => this.close()}>Close</Button>
                        </div>
                    }
                    >
                </Modal>
        }
        */
    }
}

FlowChartView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FlowChartView);
//react
import React, { Component } from 'react';

//react components
import { Modal, Button } from 'react-materialize';

import Flowchart from './FlowChart.js';

// jquery
import $ from 'jquery';
window.$ = window.jQuery = require('jquery');

/**
 * FlowChart view
 */
export class FlowChartView extends Component {

    chartParams = {
        code: "",
        options: {}
    };

    opacity = false;
    created = false;

    componentDidMount(){
        this.opacity = this.props.flowChartOpacity;
        this.setOpacity();
    }

    /**
     * Close the modal
     *
     */
    close() {
        $('#flowchart-modal').modal('close');
    }

    setOpacity() {
        //waiting for react materialize to implement className on modal
        if (!this.opacity) {
            $('#flowchart-modal').css('background-color', 'rgba(255, 255, 255, 0.5)');
        } else {
            $('#flowchart-modal').css('background-color', 'rgba(255, 255, 255, 255)');
        }
        this.props.onSetFlowChartOpacity(this.opacity);
        this.opacity = !this.opacity;
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
    }
}
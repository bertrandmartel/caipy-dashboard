//react
import React, { Component } from 'react';

//react components
import { Modal, Button, Input, Row } from 'react-materialize';

// jquery
import $ from 'jquery';
window.$ = window.jQuery = require('jquery');

/**
 * Check if URL is valid https://stackoverflow.com/a/30229098/2614364
 * 
 * @param  {String}  str url
 * @return {Boolean}     url validity
 */
function isValidUrl(str) {
    return /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!-/]))?/.test(str);
}

/**
 * Check if string evaluates to a positive number
 * 
 * @param  {String}  str input data
 * @return {Boolean}     true if input validated
 */
function isValidPositiveNumber(str) {
    return !isNaN(parseFloat(str)) && isFinite(str) && (parseInt(str, 10) > 0);
}

/**
 * Caipy URL settings view
 */
export class UrlSettingsView extends Component {

    /**
     * State holding the error message
     * 
     * @type {Object}
     */
    state = {
        message: ""
    }

    constructor() {
        super();
        this.setUrlSettings = this.setUrlSettings.bind(this);
        this.setMode = this.setMode.bind(this);
    }

    /**
     * Close the modal
     *
     */
    close() {
        this.setState({
            message: ""
        });
        $('#url-settings').modal('close');
    }

    /**
     * Set the url field
     * 
     * @param {String} url URL input value
     */
    setUrlSettings(url) {
        if (isValidUrl(url)) {
            if (typeof this.props.onSetUrlSettings === 'function') {
                this.close();
                this.props.onSetUrlSettings(url);
            }
        } else {
            this.setState({
                message: "you must type a valid URL"
            })
        }
    }

    /**
     * Set the working mode (demo or live)
     * @param {String} mode working mode
     */
    setMode(mode) {
        if (typeof this.props.onSetMode === 'function') {
            this.close();
            this.props.onSetMode(mode);
        }
    }

    /**
     * handle the enter key
     * 
     * @param  {Object} e event
     */
    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.setUrlSettings(this.refs.url.state.value);
        }
    }

    render() {
        return <Modal
                    id="url-settings"
                    header='Enter Caipy API URL'
                    actions={
                        <div>
                            <Button className="blue darken-1" waves='light' onClick={() => this.setUrlSettings(this.refs.url.state.value)}>OK</Button>   
                            <Button className={this.props.mode === "live" ? "blue darken-1" : "blue darken-1 hidden"} waves='light' onClick={() => this.setMode("demo")}>Demo mode</Button>
                            <Button className="blue darken-1" waves='light' onClick={() => this.close()}>Close</Button>
                        </div>
                    }
                    >
                    <Input ref="url" placeholder="https://example.com/api" s={12} defaultValue={this.props.url} onKeyPress={(e) => this.handleKeyPress(e)}/>
                    <p>{this.state.message}</p>
                </Modal>
    }
}


/**
 * Exclude TV program based on duration settings view
 */
export class ProgramSettingsView extends Component {

    /**
     * State holding the error message
     * @type {Object}
     */
    state = {
        message: ""
    }

    constructor() {
        super();
        this.cutProgram = this.cutProgram.bind(this);
    }

    close() {
        this.setState({
            message: ""
        });
        $('#cut-program-settings').modal('close');
    }

    /**
     * Set the exclude duration value and/or the exclude state value
     * 
     */
    cutProgram() {
        if (this.refs.excludeState.state.value !== '0') {
            if (isValidPositiveNumber(this.refs.excludeDuration.state.value)) {
                if (typeof this.props.onExcludeProgram === 'function') {
                    this.close();
                    this.props.onExcludeProgram(this.refs.excludeDuration.state.value);
                }
            } else {
                this.setState({
                    message: "you must type a valid number"
                })
            }
        } else {
            if (typeof this.props.onExcludeStateChange === 'function') {
                this.close();
                this.props.onExcludeStateChange();
            }
        }
    }

    /**
     * Handle exclude state switch state (checkbox change)
     * 
     * @param  {Object} e     event
     * @param  {[type]} value checkbox value ('0' if false , true for true)
     */
    handleExcludeStateChange(e, value) {
        if (value !== '0') {
            $('#excludeDuration').prop("disabled", false);
        } else {
            $('#excludeDuration').prop("disabled", true);
        }
    }

    /**
     * Handle the enter key
     * 
     * @param  {Object} e event
     */
    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.cutProgram();
        }
    }

    render() {
        $('#cutState').prop('checked', this.props.cutProgramState);

        if (!this.props.cutProgramState) {
            $('#excludeDuration').prop("disabled", true);
        }
        return <Modal
                    id="cut-program-settings"
                    header='Exclude TV program by duration'
                    actions={
                        <div>
                            <Button className="blue darken-1" waves='light' onClick={() => this.cutProgram()}>OK</Button>   
                            <Button className="blue darken-1" waves='light' onClick={() => this.close()}>Close</Button>
                        </div>
                    }
                    >
                    <p>This will exclude all TV programs that last less than the specified value (in seconds)</p>
                    <Row>
                        <Input ref="excludeDuration" id="excludeDuration" placeholder="Enter a duration in seconds" s={3} defaultValue={this.props.cutProgramDuration} onKeyPress={(e) => this.handleKeyPress(e)}/>
                        <Input ref="excludeState" id='cutState' onChange={(e,value)=>this.handleExcludeStateChange(e,value)} name='on' s={6} type='switch' value='0'/>
                    </Row>
                    <Row className="error-message form-error">
                        <p>{this.state.message}</p>
                    </Row>
                </Modal>
    }
}
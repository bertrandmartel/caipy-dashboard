//react
import React, { Component } from 'react';

//react components
import { Modal, Button, Input, Row } from 'react-materialize';

//import constant values
import * as Constant from '../constants/Constant.js';

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

/**
 * Open Global settings view
 */
export class GlobalSettingsView extends Component {

    /**
     * State holding the error message
     * @type {Object}
     */
    state = {
        message: "",
        zoomCheck: false,
        windowCheck: false,
        zoomAutoFocus: false,
        windowAutoFocus: false
    }

    overrideZoomWindowSize = -1;
    overrideInitWindowSize = -1;

    tempSettings = {
        zoomWindowSize: 0,
        initWindowSize: 0
    };

    constructor() {
        super();
        this.validateSettings = this.validateSettings.bind(this);
    }

    close() {
        this.setState({
            message: ""
        });
        $('#global-settings').modal('close');
    }

    /**
     * Validate the settings input.
     * 
     */
    validateSettings() {
        if (isValidPositiveNumber(this.refs.zoomWindowSize.state.value) &&
            isValidPositiveNumber(this.refs.initWindowSize.state.value)) {

            if (typeof this.props.onGlobalSettings === 'function') {
                this.close();
                this.props.onGlobalSettings(
                    parseInt(this.refs.zoomWindowSize.state.value, 10),
                    parseInt(this.refs.initWindowSize.state.value, 10)
                );
            }
        } else {
            this.setState({
                message: "you must type a valid number"
            })
        }
    }

    /**
     * Handle the enter key
     * 
     * @param  {Object} e event
     */
    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.validateSettings();
        }
    }

    /**
     * Set default value for zoom window
     * 
     * @param  {Object} e     event
     * @param  {[type]} value check value
     */
    handleDefaultZoomValue(e, value) {
        //keep other field intact
        this.overrideInitWindowSize = this.refs.initWindowSize.state.value;

        if (value === true) {
            this.tempSettings.zoomWindowSize = this.refs.zoomWindowSize.state.value;
            this.overrideZoomWindowSize = Constant.defaultZoomWindowSize;
            this.setState({
                load: 1,
                zoomCheck: 'true',
                zoomAutoFocus: false,
                windowAutoFocus: false
            });
        } else {
            this.overrideZoomWindowSize = this.tempSettings.zoomWindowSize;
            this.setState({
                load: 1,
                zoomCheck: '',
                zoomAutoFocus: false,
                windowAutoFocus: false
            });
        }
    }

    /**
     * Set default value for init window size
     * 
     * @param  {Object} e     event
     * @param  {[type]} value check value
     */
    handleDefaultWindowSizeValue(e, value) {
        //keep other field intact
        this.overrideZoomWindowSize = this.refs.zoomWindowSize.state.value;

        if (value === true) {
            this.tempSettings.initWindowSize = this.refs.initWindowSize.state.value;
            this.overrideInitWindowSize = Constant.defaultWindowInitSize;
            this.setState({
                load: 1,
                windowCheck: 'true',
                zoomAutoFocus: false,
                windowAutoFocus: false
            });
        } else {
            this.overrideInitWindowSize = this.tempSettings.initWindowSize;
            this.setState({
                load: 1,
                windowCheck: '',
                zoomAutoFocus: false,
                windowAutoFocus: false
            });
        }
    }

    /**
     * Handle input change to clear the default checkbox
     * 
     * @param  {Obect} e     event
     * @param  {[type]} value [description]
     * @param  {String} name    input name
     */
    handleInputChange(e, value, name) {

        switch (name) {
            case 'zoomCheck':
                this.overrideZoomWindowSize = value;
                this.overrideInitWindowSize = this.refs.initWindowSize.state.value;
                if (this.refs.zoomCheck.state.value === true) {
                    this.refs.zoomCheck.state.value = 'default';
                    this.setState({
                        zoomCheck: '',
                        zoomAutoFocus: true,
                        windowCheck: this.state.windowCheck,
                        windowAutoFocus: false
                    });
                }
                break;
            case 'windowCheck':
                this.overrideInitWindowSize = value;
                this.overrideZoomWindowSize = this.refs.zoomWindowSize.state.value;
                if (this.refs.windowCheck.state.value === true) {
                    this.refs.windowCheck.state.value = 'default';
                    this.setState({
                        zoomCheck: this.state.zoomCheck,
                        zoomAutoFocus: false,
                        windowCheck: '',
                        windowAutoFocus: true
                    });
                }
                break;
            default:
                break;
        }
    }

    focusText(e) {
        var tmp = e.target.value
        e.target.value = ''
        e.target.value = tmp
    }

    render() {
        var zoomWindowValue = "" + ((this.overrideZoomWindowSize !== -1) ? this.overrideZoomWindowSize : this.props.settings.zoomWindowSize);
        var initWindowValue = "" + ((this.overrideInitWindowSize !== -1) ? this.overrideInitWindowSize : this.props.settings.windowInitSize);

        this.overrideZoomWindowSize = -1;
        this.overrideInitWindowSize = -1;

        return <Modal
                    id="global-settings"
                    header='Global Settings'
                    actions={
                        <div>
                            <Button className="blue darken-1" waves='light' onClick={() => this.validateSettings()}>OK</Button>   
                            <Button className="blue darken-1" waves='light' onClick={() => this.close()}>Close</Button>
                        </div>
                    }
                    >
                    <Row>
                        <Input autoFocus={this.state.zoomAutoFocus} onFocus={this.focusText} key={'zoomWindowSize' + zoomWindowValue + this.tempSettings.zoomWindowSize} label="zoom window size (in seconds)" ref="zoomWindowSize" onChange={(e,value)=>this.handleInputChange(e,value,'zoomCheck')} placeholder="Enter a value in seconds" s={6} defaultValue={zoomWindowValue} onKeyPress={(e) => this.handleKeyPress(e)}/>
                        <Input className="filled-in" checked={this.state.zoomCheck} ref="zoomCheck" name='zoomCheck' type='checkbox' value='default' label='default' onChange={(e,value)=>this.handleDefaultZoomValue(e,value)} s={6}/>
                    </Row>
                    <div className="form-modal">
                        <Row>
                            <Input autoFocus={this.state.windowAutoFocus} onFocus={this.focusText} key={'initWindowSize' + initWindowValue + this.tempSettings.initWindowSize} label="init window size (in seconds)" ref="initWindowSize" onChange={(e,value)=>this.handleInputChange(e,value,'windowCheck')} placeholder="Enter a value in seconds" s={6} defaultValue={initWindowValue} onKeyPress={(e) => this.handleKeyPress(e)}/>
                            <Input className="filled-in" checked={this.state.windowCheck} ref="windowCheck"  name='windowCheck' type='checkbox' value='default' label='default' onChange={(e,value)=>this.handleDefaultWindowSizeValue(e,value)} s={6}/>
                        </Row>
                    </div>
                    <Row className="error-message form-error">
                        <p>{this.state.message}</p>
                    </Row>
                </Modal>
    }
}
//react
import React, { Component } from 'react';

//react components
import { Modal, Button, Input, Row, Col, Section } from 'react-materialize';

//import constant values
import * as Constant from '../constants/Constant.js';

import * as ApiUtils from '../api/CaipyApi.js';

import NumericInput from 'react-numeric-input';

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
 * Open Global settings view
 */
export class GlobalSettingsView extends Component {

    /**
     * State holding the error message
     * @type {Object}
     */
    state = {
        data: {
            windowSize: 0,
            startOverDetectAd: 0,
            startOverDetectSharpStart: 0,
            dropProgram: 0
        },
        style: {
            windowSize: {},
            startoverAd: {},
            startoverSharpStart: {},
            dropProgram: {}

        }
    };

    data = {
        windowSize: 0,
        startOverDetectAd: 0,
        startOverDetectSharpStart: 0,
        dropProgram: 0
    };

    constructor() {
        super();
        this.validateSettings = this.validateSettings.bind(this);
        this.updateDurationValue = this.updateDurationValue.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
    }

    close() {
        this.setState({
            message: ""
        });
        $('#global-settings').modal('close');
    }

    componentDidMount() {

        this.data = {
            windowSize: this.props.settings.windowSize,
            startOverDetectAd: this.props.settings.startOverDetectAd,
            startOverDetectSharpStart: this.props.settings.startOverDetectSharpStart,
            dropProgram: this.props.settings.dropProgram
        };

        this.setState({
            data: {
                windowSize: this.props.settings.windowSize,
                startOverDetectAd: this.props.settings.startOverDetectAd,
                startOverDetectSharpStart: this.props.settings.startOverDetectSharpStart,
                dropProgram: this.props.settings.dropProgram
            },
            style: {
                windowSize: {},
                startOverDetectAd: {},
                startOverDetectSharpStart: {},
                dropProgram: {}
            }
        });
    }

    /**
     * Validate the settings input.
     * 
     */
    validateSettings() {
        if (typeof this.props.onGlobalSettings === 'function') {
            this.close();
            this.props.onGlobalSettings(this.data);
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

    resetSettings() {
        var windowSize = ApiUtils.convertMillisToDuration(Constant.defaultWindowInitSize);
        var startOverDetectAd = ApiUtils.convertMillisToDuration(Constant.startOverRangeAd);
        var startOverDetectSharpStart = ApiUtils.convertMillisToDuration(Constant.startOverRangeSharpStart);
        var dropProgram = ApiUtils.convertMillisToDuration(Constant.cutProgramDuration);

        var resp = this.state;
        resp.data.windowSize = windowSize;
        resp.data.startOverDetectAd = startOverDetectAd;
        resp.data.startOverDetectSharpStart = startOverDetectSharpStart;
        resp.data.dropProgram = dropProgram;

        this.data["windowSize"] = Constant.defaultWindowInitSize;
        this.data["startOverDetectAd"] = Constant.startOverRangeAd;
        this.data["startOverDetectSharpStart"] = Constant.startOverRangeSharpStart;
        this.data["dropProgram"] = Constant.cutProgramDuration;

        this.setState(resp);
    }

    focusText(e) {
        var tmp = e.target.value
        e.target.value = ''
        e.target.value = tmp
    }

    /**
     * This is called when data change in Duration view
     * 
     * @param  {String} type  name of the duration view that is calling the function
     * @param  {Object} data  duration data (hour,minutes,seconds)
     * @return {[type]}      [description]
     */
    onValueChange(type, data) {
        this.data[type] = ApiUtils.convertHmdToMillis(data);
    }

    /**
     * This is called by Duration view to deal with focus & data update
     * 
     * @param  {String} type  name of the duration view that is calling the function
     * @param  {Object} data state data from the Duration view that contain duration data + style
     */
    updateDurationValue(type, data) {
        var resp = this.state;
        resp.data[type] = {
            hour: data.data.hour,
            minutes: data.data.minutes,
            seconds: data.data.seconds
        };
        resp.style[type] = data.style;
        this.setState(resp);
    }

    render() {
        var windowSize = ApiUtils.convertMillisToDuration(this.state.data.windowSize);
        var startOverDetectAd = ApiUtils.convertMillisToDuration(this.state.data.startOverDetectAd);
        var startOverDetectSharpStart = ApiUtils.convertMillisToDuration(this.state.data.startOverDetectSharpStart);
        var dropProgram = ApiUtils.convertMillisToDuration(this.state.data.dropProgram);

        return <Modal
                    id="global-settings"
                    header='Settings'
                    actions={
                        <div className="settings-validation-form">
                            <Button className="blue darken-1" waves='light' onClick={() => this.validateSettings()}>OK</Button> 
                            <Button className="blue darken-1" waves='light' onClick={() => this.resetSettings()}>Reset to default</Button>   
                            <Button className="blue darken-1" waves='light' onClick={() => this.close()}>Close</Button>
                        </div>
                    }
                    >
                        <div>
                            <Section>
                                <h5>General</h5>
                                <Row className="top-section">
                                    <Col s={4} className='duration-picker-label' >Timeline window</Col>
                                    <Col s={8} className='duration-picker-container' >
                                        <DurationPicker 
                                            className='duration-picker'
                                            style={this.state.style.windowSize}
                                            name='windowSize'
                                            hour={windowSize.hour} 
                                            minutes={windowSize.minutes} 
                                            seconds={windowSize.seconds}
                                            onChange={this.onValueChange}
                                            onUpdateValue={this.updateDurationValue}
                                        />
                                    </Col>
                                </Row>
                            </Section>
                            
                            <Section>
                                <h5>Start Over</h5>
                                <Row className="top-section">
                                    <Col s={4} className='duration-picker-label' >Detect Ad after</Col>
                                    <Col s={8} className='duration-picker-container' >
                                        <DurationPicker className='duration-picker' 
                                            name='startOverDetectAd'
                                            style={this.state.style.startOverDetectAd}
                                            hour={startOverDetectAd.hour} 
                                            minutes={startOverDetectAd.minutes} 
                                            seconds={startOverDetectAd.seconds}
                                            onChange={this.onValueChange}
                                            onUpdateValue={this.updateDurationValue}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col s={4} className='duration-picker-label' >Detect SharpStart before</Col>
                                    <Col s={8} className='duration-picker-container' >
                                        <DurationPicker className='duration-picker' 
                                            name='startOverDetectSharpStart' 
                                            style={this.state.style.startOverDetectSharpStart}
                                            hour={startOverDetectSharpStart.hour} 
                                            minutes={startOverDetectSharpStart.minutes} 
                                            seconds={startOverDetectSharpStart.seconds}
                                            onChange={this.onValueChange}
                                            onUpdateValue={this.updateDurationValue}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col s={4} className='duration-picker-label' >Drop program lower than </Col>
                                    <Col s={8} className='duration-picker-container' >
                                        <DurationPicker className='duration-picker' 
                                            name='dropProgram' 
                                            style={this.state.style.dropProgram}
                                            hour={dropProgram.hour} 
                                            minutes={dropProgram.minutes} 
                                            seconds={dropProgram.seconds}
                                            onChange={this.onValueChange}
                                            onUpdateValue={this.updateDurationValue}
                                        />
                                    </Col>
                                </Row>
                            </Section>
                        </div>
                </Modal>
    }
}

/**
 * Duration picker view
 */
export class DurationPicker extends Component {

    style = {};

    state = {
        style: {
            hour: {},
            minutes: {},
            seconds: {}
        },
        data: {
            hour: 0,
            minutes: 0,
            seconds: 0
        }
    };

    selection = false;

    constructor() {
        super();
        var durationstyle = Constant.numericInputStyle;

        //hide arrows
        durationstyle["btn"].visibility = "hidden";

        //highlight when focused
        durationstyle["input:focus"] = {
            "border": "1px solid #1e88e5"
        };

        //modify margin
        durationstyle["input"] = {
            "margin": "5px",
            "paddingRight": '3ex',
            "boxSizing": 'border-box'
        };
        durationstyle["btnUp"] = {
            top: 2,
            bottom: '50%',
            borderRadius: '2px 2px 0 0',
            borderWidth: '1px 1px 0 1px',
            marginTop: '4px',
            marginRight: '4px'
        };
        durationstyle["btnDown"] = {
            top: '50%',
            bottom: 2,
            borderRadius: '0 0 2px 2px',
            borderWidth: '0 1px 1px 1px',
            marginBottom: '4px',
            marginRight: '4px'
        }
        this.style = {
            hour: JSON.parse(JSON.stringify(durationstyle)),
            minutes: JSON.parse(JSON.stringify(durationstyle)),
            seconds: JSON.parse(JSON.stringify(durationstyle))
        };
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    componentDidMount() {
        if (this.props.style && Object.keys(this.props.style).length !== 0) {
            this.style = this.props.style;
        }
        this.setState({
            style: this.style,
            data: {
                hour: this.props.hour,
                minutes: this.props.minutes,
                seconds: this.props.seconds
            }
        });
    }

    componentDidUpdate() {

    }

    onFocus(type) {
        if (!this.selection) {
            this.selection = true;
            switch (type) {
                case 'hour':
                    this.style.hour["btn"].visibility = "visible";
                    break;
                case 'minutes':
                    this.style.minutes["btn"].visibility = "visible";
                    break;
                case 'seconds':
                    this.style.seconds["btn"].visibility = "visible";
                    break;
                default:
                    break;
            }
            if (typeof this.props.onUpdateValue === 'function') {
                this.props.onUpdateValue(this.props.name, {
                    style: this.style,
                    data: {
                        hour: this.props.hour,
                        minutes: this.props.minutes,
                        seconds: this.props.seconds
                    }
                });
            }
        }
    }

    onBlur(type) {
        this.selection = false;
        switch (type) {
            case 'hour':
                this.style.hour["btn"].visibility = "hidden";
                break;
            case 'minutes':
                this.style.minutes["btn"].visibility = "hidden";
                break;
            case 'seconds':
                this.style.seconds["btn"].visibility = "hidden";
                break;
            default:
                break;
        }
        if (typeof this.props.onUpdateValue === 'function') {
            this.props.onUpdateValue(this.props.name, {
                style: this.style,
                data: {
                    hour: this.refs.hour.state.value,
                    minutes: this.refs.minutes.state.value,
                    seconds: this.refs.seconds.state.value
                }
            });
        }
    }

    onChange(valueAsNumber, valueAsString, input) {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(this.props.name, {
                hour: this.refs.hour.state.value,
                minutes: this.refs.minutes.state.value,
                seconds: this.refs.seconds.state.value
            });
        }
    }

    render() {
        return <div className={this.props.className + " durationpicker-container form-control"}>
                    <NumericInput 
                        ref='hour' 
                        onBlur={() => this.onBlur('hour')} 
                        onSelect={() => this.onFocus('hour')} 
                        min={0} 
                        max={24} 
                        value={this.props.hour} 
                        style={this.state.style.hour}
                        onChange={(numericVal,strVal,input) => this.onChange(numericVal,strVal,input) }
                    />h
                    <NumericInput 
                        ref='minutes' 
                        onBlur={() => this.onBlur('minutes')} 
                        onSelect={() => this.onFocus('minutes')} 
                        min={0} 
                        max={60} 
                        value={this.props.minutes} 
                        style={this.state.style.minutes}
                        onChange={(numericVal,strVal,input) => this.onChange(numericVal,strVal,input)}
                    />m
                    <NumericInput 
                        ref='seconds' 
                        onBlur={() => this.onBlur('seconds')} 
                        onSelect={() => this.onFocus('seconds')} 
                        min={0} 
                        max={60} 
                        value={this.props.seconds} 
                        style={this.state.style.seconds}
                        onChange={(numericVal,strVal,input) => this.onChange(numericVal,strVal,input)}
                    />s
               </div>
    }
}
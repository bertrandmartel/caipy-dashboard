//react
import React, { Component } from 'react';

//import constant values
import * as Constant from '../constants/Constant.js';

import NumericInput from 'react-numeric-input';

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
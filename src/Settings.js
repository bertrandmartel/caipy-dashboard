//react
import React, { Component } from 'react';

//react components
import { Modal, Button, Input } from 'react-materialize';

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
export class SettingsView extends Component {

    state = {
        message: ""
    }

    constructor() {
        super();
        this.setUrlSettings = this.setUrlSettings.bind(this);
        this.setMode = this.setMode.bind(this);
    }

    close() {
        this.setState({
            message: ""
        });
        $('#url-settings').modal('close');
    }

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

    setMode(mode) {
        if (typeof this.props.onSetMode === 'function') {
            this.close();
            this.props.onSetMode(mode);
        }
    }

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
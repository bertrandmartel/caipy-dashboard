/* eslint-disable flowtype/require-valid-file-annotation */

import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';

//react components
//import { Modal, Button, Input } from 'react-materialize';

import * as Utils from '../utils/Utils.js';

// jquery
//import $ from 'jquery';
//window.$ = window.jQuery = require('jquery');

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 500,
    }
});

/**
 * Caipy URL settings view
 */
class UrlDialog extends Component {

    /**
     * State holding the error message
     * 
     * @type {Object}
     */
    state = {
        message: ""
    }

    url = "";

    constructor() {
        super();
        this.setUrlSettings = this.setUrlSettings.bind(this);
        this.setMode = this.setMode.bind(this);
        this.close = this.close.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    close() {
        if (typeof this.props.onDialogClose === 'function') {
            this.props.onDialogClose();
        }
    };

    componentDidUpdate() {
        this.url = this.props.url;
    }
    /**
     * Set the url field
     * 
     * @param {String} url URL input value
     */
    setUrlSettings() {
        if (Utils.isValidUrl(this.url)) {
            if (typeof this.props.onSetUrlSettings === 'function') {
                this.close();
                this.props.onSetUrlSettings(this.url);
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

    handleChange(e) {
        this.url = e.target.value;
    }

    /**
     * handle the enter key
     * 
     * @param  {Object} e event
     */
    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.setUrlSettings(e.target.value);
        }
    }

    render() {
        const { classes } = this.props;
        /*
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
                */
        return (
            <div>
                <Dialog open={this.props.open} onRequestClose={this.close}>
                    <DialogTitle>{"Enter Caipy API URL"}</DialogTitle>
                    <DialogContent>
                      <TextField
                        ref="url"
                        placeholder="https://example.com/api"
                        defaultValue={this.props.url}
                        onKeyPress={(e) => this.handleKeyPress(e)}
                        onChange={this.handleChange}
                        className={classes.textField}
                      />
                      <DialogContentText>
                        {this.state.message}
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button className={this.props.mode === "live" ? "" : "hidden"} onClick={() => this.setMode("demo")}>Demo mode</Button>
                      <Button onClick={() => this.close()}>Close</Button>
                      <Button onClick={() => this.setUrlSettings()}>OK</Button>   
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

UrlDialog.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UrlDialog);
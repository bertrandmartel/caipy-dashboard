import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List';

//react components
//import { Modal, Button, Row, Col, Section } from 'react-materialize';

//import constant values
import * as Constant from '../constants/Constant.js';

import * as ApiUtils from '../api/CaipyApi.js';

import { DurationPicker } from './DurationPicker.js';

const styles = theme => ({
    root: {},
    title: {
        margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
    },
    dialogContent: {
        width: 600
    },
    listItem: {
        height:70
    }
});

/**
 * Open Global settings view
 */
class GlobalSettingsView extends Component {

    container = {
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
        this.close = this.close.bind(this);
    }

    close() {
        if (typeof this.props.onDialogClose === 'function') {
            this.props.onDialogClose();
        }
    }

    componentDidMount() {

        this.data = {
            windowSize: this.props.settings.windowSize,
            startOverDetectAd: this.props.settings.startOverDetectAd,
            startOverDetectSharpStart: this.props.settings.startOverDetectSharpStart,
            dropProgram: this.props.settings.dropProgram
        };
        this.container = {
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
        };
    }

    componentDidUpdate() {
        this.container = {
            data: {
                windowSize: this.props.settings.windowSize,
                startOverDetectAd: this.props.settings.startOverDetectAd,
                startOverDetectSharpStart: this.props.settings.startOverDetectSharpStart,
                dropProgram: this.props.settings.dropProgram
            },
            style: {
                windowSize: this.props.settingsStyle.windowSize,
                startOverDetectAd: this.props.settingsStyle.startOverDetectAd,
                startOverDetectSharpStart: this.props.settingsStyle.startOverDetectSharpStart,
                dropProgram: this.props.settingsStyle.dropProgram
            }
        };
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

        var resp = this.container;
        resp.data.windowSize = windowSize;
        resp.data.startOverDetectAd = startOverDetectAd;
        resp.data.startOverDetectSharpStart = startOverDetectSharpStart;
        resp.data.dropProgram = dropProgram;

        this.data["windowSize"] = Constant.defaultWindowInitSize;
        this.data["startOverDetectAd"] = Constant.startOverRangeAd;
        this.data["startOverDetectSharpStart"] = Constant.startOverRangeSharpStart;
        this.data["dropProgram"] = Constant.cutProgramDuration;

        this.props.onRefreshGlobalSettingsView(resp);
        this.close();
        //this.setState(resp);
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
        var resp = this.container;
        resp.data[type] = data.data.hour * 60 * 60 * 1000 + data.data.minutes * 60 * 1000 + data.data.seconds * 1000;
        resp.style[type] = data.style;
        this.props.onRefreshGlobalSettingsView(resp);
        //this.setState(resp);
    }

    render() {
        const classes = this.props.classes;

        var windowSize = ApiUtils.convertMillisToDuration(this.container.data.windowSize);
        var startOverDetectAd = ApiUtils.convertMillisToDuration(this.container.data.startOverDetectAd);
        var startOverDetectSharpStart = ApiUtils.convertMillisToDuration(this.container.data.startOverDetectSharpStart);
        var dropProgram = ApiUtils.convertMillisToDuration(this.container.data.dropProgram);

        return <div className={classes.root}>
                    <Dialog open={this.props.open} onRequestClose={this.close}>
                        <DialogTitle>{"Settings"}</DialogTitle>
                        <DialogContent>
                            <div>
                              <Grid item xs={12} className={classes.dialogContent}>
                                <Typography type="title" className={classes.title}>
                                  General
                                </Typography>
                                <div>
                                  <List>
                                      <ListItem className={classes.listItem}>
                                        <ListItemText primary="Timeline window" />
                                        <ListItemSecondaryAction>
                                            <DurationPicker 
                                                    className='duration-picker'
                                                    style={this.container.style.windowSize}
                                                    name='windowSize'
                                                    hour={windowSize.hour} 
                                                    minutes={windowSize.minutes} 
                                                    seconds={windowSize.seconds}
                                                    onChange={this.onValueChange}
                                                    onUpdateValue={this.updateDurationValue}
                                                />
                                        </ListItemSecondaryAction>
                                      </ListItem>
                                  </List>
                                </div>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography type="title" className={classes.title}>
                                  Start Over
                                </Typography>
                                <div>
                                  <List>
                                      <ListItem className={classes.listItem} divider>
                                        <ListItemText primary="Detect event after" />
                                        <ListItemSecondaryAction>
                                            <DurationPicker className='duration-picker' 
                                                name='startOverDetectAd'
                                                style={this.container.style.startOverDetectAd}
                                                hour={startOverDetectAd.hour} 
                                                minutes={startOverDetectAd.minutes} 
                                                seconds={startOverDetectAd.seconds}
                                                onChange={this.onValueChange}
                                                onUpdateValue={this.updateDurationValue}
                                            />
                                        </ListItemSecondaryAction>
                                      </ListItem>
                                      <ListItem className={classes.listItem} divider>
                                        <ListItemText primary="Detect event before" />
                                        <ListItemSecondaryAction>
                                            <DurationPicker className='duration-picker' 
                                                name='startOverDetectSharpStart' 
                                                style={this.container.style.startOverDetectSharpStart}
                                                hour={startOverDetectSharpStart.hour} 
                                                minutes={startOverDetectSharpStart.minutes} 
                                                seconds={startOverDetectSharpStart.seconds}
                                                onChange={this.onValueChange}
                                                onUpdateValue={this.updateDurationValue}
                                            />
                                        </ListItemSecondaryAction>
                                      </ListItem>
                                      <ListItem className={classes.listItem}>
                                        <ListItemText primary="Drop program lower than" />
                                        <ListItemSecondaryAction>
                                            <DurationPicker className='duration-picker' 
                                                name='dropProgram' 
                                                style={this.container.style.dropProgram}
                                                hour={dropProgram.hour} 
                                                minutes={dropProgram.minutes} 
                                                seconds={dropProgram.seconds}
                                                onChange={this.onValueChange}
                                                onUpdateValue={this.updateDurationValue}
                                            />
                                        </ListItemSecondaryAction>
                                      </ListItem>
                                  </List>
                                </div>
                              </Grid>
                            </div>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => this.close()}>Close</Button>
                          <Button onClick={() => this.resetSettings()}>Reset to default</Button> 
                          <Button onClick={() => this.validateSettings()}>OK</Button>   
                        </DialogActions>
                    </Dialog>
                </div>
        /*
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
                                            style={this.container.style.windowSize}
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
                                    <Col s={4} className='duration-picker-label' >Detect event after</Col>
                                    <Col s={8} className='duration-picker-container' >
                                        <DurationPicker className='duration-picker' 
                                            name='startOverDetectAd'
                                            style={this.container.style.startOverDetectAd}
                                            hour={startOverDetectAd.hour} 
                                            minutes={startOverDetectAd.minutes} 
                                            seconds={startOverDetectAd.seconds}
                                            onChange={this.onValueChange}
                                            onUpdateValue={this.updateDurationValue}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col s={4} className='duration-picker-label' >Detect event before</Col>
                                    <Col s={8} className='duration-picker-container' >
                                        <DurationPicker className='duration-picker' 
                                            name='startOverDetectSharpStart' 
                                            style={this.container.style.startOverDetectSharpStart}
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
                                            style={this.container.style.dropProgram}
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
        */
    }
}

GlobalSettingsView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GlobalSettingsView);
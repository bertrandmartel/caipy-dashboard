//style
import 'vis/dist/vis.css';
//import 'materialize-css/dist/css/materialize.min.css';
import './css/MaterialColor.css';
import './css/Timeline.css';
import './css/App.css';

//react
import React, { Component } from 'react';

//react materialize components
import { Footer, Row, Col, Preloader } from 'react-materialize';

// other react components
import { FilterView } from './component/Filter.js';
import { GlobalSettingsView } from './component/GlobalSettings.js'
import { UrlSettingsView } from './component/UrlSettings.js';
import { TabCollection } from './component/TabCollection.js';
import { TopNavbar } from './component/TopNavbar.js';

//utility for Caipy (parse JSON data)
import * as ApiUtils from './api/CaipyApi.js';
import * as Storage from './stores/Storage.js';

//import constant values
import * as Constant from './constants/Constant.js';

require('materialize-css/dist/js/materialize.min.js');

/**
 * Main app component
 */
class App extends Component {

    /**
     * date filter used to init filter & to be used in query in live mode.
     * @type {Object}
     */
    date = {
        startDate: Constant.defaultStartDate,
        endDate: Constant.defaultEndDate
    }

    state = {
        ready: false,
        items: [],
        caipyData: [],
        epgData: [],
        mode: "demo",
        url: Storage.getApiUrl(),
        message: "",
        options: this.options,
        startDate: this.date.startDate,
        endDate: this.date.endDate
    };

    /**
     * list of presets value extracted from Caipy API.
     * 
     * @type {Array}
     */
    presets = [];

    /**
     * preset default value
     * 
     * @type {String}
     */
    preset = 'default';

    channels = [];

    channel = 'TF1';

    /**
     * mode can be "demo" or "live"
     * @type {String}
     */
    mode = "demo";

    /**
     * default timeline item type (false for "range" / true for "point")
     * @type {Boolean}
     */
    options = {
        stack: true,
        type: "range"
    };

    items = [];
    caipyData = [];
    epgData = [];

    fullEpgData = [];

    /**
     * Global settings.
     * 
     * @type {Object}
     */
    settings = {
        windowSize: Constant.defaultWindowInitSize,
        startOverDetectAd: Constant.startOverRangeAd,
        startOverDetectSharpStart: Constant.startOverRangeSharpStart,
        dropProgram: Constant.cutProgramDuration
    };

    constructor() {
        super();
        this.initStorage();
        this.refresh = this.refresh.bind(this);
        this.setUrlSettings = this.setUrlSettings.bind(this);
        this.setMode = this.setMode.bind(this);
        this.setFilterSettings = this.setFilterSettings.bind(this);
        this.setPreset = this.setPreset.bind(this);
        this.setChannel = this.setChannel.bind(this);
        this.updateGlobalSettings = this.updateGlobalSettings.bind(this);
        this.playRolling = this.playRolling.bind(this);
        this.pauseRolling = this.pauseRolling.bind(this);
        this.initPreset();
    }

    /**
     * Inititialize presets
     */
    initPreset() {
        this.preset = Storage.getPreset();
        if (this.mode === "live") {
            var that = this;
            ApiUtils.getPresets(Storage.getApiUrl(), function(err, res) {
                if (err) {
                    console.log(err);
                    return;
                }
                that.presets = res;
            });
        }
    }

    /**
     * Inititialize presets
     */
    initChannel() {
        this.channel = Storage.getChannel();
        if (this.mode === "live") {
            var that = this;
            ApiUtils.getChannels(Storage.getApiUrl(), this.date.startDate, function(err, res) {
                if (err) {
                    console.log(err);
                    return;
                }
                res.channels.sort(function(a, b) {
                    var textA = a.name.toUpperCase();
                    var textB = b.name.toUpperCase();
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                });
                that.channels = res.channels;
                that.updateState("tools");
            });
        }
    }

    /**
     * Initliaze data from storage.
     */
    initStorage() {
        //options
        this.options.stack = Storage.getStack();
        this.options.type = Storage.getType();

        //global settings & startover
        this.settings.dropProgram = Storage.getCutProgramDuration();
        this.settings.startOverDetectAd = Storage.getStartOverRangeAd();
        this.settings.startOverDetectSharpStart = Storage.getStartOverRangeSharpStart();
        this.settings.windowSize = Storage.getWindowInitSize();

        //filter date
        this.date.startDate = Storage.getStartDate();
        this.date.endDate = Storage.getEndDate();

        //mode
        this.mode = Storage.getMode();
    }

    /**
     * On mount check the mode ("live" or "demo") and refresh the data according to this
     */
    componentDidMount() {
        this.initChannel();
        this.refresh("create", false);
    }

    /**
     * Update the action type from a ready state
     * 
     * @param  {String} actionType action to perform
     */
    updateState(actionType, keepCurrentWindow) {
        this.setState({
            actionType: actionType,
            ready: true,
            caipyData: this.caipyData,
            epgData: this.epgData,
            items: this.items,
            mode: this.mode,
            options: this.options,
            url: Storage.getApiUrl(),
            message: "",
            startDate: this.date.startDate,
            endDate: this.date.endDate,
            keepCurrentWindow: (keepCurrentWindow ? true : false)
        });
    }

    /**
     * Parse the JSON data to build timeline DataSet 
     * @param  {Object} data       JSON data object (from query response or from local JSON file)
     * @param  {String} actionType type of action to perform ("create","update","idle")
     */
    parseItems(caipyData, epgData, items, actionType, keepCurrentWindow) {
        this.items = items;
        this.caipyData = caipyData;
        this.epgData = epgData;
        this.fullEpgData = JSON.parse(JSON.stringify(epgData));
        this.updateState(actionType, keepCurrentWindow);
    }

    /**
     * Error function for showing error message
     * 
     */
    showError() {
        this.setState({
            actionType: "idle",
            ready: false,
            epgData: [],
            caipyData: [],
            items: this.items,
            mode: this.mode,
            options: this.options,
            url: Storage.getApiUrl(),
            message: "error occured",
            startDate: this.date.startDate,
            endDate: this.date.endDate
        });
    }

    /**
     * Refresh the data according to mode
     * @param  {String} actionType type of action to perform ("create","update","idle")
     */
    refresh(actionType, keepCurrentWindow) {
        var that = this;

        that.setState({
            actionType: "idle",
            ready: false,
            epgData: that.epgData,
            caipyData: that.caipyData,
            items: that.items,
            mode: this.mode,
            options: this.options,
            url: Storage.getApiUrl(),
            message: "",
            startDate: this.date.startDate,
            endDate: this.date.endDate
        });


        ApiUtils.getData(this.mode,
            this.date.startDate, this.date.endDate,
            this.settings.dropProgram,
            this.preset, this.channel,
            function(err, res) {
                if (err) {
                    console.log(err);
                    return that.showError();
                }
                that.parseItems(res.caipyEvents, res.epgPrograms, res.timelineItems, actionType, keepCurrentWindow);
            });
    }

    /**
     * set settings URL value
     * @param {String} url URL value
     */
    setUrlSettings(url) {
        Storage.setApiUrl(url);
        Storage.setMode("live");
        this.mode = "live";
        this.initPreset();
        this.refresh("update", false);
    }

    /**
     * Set filter value
     * @param {Date} startDate start date filter
     * @param {Date} endDate   end date filter
     */
    setFilterSettings(startDate, endDate) {
        Storage.setStartDate(startDate);
        Storage.setEndDate(endDate);
        this.date.startDate = startDate;
        this.date.endDate = endDate;
        this.refresh("update", false);
    }

    /**
     * Set preset value
     * 
     * @param {String} preset Preset value from dropdown list
     */
    setPreset(preset) {
        this.preset = preset;
        Storage.setPreset(preset);
        this.refresh("update", true);
    }

    /**
     * Set channel
     * 
     * @param {String} channel channel name from dropdown list
     */
    setChannel(channel) {
        this.channel = channel;
        Storage.setChannel(channel);
        this.refresh("update", true);
    }

    /**
     * Set the mode ("demo" or "live")
     * @param {String} mode the mode
     */
    setMode(mode) {
        Storage.setMode(mode);
        this.mode = mode;
        this.refresh("update", false);
    }

    updateGlobalSettings(settings) {
        //update options but keep the current window
        var nextState = "options-timeline";

        var update = false;

        if (settings.windowSize !== this.settings.windowSize) {
            //update options and update the window
            nextState = "options-global";
        }
        if (settings.dropProgram !== this.settings.dropProgram) {
            update = true;
        }

        this.settings = JSON.parse(JSON.stringify(settings));

        Storage.setWindowInitSize(settings.windowSize);
        Storage.setCutProgramDuration(settings.dropProgram);
        Storage.setStartOverRangeAd(settings.startOverDetectAd);
        Storage.setStartOverRangeSharpStart(settings.startOverDetectSharpStart);

        if (update) {
            this.refresh("update", true);
        } else {
            this.updateState(nextState);
        }
    }

    playRolling() {
        this.updateState("tools");
    }

    pauseRolling() {
        this.updateState("tools");
    }

    render() {
        return (
            <div className="body">
                <div className="main">

                    <TopNavbar mode={this.state.mode}
                               onRefresh={this.refresh}/>

                    <FilterView onSetFilterSettings={this.setFilterSettings}
                                onPresetChange={this.setPreset}
                                onChannelChange={this.setChannel}
                                mode={this.state.mode}
                                startDate={this.date.startDate}
                                endDate={this.date.endDate}
                                presets={this.presets}
                                channels={this.channels}
                                preset={this.preset}
                                channel={this.channel}/>

                    <TabCollection ready={this.state.ready} 
                                   items={this.state.items} 
                                   caipyData={this.state.caipyData}
                                   epgData={this.state.epgData}
                                   actionType={this.state.actionType}
                                   options={this.options}
                                   settings={this.settings}
                                   onPlayRolling={this.playRolling}
                                   onPauseRolling={this.pauseRolling}
                                   keepCurrentWindow={this.state.keepCurrentWindow}
                                   />

                    <ProgressView value={this.state.ready}
                                  message={this.state.message}/>

                    <UrlSettingsView mode={this.state.mode}
                                  url={this.state.url}
                                  onSetUrlSettings={this.setUrlSettings}
                                  onSetMode={this.setMode}/>

                    <GlobalSettingsView 
                                  settings={this.settings}
                                  onGlobalSettings={this.updateGlobalSettings}/>
                </div>
                <FooterView/>
             </div>
        );
    }
}

/**
 * Footer component
 */
class FooterView extends Component {
    render() {
        return <Footer className='white-text footer blue darken-1' 
                       moreLinks={
                            <div>
                            <a className="white-text center" href="https://github.com/bertrandmartel" rel="noopener noreferrer" target="_blank">
                            Copyright (c) 2017 Bertrand Martel</a>
                             </div>
                         }>
                </Footer>
    }
}

/**
 * View showing a Loader in the middle of the screen
 */
class ProgressView extends Component {
    render() {
        return <Row className={this.props.value ? "center-div hidden" : "center-div"}>
                    <Col s={12}>
                        <Preloader size="big" color="blue"/>
                    </Col>
                    <p className="error-message">{this.props.message}</p>
                </Row>
    }
}

export default App;
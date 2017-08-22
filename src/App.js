//style
import 'vis/dist/vis.css';
//import 'materialize-css/dist/css/materialize.min.css';
import './App.css';

//react
import React, { Component } from 'react';

//react components
import { Chip, Tabs, Tab, Footer, Collection, CollectionItem, Row, Col, Preloader, Navbar, NavItem, Icon } from 'react-materialize';
import { Timeline } from './Timeline.js';
import { CaipyDataSetItem, EpgDataSetItem } from './DataSet.js';
import { FilterView } from './Filter.js';
import { UrlSettingsView, ProgramSettingsView, GlobalSettingsView } from './Settings.js';

//utility for Caipy (parse JSON data)
import * as ApiUtils from './CaipyApi.js';
import * as Storage from './Storage.js';

//import constant values
import * as Constant from './Constant.js';

//moment for date parsing
import moment from 'moment';

// jquery & materialize
import $ from 'jquery';
//import $ from 'jquery';
window.$ = window.jQuery = require('jquery');
//window.$ = window.jQuery = $;

require('materialize-css/dist/js/materialize.min.js');
//require('materialize-css/materialize.min.js')

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

/**
 * The navigation bar 
 */
class TopNavbar extends Component {

    /**
     * fit the items in the timeline
     */
    fit() {
        if (typeof this.props.onFit === 'function') {
            this.props.onFit();
        }
    }

    stackToggle() {
        if (typeof this.props.onStackToggle === 'function') {
            this.props.onStackToggle();
        }
    }

    removePrograms() {
        if (typeof this.props.onRemovePrograms === 'function') {
            this.props.onRemovePrograms();
        }
    }

    /**
     * refresh data (in dataset & in timeline)
     * @param  {String} type refresh type ("create" or "update")
     */
    refresh(type) {
        if (typeof this.props.onRefresh === 'function') {
            this.props.onRefresh(type);
        }
    }

    /**
     * open URL settings view
     */
    urlSettings() {
        if (typeof this.props.onUrlSettings === 'function') {
            this.props.onUrlSettings();
        }
    }

    /**
     * Open Global Settings view
     * 
     */
    globalSettings() {
        if (typeof this.props.onGlobalSettings === 'function') {
            this.props.onGlobalSettings();
        }
    }

    render() {
        return <Navbar href={process.env.PUBLIC_URL} brand='Caipy Dashboard' className="blue darken-1" right>
                    <NavItem onClick={() => this.fit()}><Icon medium>zoom_in</Icon></NavItem>
                    <NavItem onClick={() => this.stackToggle()}><Icon medium>clear_all</Icon></NavItem>
                    <NavItem onClick={() => this.removePrograms()}><Icon medium>content_cut</Icon></NavItem>
                    <NavItem onClick={() => this.urlSettings()}><Chip close={false}>{this.props.mode} mode</Chip></NavItem> 
                    <NavItem onClick={() => this.globalSettings()}><Icon medium>settings</Icon></NavItem>
                    <NavItem onClick={() => this.refresh("update")}><Icon>refresh</Icon></NavItem>
                    <NavItem href="https://github.com/bertrandmartel/caipy-dashboard" target="_blank" ><Icon>code</Icon></NavItem>
                </Navbar>
    }
}

/**
 * Tab view showing the dataset & the timeline
 */
class TabCollection extends Component {

    state = {
        updatePageDate: null,
        updateChannel: null
    };

    caipyDataSet = {};
    epgDataSet = {};

    constructor(props) {
        super(props);
        this.updatePage = this.updatePage.bind(this);
    }

    /**
     * Update selected page according to start date of selected item
     * 
     * @param  {Date} date start date of selected item
     * @param  {String} channel channel tab to update
     */
    updatePage(date, channel) {
        this.caipyDataSet[channel].updatePage(date);
        this.epgDataSet[channel].updatePage(date);
    }

    render() {
        return <div className='tab-main'>
                    <Tabs>
                            <Tab title="timeline" active>
                                <div className={this.props.ready ? "" : "hidden"}>
                                    <Collection>
                                        {
                                            this.props.items.map(function(value, index){
                                                return (
                                                        <CollectionItem className="coll-item" key={value.channelName + "-coll"}>
                                                            <Timeline key={value.channelName}
                                                                      channel={value.channelName}
                                                                      data={value}
                                                                      onUpdatePage={this.updatePage}
                                                                      options={this.props.options}
                                                                      actionType={this.props.actionType}
                                                                      settings={this.props.settings}
                                                                      />
                                                        </CollectionItem>             
                                               );
                                            },this)
                                        }
                                    </Collection>
                                </div>
                            </Tab>
                            <Tab title="event dataset" active>
                                <div className={this.props.ready ? "" : "hidden"}>
                                    <Collection>
                                        {
                                            this.props.caipyData.map(function(value, index){
                                                return (
                                                    <CaipyDataSetItem key={value.name} 
                                                                 name={value.name}
                                                                 rows={value.rows}
                                                                 length={value.rows.length}
                                                                 perPage={15}
                                                                 ref={instance => { this.caipyDataSet[value.name] = instance; }}
                                                                 />
                                               );
                                            },this)
                                        }
                                    </Collection>
                                </div>
                            </Tab>
                            <Tab title="epg dataset" active>
                                <div className={this.props.ready ? "" : "hidden"}>
                                    <Collection>
                                        {
                                            this.props.epgData.map(function(value, index){
                                                return (
                                                    <EpgDataSetItem key={value.name} 
                                                                 name={value.name}
                                                                 rows={value.rows}
                                                                 length={value.rows.length}
                                                                 perPage={15}
                                                                 ref={instance => { this.epgDataSet[value.name] = instance; }}
                                                                 />
                                               );
                                            },this)
                                        }
                                    </Collection>
                                </div>
                            </Tab>
                    </Tabs>
                </div>
    }
}

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

    /**
     * mode can be "demo" or "live"
     * @type {String}
     */
    mode = "demo";

    /**
     * Program duration that should be excluded if duration is less than this value.
     * 
     * @type {Number}
     */
    cutProgramDuration = 0;

    /**
     * Exclude program duration state (enable/disable).
     * 
     * @type {Boolean}
     */
    cutProgramState = false;

    /**
     * default timeline item type (false for "range" / true for "point")
     * @type {Boolean}
     */
    options = {
        stack: false,
        type: "range"
    };

    /**
     * Global settings.
     * 
     * @type {Object}
     */
    settings = {
        zoomWindowSize: Constant.defaultZoomWindowSize,
        windowInitSize: Constant.defaultWindowInitSize
    };

    constructor() {
        super();
        this.items = [];
        this.caipyData = [];
        this.epgData = [];
        this.checkDate();
        this.checkOptions();
        this.checkCutProgram();
        this.fit = this.fit.bind(this);
        this.stackToggle = this.stackToggle.bind(this);
        this.refresh = this.refresh.bind(this);
        this.setUrlSettings = this.setUrlSettings.bind(this);
        this.setMode = this.setMode.bind(this);
        this.setFilterSettings = this.setFilterSettings.bind(this);
        this.setPreset = this.setPreset.bind(this);
        this.excludeProgram = this.excludeProgram.bind(this);
        this.excludeProgramStateChange = this.excludeProgramStateChange.bind(this);
        this.updateGlobalSettings = this.updateGlobalSettings.bind(this);
        this.initMode();
        this.initPreset();
        this.initSettings();
    }

    initSettings() {
        this.settings.windowInitSize = Storage.getWindowInitSize();
        this.settings.zoomWindowSize = Storage.getZoomWindowSize();
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
     * Initialize working mode (live or demo)
     * 
     */
    initMode() {
        if (Storage.checkMode() !== null &&
            Storage.checkMode() === "live" &&
            Storage.checkApiUrl()) {
            this.mode = "live";
        } else {
            Storage.setMode("demo");
        }
    }

    /**
     * Initialize options for timeline
     */
    checkOptions() {
        this.options.stack = Storage.getStack();
        this.options.type = Storage.getType();
    }

    /**
     * Initialize options for timeline
     */
    checkCutProgram() {
        this.cutProgramDuration = Storage.getCutProgramDuration();
        this.cutProgramState = Storage.getCutProgramState();
    }

    /**
     * initialize dates used in filter & query
     */
    checkDate() {
        var startDate = Storage.getStartDate();
        var endDate = Storage.getEndDate();
        if (startDate !== null && startDate !== "undefined" &&
            endDate !== null && endDate !== "undefined") {
            this.date.startDate = startDate;
            this.date.endDate = endDate;
        }
    }

    /**
     * On mount check the mode ("live" or "demo") and refresh the data according to this
     */
    componentDidMount() {
        this.refresh("create");
    }

    /**
     * Parse the JSON data to build timeline DataSet 
     * @param  {Object} data       JSON data object (from query response or from local JSON file)
     * @param  {String} actionType type of action to perform ("create","update","idle")
     */
    parseItems(caipyData, epgData, items, actionType) {
        this.items = items;
        this.caipyData = caipyData;
        this.epgData = epgData;
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
            endDate: this.date.endDate
        });
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
     * @return {[type]}            [description]
     */
    refresh(actionType) {
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

        if (this.mode === "live") {

            var startDate = moment(this.date.startDate, "DD/MM/YYYY").format("YYYYMMDDHHmmSS");
            var stopDate = moment(this.date.endDate, "DD/MM/YYYY").format("YYYYMMDDHHmmSS");

            //get channel list
            ApiUtils.getPrograms(Storage.getApiUrl(), startDate, stopDate, this.cutProgramState, this.cutProgramDuration, function(err, programRes, epgData) {
                if (err) {
                    console.log(err);
                    return that.showError();
                }
                ApiUtils.getCaipyData(Storage.getApiUrl(), startDate, stopDate, that.preset, programRes, function(err, caipyRes, caipyData) {
                    if (err) {
                        console.log(err);
                        return that.showError();
                    }

                    var items = ApiUtils.buildChannelMap(startDate, stopDate, caipyRes);

                    that.parseItems(caipyData, epgData, items, actionType);
                })
            });
        } else {
            var data = require('./demo/demo-data.json');

            var channels = [
                require('./demo/demo-tf1.json'),
                require('./demo/demo-france2.json'),
                require('./demo/demo-m6.json')
            ];

            var epgResult = ApiUtils.getDemoProgram(channels, this.cutProgramState, this.cutProgramDuration);
            var caipyResult = ApiUtils.getDemoEvents(data, epgResult.channels);

            var items = ApiUtils.buildChannelMap(startDate, stopDate, caipyResult.channels);

            that.parseItems(caipyResult.caipy, epgResult.programs, items, actionType);
        }
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
        this.refresh("update");
    }

    /**
     * Set filter value
     * @param {Date} startDate start date filter
     * @param {Date} endDate   end date filter
     */
    setFilterSettings(startDate, endDate) {
        Storage.setDate(startDate, endDate);
        this.date.startDate = startDate;
        this.date.endDate = endDate;
        this.refresh("update");
    }

    /**
     * Set preset value
     * 
     * @param {String} preset Preset value from dropdown list
     */
    setPreset(preset) {
        this.preset = preset;
        Storage.setPreset(preset);
        this.refresh("update");
    }

    /**
     * Set the mode ("demo" or "live")
     * @param {String} mode the mode
     */
    setMode(mode) {
        Storage.setMode(mode);
        this.mode = mode;
        this.refresh("update");
    }

    excludeProgram(cutProgramDuration) {
        this.cutProgramDuration = cutProgramDuration;
        this.cutProgramState = true;
        Storage.setCutProgramDuration(this.cutProgramDuration);
        Storage.setCutProgramState(this.cutProgramState);
        this.refresh("update");
    }

    excludeProgramStateChange() {
        this.cutProgramState = false;
        Storage.setCutProgramState(false);
        this.refresh("update");
    }

    updateGlobalSettings(zoomWindowSize, windowInitSize) {
        this.settings = {
            zoomWindowSize: zoomWindowSize,
            windowInitSize: windowInitSize
        };
        Storage.setWindowInitSize(windowInitSize);
        Storage.setZoomWindowSize(zoomWindowSize);
        this.setState({
            actionType: "options-global",
            ready: true,
            caipyData: this.caipyData,
            epgData: this.epgData,
            items: this.items,
            mode: this.mode,
            options: this.options,
            url: Storage.getApiUrl(),
            message: "",
            startDate: this.date.startDate,
            endDate: this.date.endDate
        })
    }

    /**
     * Open URL settings modal
     */
    urlSettings() {
        $('#url-settings').modal('open');
    }

    /**
     * Open URL settings modal
     */
    removeProgram() {
        $('#cut-program-settings').modal('open');
    }

    /**
     * Open Global settings modal
     */
    globalSettings() {
        $('#global-settings').modal('open');
    }

    /**
     * fit the items in the timeline according to time window or selected items
     */
    fit() {
        this.setState({
            actionType: "fit",
            ready: true,
            caipyData: this.caipyData,
            epgData: this.epgData,
            items: this.items,
            mode: this.mode,
            options: this.options,
            url: Storage.getApiUrl(),
            message: "",
            startDate: this.date.startDate,
            endDate: this.date.endDate
        })
    }

    stackToggle() {
        this.options.stack = !this.options.stack;
        Storage.setStack(this.options.stack);
        this.setState({
            actionType: "options-timeline",
            ready: true,
            caipyData: this.caipyData,
            epgData: this.epgData,
            items: this.items,
            mode: this.mode,
            options: this.options,
            url: Storage.getApiUrl(),
            message: "",
            startDate: this.date.startDate,
            endDate: this.date.endDate
        })
    }

    render() {
        return (
            <div className="body">
                <div className="main">
                    <TopNavbar mode={this.state.mode}
                               onFit={this.fit}
                               onRefresh={this.refresh}
                               onStackToggle={this.stackToggle}
                               onUrlSettings={this.urlSettings}
                               onRemovePrograms={this.removeProgram}
                               onGlobalSettings={this.globalSettings} />
                    <FilterView onSetFilterSettings={this.setFilterSettings}
                                onPresetChange={this.setPreset}
                                mode={this.state.mode}
                                startDate={this.date.startDate}
                                endDate={this.date.endDate}
                                presets={this.presets}
                                preset={this.preset}/>
                    <TabCollection ready={this.state.ready} 
                                   items={this.state.items} 
                                   caipyData={this.state.caipyData}
                                   epgData={this.state.epgData}
                                   actionType={this.state.actionType}
                                   options={this.options}
                                   settings={this.settings}/>
                    <ProgressView value={this.state.ready}
                                  message={this.state.message}/>
                    <UrlSettingsView mode={this.state.mode}
                                  url={this.state.url}
                                  onSetUrlSettings={this.setUrlSettings}
                                  onSetMode={this.setMode}/>
                    <ProgramSettingsView
                                  cutProgramDuration={this.cutProgramDuration}
                                  cutProgramState={this.cutProgramState}
                                  onExcludeProgram={this.excludeProgram}
                                  onExcludeStateChange={this.excludeProgramStateChange}
                                  />
                    <GlobalSettingsView 
                                  settings={this.settings}
                                  onGlobalSettings={this.updateGlobalSettings}/>
                </div>
                <FooterView/>
             </div>
        );
    }
}

export default App;
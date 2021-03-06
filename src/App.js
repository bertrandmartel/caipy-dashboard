//style
import 'vis/dist/vis.css';
//import 'materialize-css/dist/css/materialize.min.css';
//import './css/MaterialColor.css';
//import './css/Footer.css';
import './css/Timeline.css';
import './css/App.css';

import moment from 'moment';

//react
import React, { Component } from 'react';

import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import List from 'material-ui/List';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import MenuData from './component/MenuData.js';
import ProgressView from './component/ProgressView.js';
import classNames from 'classnames';
import IconButton from 'material-ui/IconButton';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import BuildIcon from 'material-ui-icons/Build';
import Typography from 'material-ui/Typography';

// other react components
import GlobalSettingsView from './component/GlobalSettings.js'
import UrlDialog from './component/UrlDialog.js';
import SectionTabs from './component/SectionTabs.js';
import TopNavbar from './component/TopNavbar.js';
import FlowChartView from './component/FlowChartModal.js';

//utility for Caipy (parse JSON data)
import * as ApiUtils from './api/CaipyApi.js';
import * as Storage from './stores/Storage.js';

//import constant values
import * as Constant from './constants/Constant.js';

//import utils 
import * as Utils from './utils/Utils.js';

const drawerWidth = 240;

const theme = createMuiTheme({
    palette: {
        type: 'light', // Switching the dark mode on is a single property value change.
    },
});

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
    },
    appFrame: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    appBar: {
        position: 'absolute',
        zIndex: theme.zIndex.navDrawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        overflow: 'hidden',
        border: '0px !important',
        height: '100%',
    },
    drawerPaperClose: {
        width: 60,
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    drawerInner: {
        // Make the items inside not wrap when transitioning:
        width: drawerWidth,
        height: '100%',
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    dockedDrawer: {
        height: '100%',
    },
    list: {
        border: 0,
        marginTop: 24,
        paddingTop: 0,
        height: 'calc(100% - 100px)',
        overflowY: 'overlay'
        //height:(window.innerHeight-64)
    },
    content: {
        backgroundColor: theme.palette.background.default,
        width: '100%',
        padding: theme.spacing.unit * 3,
        height: 'calc(100% - 100px)',
        maxHeight: '100%',
        marginTop: 56,
        [theme.breakpoints.up('sm')]: {
            marginTop: 64,
        },
        overflow: 'overlay'
    },
    drawerBorder: {
        borderRight: '1px solid #E0E0E0',
        height: '100%'
    },
    listContainer: {
        height: '100%',
    },
    titleCentered: {
        margin: '0 auto'
    },
    iconHeadline: {
        marginLeft: 10
    }
});

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
        endDate: this.date.endDate,
        openUrlDialog: false,
        drawerOpen: true
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

    startover = {
        chartCode: "",
        chartOptions: {}
    };

    timelineOptions = {
        currentTime: null,
        windowStart: null,
        windowEnd: null
    };

    settingsStyle = {
        windowSize: {},
        startOverDetectAd: {},
        startOverDetectSharpStart: {},
        dropProgram: {}
    };

    startovers = [
        "with ad",
        "without ad",
    ];

    startoverType = "with ad";

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

    urlDialog = false;
    settingsDialog = false;
    flowchartDialog = false;

    windowSizeTemp = 0;
    dropProgramTemp = 0;

    constructor() {
        super();
        this.initStorage();
        this.refresh = this.refresh.bind(this);
        this.setUrlSettings = this.setUrlSettings.bind(this);
        this.setMode = this.setMode.bind(this);
        this.setFilterSettings = this.setFilterSettings.bind(this);
        this.setPreset = this.setPreset.bind(this);
        this.setChannel = this.setChannel.bind(this);
        this.setStartOverType = this.setStartOverType.bind(this);
        this.updateGlobalSettings = this.updateGlobalSettings.bind(this);
        this.playRolling = this.playRolling.bind(this);
        this.pauseRolling = this.pauseRolling.bind(this);
        this.setStartOverChart = this.setStartOverChart.bind(this);
        this.openFlowChart = this.openFlowChart.bind(this);
        this.setFlowChartOpacity = this.setFlowChartOpacity.bind(this);
        this.share = this.share.bind(this);
        this.updateOptions = this.updateOptions.bind(this);
        this.refreshGlobalSettingsView = this.refreshGlobalSettingsView.bind(this);
        this.openUrlSettings = this.openUrlSettings.bind(this);
        this.openSettings = this.openSettings.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
        this.handleDrawerClose = this.handleDrawerClose.bind(this);
        this.windowSizeTemp = this.settings.windowSize;
        this.dropProgramTemp = this.settings.dropProgram;
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
        this.windowSizeTemp = this.settings.windowSize;
        this.dropProgramTemp = this.settings.dropProgram;

        //filter date
        this.date.startDate = Storage.getStartDate();
        this.date.endDate = Storage.getEndDate();

        //mode
        this.mode = Storage.getMode();

        //flow chart opacity
        this.flowChartOpacity = Storage.getFlowChartOpacity();

        //startover
        this.startoverType = Storage.getStartOverType();
    }

    /**
     * Parse url parameter in case it is a shared page.
     */
    parseUrlParams() {
        var query = Utils.getQueryParams(document.location.search);

        if (query.mode) {
            if (query.mode === "live" || query.mode === "demo") {
                Storage.setMode(query.mode);
                this.mode = query.mode;
            }
        }
        if (query.apiUrl) {
            if (this.mode === 'live' && Utils.isValidUrl(query.apiUrl)) {
                Storage.setApiUrl(query.apiUrl);
                Storage.setMode("live");
                this.mode = "live";
                this.initPreset();
                this.initChannel();
            } else {
                console.log("invalid mode or invalid url");
            }
        }
        if (query.startDate) {
            if (moment(query.startDate, "DD/MM/YYYY").isValid()) {
                this.date.startDate = query.startDate;
                Storage.setStartDate(this.date.startDate);
            }
        }
        if (query.endDate) {
            if (moment(query.endDate, "DD/MM/YYYY").isValid()) {
                this.date.endDate = query.endDate;
                Storage.setEndDate(this.date.endDate);
            }
        }
        if (query.dropProgram) {
            if (Utils.isNumeric(query.dropProgram)) {
                this.settings.dropProgram = parseInt(query.dropProgram, 10);
                Storage.setCutProgramDuration(this.settings.dropProgram);
            } else {
                console.log("error not numeric : " + query.dropProgram);
            }
        }
        if (query.startOverDetectAd) {
            if (Utils.isNumeric(query.startOverDetectAd)) {
                this.settings.startOverDetectAd = parseInt(query.startOverDetectAd, 10);
                Storage.setStartOverRangeAd(this.settings.startOverDetectAd);
            } else {
                console.log("error not numeric : " + query.startOverDetectAd);
            }
        }
        if (query.startOverDetectSharpStart) {
            if (Utils.isNumeric(query.startOverDetectSharpStart)) {
                this.settings.startOverDetectSharpStart = parseInt(query.startOverDetectSharpStart, 10);
                Storage.setStartOverRangeSharpStart(this.settings.startOverDetectSharpStart);
            } else {
                console.log("error not numeric : " + query.startOverDetectSharpStart);
            }
        }
        if (query.channel) {
            this.channel = query.channel;
            Storage.setChannel(this.channel);
        }
        if (query.preset) {
            this.preset = query.preset;
            Storage.setPreset(this.preset);
        }
        if (query.startoverType) {
            for (var i = 0; i < this.startovers.length; i++) {
                if (this.startovers[i] === query.startoverType) {
                    this.startoverType = query.startoverType;
                    Storage.setStartOverType(this.startoverType);
                }
            }
        }

        var options = {
            currentTime: null,
            windowStart: null,
            windowEnd: null
        };

        if (query.currentTime) {
            if (Utils.isNumeric(query.currentTime)) {
                options.currentTime = new Date(parseInt(query.currentTime, 10));
            }
        }
        if (query.windowStart) {
            if (Utils.isNumeric(query.windowStart)) {
                options.windowStart = new Date(parseInt(query.windowStart, 10));
            }
        }
        if (query.windowEnd) {
            if (Utils.isNumeric(query.windowEnd)) {
                options.windowEnd = new Date(parseInt(query.windowEnd, 10));
            }
        }
        return options;
    }

    /**
     * On mount check the mode ("live" or "demo") and refresh the data according to this
     */
    componentDidMount() {
        var options = this.parseUrlParams();
        this.initChannel();
        this.refresh("create", false, options);
    }

    /**
     * Update the action type from a ready state
     * 
     * @param  {String} actionType action to perform
     */
    updateState(actionType, keepCurrentWindow, overrideOptions) {
        this.setState({
            actionType: actionType,
            ready: true,
            caipyData: this.caipyData,
            epgData: this.epgData,
            items: this.items,
            mode: this.mode,
            options: this.options,
            overrideOptions: overrideOptions,
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
    parseItems(caipyData, epgData, items, actionType, keepCurrentWindow, overrideOptions) {
        this.items = items;
        this.caipyData = caipyData;
        this.epgData = epgData;
        this.fullEpgData = JSON.parse(JSON.stringify(epgData));
        this.updateState(actionType, keepCurrentWindow, overrideOptions);
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
    refresh(actionType, keepCurrentWindow, overrideOptions) {
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
                that.parseItems(res.caipyEvents, res.epgPrograms, res.timelineItems, actionType, keepCurrentWindow, overrideOptions);
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
        this.initChannel();
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
     * Set startover type
     * @param {String} type start over type
     */
    setStartOverType(type) {
        this.startoverType = type;
        Storage.setStartOverType(type);
        this.updateState("startover-type");
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

    setFlowChartOpacity(opacity) {
        this.flowChartOpacity = opacity;
        Storage.setFlowChartOpacity(opacity);
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

        if (settings.windowSize !== this.windowSizeTemp) {
            //update options and update the window
            nextState = "options-global";
            this.windowSizeTemp = settings.windowSize;
        }

        if (settings.dropProgram !== this.dropProgramTemp) {
            update = true;
            this.dropProgramTemp = settings.dropProgram;
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

    /**
     * Set the Start Over flowchart code & options
     * 
     * @param {Object} chartCode   Flow chart code
     * @param {Object} chartOptions Flow chart options
     */
    setStartOverChart(chartCode, chartOptions) {
        this.startover = {
            state: "update",
            chartCode: chartCode,
            chartOptions: chartOptions
        };
        this.updateState("tools");
    }

    playRolling() {
        this.updateState("tools");
    }

    pauseRolling() {
        this.updateState("tools");
    }

    openFlowChart() {
        this.flowchartDialog = true;
        this.startover = {
            state: "create"
        };
        this.updateState("tools");
    }

    openUrlSettings() {
        this.urlDialog = true;
        this.updateState("tools");
    }

    openSettings() {
        this.settingsDialog = true;
        this.updateState("tools");
    }

    closeDialog() {
        this.urlDialog = false;
        this.settingsDialog = false;
        this.flowchartDialog = false;
        this.updateState("tools");
    }

    /**
     * Update timeline window and timeline current time
     * 
     * @param  {Object} window      timeline window object with start and end time
     * @param  {Date}   currentTime current timeline datetime
     */
    updateOptions(window, currentTime) {
        this.timelineOptions = {
            currentTime: currentTime,
            windowStart: window.start,
            windowEnd: window.end
        };
    }

    refreshGlobalSettingsView(settings) {
        this.settings = settings.data;
        this.settingsStyle = settings.style;
        this.updateState("tools");
    }

    /**
     * Share the current page with all parameters
     */
    share() {
        var url = window.location.href + "?";
        //mode
        url += "mode=" + encodeURIComponent(this.mode) + "&apiUrl=" + encodeURIComponent(Storage.getApiUrl()) + "&";

        //date
        url += "startDate=" + encodeURIComponent(this.date.startDate) + "&endDate=" + encodeURIComponent(this.date.endDate) + "&";

        //startover settings
        url += "dropProgram=" + this.settings.dropProgram + "&startOverDetectAd=" + this.settings.startOverDetectAd + "&";
        url += "startOverDetectSharpStart=" + this.settings.startOverDetectSharpStart + "&";

        //window & current time
        if (this.timelineOptions.currentTime != null) {
            url += "currentTime=" + this.timelineOptions.currentTime.getTime() + "&";
        }
        if (this.timelineOptions.windowStart != null) {
            url += "windowStart=" + this.timelineOptions.windowStart.getTime() + "&";
        }
        if (this.timelineOptions.windowEnd != null) {
            url += "windowEnd=" + this.timelineOptions.windowEnd.getTime() + "&";
        }
        //preset and channel
        url += "channel=" + encodeURIComponent(this.channel) + "&";
        url += "preset=" + encodeURIComponent(this.preset) + "&";

        //startover mode
        url += "startoverType=" + encodeURIComponent(this.startoverType);

        //https://stackoverflow.com/a/6055620/2614364
        window.prompt("Copy to clipboard: Ctrl+C, Enter", url);
    }

    handleDrawerOpen() {
        this.setState({ drawerOpen: true });
    }

    handleDrawerClose() {
        this.setState({ drawerOpen: false });
    }

    render() {
        const { classes } = this.props;
        return (
            <MuiThemeProvider theme={theme}>
                <div className={classes.root}>
                    <div className={classes.appFrame}>

                        <TopNavbar mode={this.state.mode}
                                   onShare={this.share}
                                   onOpenUrlSettings={this.openUrlSettings}
                                   onOpenSettings={this.openSettings}
                                   drawerOpen={this.state.drawerOpen}
                                   onHandleDrawerOpen={this.handleDrawerOpen}
                                   className={classNames(classes.appBar, this.state.drawerOpen && classes.appBarShift)}/>

                        <div className={classes.drawerBorder}>
                            <Drawer
                              type="permanent"
                              classes={{
                                  paper: classNames(classes.drawerPaper, !this.state.drawerOpen && classes.drawerPaperClose),
                                }}
                              className={classes.dockedDrawer}
                              open={this.state.drawerOpen}
                            >
                              <div className={classes.drawerInner}>
                                    <div className={classes.drawerHeader}>
                                        
                                        <BuildIcon className={classes.iconHeadline}/>
                                        <Typography type="headline" color="inherit" className={classes.titleCentered}>
                                            {'Start Over'}
                                        </Typography>
                                      
                                        <IconButton onClick={this.handleDrawerClose}>
                                          <ChevronLeftIcon />
                                        </IconButton>
                                    </div>
                                    <Divider />
                                    <div className={classes.listContainer}>
                                        <List className={classes.list}>
                                            <MenuData 
                                                theme={theme}
                                                channel={this.channel}
                                                channels={this.channels}
                                                preset={this.preset}
                                                presets={this.presets}
                                                startover={this.startoverType}
                                                startovers={this.startovers}
                                                startDate={this.date.startDate}
                                                endDate={this.date.endDate}
                                                onChannelChange={this.setChannel}
                                                onPresetChange={this.setPreset}
                                                onStartOverChange={this.setStartOverType}
                                                onSetFilterSettings={this.setFilterSettings}
                                                drawerOpen={this.state.drawerOpen}
                                                onHandleDrawerOpen={this.handleDrawerOpen}
                                                />
                                        </List>
                                    </div>
                                </div>
                            </Drawer>
                        </div>
                        <main className={classes.content}>

                            <SectionTabs ready={this.state.ready} 
                                           items={this.state.items} 
                                           caipyData={this.state.caipyData}
                                           epgData={this.state.epgData}
                                           actionType={this.state.actionType}
                                           options={this.options}
                                           settings={this.settings}
                                           onPlayRolling={this.playRolling}
                                           onPauseRolling={this.pauseRolling}
                                           onSetStartOverChart={this.setStartOverChart}
                                           keepCurrentWindow={this.state.keepCurrentWindow}
                                           onOpenFlowChart={this.openFlowChart}
                                           onUpdateOptions={this.updateOptions}
                                           overrideOptions={this.state.overrideOptions}
                                           startover={this.startoverType}
                                           />

                            <ProgressView value={this.state.ready}
                                          message={this.state.message}/>

                            <UrlDialog mode={this.state.mode}
                                          url={this.state.url}
                                          open={this.urlDialog}
                                          onSetUrlSettings={this.setUrlSettings}
                                          onSetMode={this.setMode}
                                          onDialogClose={this.closeDialog}/>

                            <GlobalSettingsView 
                                          settings={this.settings}
                                          settingsStyle={this.settingsStyle}
                                          onGlobalSettings={this.updateGlobalSettings}
                                          onRefreshGlobalSettingsView={this.refreshGlobalSettingsView}
                                          onDialogClose={this.closeDialog}
                                          open={this.settingsDialog}/>

                            <FlowChartView 
                                flowChartOpacity={this.flowChartOpacity}
                                state={this.startover.state}
                                chartCode={this.startover.chartCode}
                                chartOptions={this.startover.chartOptions}
                                onSetFlowChartOpacity={this.setFlowChartOpacity}
                                startoverType={this.startoverType}
                                onDialogClose={this.closeDialog}
                                open={this.flowchartDialog}/>
                        </main>
                        {/*                   
                        <div className="footer-copyright">
                            <a href="https://github.com/bertrandmartel" rel="noopener noreferrer" target="_blank">Copyright (c) 2017 Bertrand Martel</a>
                        </div>*/
                        }
                    </div>
                </div>
             </MuiThemeProvider>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
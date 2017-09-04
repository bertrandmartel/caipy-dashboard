//react
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import EpgDataSet from './EpgDataSet.js';
import CaipyDataSet from './CaipyDataSet.js';
import TimelineContainer from './Timeline.js';

function TabContainer(props) {
    return <div style={{ paddingLeft : 20, paddingRight:20}}>{props.children}</div>;
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: 0,
        backgroundColor: theme.palette.background.paper,
    },
});

/**
 * Tab view showing the dataset & the timeline
 */
class SectionTabs extends Component {

    caipyDataSet = {};
    epgDataSet = {};

    constructor(props) {
        super(props);
        this.updatePage = this.updatePage.bind(this);
        this.playRolling = this.playRolling.bind(this);
        this.pauseRolling = this.pauseRolling.bind(this);
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

    playRolling() {
        this.props.onPlayRolling();
    }

    pauseRolling() {
        this.props.onPauseRolling();
    }

    state = {
        value: 0,
        updatePageDate: null,
        updateChannel: null
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render() {
        const { classes } = this.props;
        const { value } = this.state;

        return <div className={classes.root}>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange}>
            <Tab label="timeline" />
            <Tab label="event dataset" />
            <Tab label="EPG dataset" />
          </Tabs>
        </AppBar>
        {
          value === 0 &&  <TabContainer>
                              <div className={this.props.ready ? "" : "hidden"}>
                                <TimelineContainer 
                                  key={this.props.items.channelName}
                                  channel={this.props.items.channelName}
                                  data={this.props.items}
                                  caipyData={this.props.caipyData}
                                  epgData={this.props.epgData}
                                  onUpdatePage={this.updatePage}
                                  options={this.props.options}
                                  actionType={this.props.actionType}
                                  settings={this.props.settings}
                                  onPlayRolling={this.playRolling}
                                  onPauseRolling={this.pauseRolling}
                                  onSetStartOverChart={this.props.onSetStartOverChart}
                                  keepCurrentWindow={this.props.keepCurrentWindow}
                                  onOpenFlowChart={this.props.onOpenFlowChart}
                                  onUpdateOptions={this.props.onUpdateOptions}
                                  overrideOptions={this.props.overrideOptions}
                                  startover={this.props.startover}
                                  />
                              </div>
                          </TabContainer>

        }
        {
          value === 1 && <TabContainer>
                          <div className={this.props.ready ? "" : "hidden"}>
                            {
                                this.props.caipyData.map(function(value, index){
                                    return (
                                        <CaipyDataSet key={value.name} 
                                                     name={value.name}
                                                     rows={value.rows}
                                                     length={value.rows.length}
                                                     perPage={50}
                                                     ref={instance => { this.caipyDataSet[value.name] = instance; }}
                                                     />
                                   );
                                },this)
                            }
                          </div>
                        </TabContainer>
        }
        {
          value === 2 && <TabContainer>
                          <div className={this.props.ready ? "" : "hidden"}>
                                
                            <EpgDataSet 
                              key={this.props.epgData.name} 
                              name={this.props.epgData.name}
                              rows={this.props.epgData.rows}
                              perPage={50}
                              ref={instance => { this.epgDataSet[this.props.epgData.name] = instance; }}
                            />
                          </div>
                        </TabContainer>
        }
      </div>

        /*
        return <div className='tab-main'>
                    <Tabs>
                            <Tab title="timeline" active>
                                <div className={this.props.ready ? "" : "hidden"}>
                                    <Collection>
                                        <CollectionItem className="coll-item" key={this.props.items.channelName + "-coll"}>
                                            <TimelineContainer key={this.props.items.channelName}
                                                      channel={this.props.items.channelName}
                                                      data={this.props.items}
                                                      caipyData={this.props.caipyData}
                                                      epgData={this.props.epgData}
                                                      onUpdatePage={this.updatePage}
                                                      options={this.props.options}
                                                      actionType={this.props.actionType}
                                                      settings={this.props.settings}
                                                      onPlayRolling={this.playRolling}
                                                      onPauseRolling={this.pauseRolling}
                                                      onSetStartOverChart={this.props.onSetStartOverChart}
                                                      keepCurrentWindow={this.props.keepCurrentWindow}
                                                      onOpenFlowChart={this.props.onOpenFlowChart}
                                                      onUpdateOptions={this.props.onUpdateOptions}
                                                      overrideOptions={this.props.overrideOptions}
                                                      startover={this.props.startover}
                                                      />
                                        </CollectionItem>
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
                                        <EpgDataSetItem key={this.props.epgData.name} 
                                                     name={this.props.epgData.name}
                                                     rows={this.props.epgData.rows}
                                                     perPage={15}
                                                     ref={instance => { this.epgDataSet[this.props.epgData.name] = instance; }}
                                                     />
                                    </Collection>
                                </div>
                            </Tab>
                    </Tabs>
                </div>
                */
    }
}

SectionTabs.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SectionTabs);
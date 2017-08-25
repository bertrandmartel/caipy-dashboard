//react
import React, { Component } from 'react';

//react components
import { Tabs, Tab, Collection, CollectionItem } from 'react-materialize';

import { CaipyDataSetItem, EpgDataSetItem } from './DataSet.js';

import { TimelineContainer } from './Timeline.js';

/**
 * Tab view showing the dataset & the timeline
 */
export class TabCollection extends Component {

    state = {
        updatePageDate: null,
        updateChannel: null
    };

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

    playRolling(){
        this.props.onPlayRolling();
    }

    pauseRolling(){
        this.props.onPauseRolling();
    }

    render() {
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
                                                      keepCurrentWindow={this.props.keepCurrentWindow}
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
    }
}
//react
import React, { Component } from 'react';

//react components
import { Row, Input, Button, Icon } from 'react-materialize';

// moment
import moment from 'moment';

// jquery
import $ from 'jquery';
window.$ = window.jQuery = require('jquery');

/**
 * Filter component with start date / end date & submit button
 */
export class FilterView extends Component {

    startDate = "";
    stopDate = "";
    startDateChanged = false;
    endDateChanged = false;

    constructor() {
        super();
        this.setFilterSettings = this.setFilterSettings.bind(this);
        this.handlePresetChange = this.handlePresetChange.bind(this);
    }

    handleStartDateChange(e, value) {
        this.startDateChanged = true;
        this.startDate = value;
        this.setState({
            startDate: this.startDate,
            endDate: this.endDate
        })
    }

    handlePresetChange(e, value) {
        if (typeof this.props.onPresetChange === 'function') {
            this.props.onPresetChange(value);
        }
    }

    handleEndDateChange(e, value) {
        this.endDateChanged = true;
        this.endDate = value;
        this.setState({
            startDate: this.startDate,
            endDate: this.endDate
        })
    }

    setFilterSettings() {
        if (typeof this.props.onSetFilterSettings === 'function') {
            this.props.onSetFilterSettings(this.startDate, this.endDate);
        }
    }

    render() {
        if (!this.startDateChanged) {
            this.startDate = this.props.startDate;
        }
        if (!this.endDateChanged) {
            this.endDate = this.props.endDate;
        }

        return <Row className={this.props.mode === "demo" ? 'filter-row hidden': 'filter-row'}>
                    <input className='hidden' id='startDate' type='hidden' value={this.startDate} />
                    <input className='hidden' id='endDate' type='hidden' value={this.endDate} />
                    <Input className='datepicker'
                           ref="startDate" 
                           type="date"  
                           label="start date"
                           value={this.startDate}
                           onChange={(e,value)=>this.handleStartDateChange(e,value)}
                           options={
                            {   
                                onSet: function( arg ){
                                    if ( 'select' in arg ){ //prevent closing on selecting month/year
                                        this.close();
                                    }
                                },
                                onStart: function() {
                                    this.set('select', moment($('#startDate').val(),'DD/MM/YYYY').toDate());
                                },
                                onClose: function() {
                                    $(document.activeElement).blur();
                                },
                                selectMonths: true,
                                format: 'dd/mm/yyyy',
                                formatSubmit: 'dd/mm/yyyy'
                            }
                           } />
                    <Input className='datepicker' 
                           ref="endDate" 
                           type="date"  
                           label="end date" 
                           value={this.endDate}
                           onChange={(e,value)=>this.handleEndDateChange(e,value)}
                           options={
                            {
                                onSet: function( arg ){
                                    if ( 'select' in arg ){ //prevent closing on selecting month/year
                                        this.close();
                                    }
                                },
                                onStart: function() {
                                    this.set('select', moment($('#endDate').val(),'DD/MM/YYYY').toDate());
                                },
                                onClose: function() {
                                    $(document.activeElement).blur();
                                },
                                selectMonths: true,
                                format: 'dd/mm/yyyy',
                                formatSubmit: 'dd/mm/yyyy'
                            }
                           } />
                        <div className="col">
                            <Button className="blue darken-1 filter-btn" waves='light' onClick={() => this.setFilterSettings()}><Icon>filter_list</Icon></Button>   
                        </div>
                        <Input className="presets" onChange={(e,value)=>this.handlePresetChange(e,value)} s={2} type='select' label="Presets" value={this.props.preset}>
                            {
                                this.props.presets.map(function(value, index){
                                    return (
                                        <option key={value} value={value}>{value}</option>  
                                   );
                                },this)
                            }
                        </Input>
                </Row>
    }
}
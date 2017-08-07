import React, { Component } from 'react';

import { Pagination, Table, CollectionItem } from 'react-materialize';

/**
 * Date Set table 
 */
export class DataSetItem extends Component {

    /**
     * state change depending on pageIndex value
     * @type {Object}
     */
    state = {
        pageIndex: 1,
    };

    constructor() {
        super();
        this.onSelect = this.onSelect.bind(this);
    }

    onSelect(index) {
        this.setState({
            pageIndex: index
        });
    }

    render() {
        var dataRow = this.props.rows.slice((this.state.pageIndex - 1) * this.props.perPage, (this.state.pageIndex - 1) * this.props.perPage + this.props.perPage);

        return <CollectionItem className="coll-item" key={this.props.name + "-coll"}>
                    <h5>{this.props.name}</h5>
                    <Pagination items={Math.round(this.props.length/this.props.perPage)} 
                                activePage={this.state.pageIndex} 
                                maxButtons={10}
                                onSelect={this.onSelect} />
                    <p>{(this.state.pageIndex-1)*this.props.perPage + 1}-{(this.state.pageIndex-1)*this.props.perPage+this.props.perPage} of {this.props.length}
                    </p>
                    <Table>
                        <thead>
                            <tr>
                                <th data-field="time">time</th>
                                <th data-field="name">name</th>
                                <th data-field="title">title</th>
                                <th data-field="start">start</th>
                                <th data-field="stop">stop</th>
                                <th data-field="secs">seconds</th>
                                <th data-field="epochstart">epoch start</th>
                                <th data-field="epochend">epoch end</th>
                                <th data-field="duration">duration</th>
                            </tr>
                        </thead>

                        <tbody>
                        {
                            dataRow.map(function(item, index){
                                return (
                                    <tr key={this.props.name+":"+item.time}>
                                        <td>{item.time}</td>
                                        <td>{item.name}</td>
                                        <td>{item.title}</td>
                                        <td>{item.start}</td>
                                        <td>{item.stop}</td>
                                        <td>{item.secs}</td>
                                        <td>{item.epochstart}</td>
                                        <td>{item.epochend}</td>
                                        <td>{item.duration}</td>
                                    </tr>
                                );
                            },this)
                        }
                        </tbody>
                    </Table>                              
                </CollectionItem>
    }
}
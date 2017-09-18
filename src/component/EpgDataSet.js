import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import MobileStepper from 'material-ui/MobileStepper';
import Button from 'material-ui/Button';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';

import moment from 'moment';

import * as TableSet from './DataSetCommon';

/**
 * Date Set table 
 */
export class EpgDataSet extends TableSet.DataSet {

    getDateField() {
        return "start";
    }

    render() {
        const classes = this.props.classes;
        this.data = this.props.rows;

        if (this.data) {
            var dataRow = [];
            var length = 0;

            if (this.data) {
                dataRow = this.props.rows.slice((this.state.pageIndex - 1) * this.props.perPage, (this.state.pageIndex - 1) * this.props.perPage + this.props.perPage);
                length = this.props.rows.length;
            }

            var maxValue = (this.state.pageIndex - 1) * this.props.perPage + this.props.perPage;

            if (this.state.pageIndex === this.getMax()) {
                maxValue = length;
            }

            return <Paper className={classes.paper}>
                    <div className={classes.stepContainer}>
                      <p className={classes.stepText}>{(this.state.pageIndex-1)*this.props.perPage + 1}-{maxValue} of {length}</p>
                      <MobileStepper
                        type="text"
                        steps={Math.ceil(this.props.rows.length / this.props.perPage)}
                        position="static"
                        activeStep={this.state.pageIndex}
                        className={classes.mobileStepper}
                        nextButton={
                          <Button dense onClick={this.handleNext} disabled={this.state.pageIndex === this.getMax()}>
                            Next
                            <KeyboardArrowRight />
                          </Button>
                        }
                        backButton={
                          <Button dense onClick={this.handleBack} disabled={this.state.pageIndex === 1}>
                            <KeyboardArrowLeft />
                            Back
                          </Button>
                        }
                      />
                    </div>
                    
                  <Table>
                    <TableHead className={classes.head}>
                      <TableRow>
                        <TableCell>Event ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Start</TableCell>
                        <TableCell>End</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className={classes.body}>
                      {dataRow.map(n => {
                        return (
                          <TableRow key={this.props.name+":"+n.event_id}>
                            <TableCell>{n.event_id}</TableCell>
                            <TableCell>{n.title}</TableCell>
                            <TableCell>{moment(n.start).local().toString()}</TableCell>
                            <TableCell>{moment(n.end).local().toString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Paper>;
        } else {
            return <Paper className={classes.paper}></Paper>;
        }
        /*
        return <CollectionItem className="coll-item" key={this.props.name + "-coll"}>
                    <Pagination items={Math.round(length/this.props.perPage)} 
                                activePage={this.state.pageIndex} 
                                maxButtons={10}
                                className='pull-right'
                                onSelect={this.onSelect} />
                    <p>{(this.state.pageIndex-1)*this.props.perPage + 1}-{(this.state.pageIndex-1)*this.props.perPage+this.props.perPage} of {length}
                    </p>
                    <Table className="bordered striped">
                        <thead>
                            <tr>
                                <th data-field="event_id">event_id</th>
                                <th data-field="title">title</th>
                                <th data-field="start">start</th>
                                <th data-field="end">end</th>
                            </tr>
                        </thead>

                        <tbody>
                        {
                            dataRow.map(function(item, index){
                                return (
                                    <tr key={this.props.name+":"+item.event_id}>
                                        <td>{item.event_id}</td>
                                        <td>{item.title}</td>
                                        <td>{moment(item.start).local().toString()}</td>
                                        <td>{moment(item.end).local().toString()}</td>
                                    </tr>
                                );
                            },this)
                        }
                        </tbody>
                    </Table>                              
                </CollectionItem>
                */
    }
}

EpgDataSet.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(TableSet.styles)(EpgDataSet);
import { Component } from 'react';

export const styles = theme => ({
    paper: {
        width: '100%',
        overflowX: 'auto',
    },
    head: {
        fontSize: 18,
        color: 'black'
    },
    stepText: {
        verticalAlign: 'middle',
        marginLeft: 20,
        marginTop: 21
    },
    mobileStepper: {
        background: 'white'
    },
    body: {
        fontSize: 15
    },
    stepContainer: {
        width: 300,
        display: 'flex',
        justifyContent: 'space-between',
        float:'right'
    }
});


export class DataSet extends Component {

    data = [];

    step = 1;

    /**
     * state change depending on pageIndex value
     * @type {Object}
     */
    state = {
        pageIndex: 1,
    };

    constructor() {
        super();
        this.handleBack = this.handleBack.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.getMax = this.getMax.bind(this);
    }

    handleBack() {
        if (this.step >= 2) {
            this.step--;
            this.setState({
                pageIndex: this.step
            });
        }
    }

    getMax() {
        return Math.ceil(this.props.rows.length / this.props.perPage);
    }

    handleNext() {
        if (this.step < this.getMax()) {
            this.step++;
            this.setState({
                pageIndex: this.step
            });
        }
    }

    /**
     * Update selected page according to start date of selected item
     * 
     * @param  {Date} date start date of selected item
     * @param  {String} channel channel tab to update
     */
    updatePage(date) {

        var millis = date.getTime();
        var set = false;
        var currentDiff = false;
        var current = "";
        var dateField = this.getDateField();

        for (var i = 0; i < this.data.length; i++) {
            if (!set) {
                set = true;
                current = new Date(this.data[i][dateField]).getTime();
                currentDiff = (millis < current);
                if (current === millis) {
                    this.setPageForIndex(i);
                    break;
                }
            } else {
                current = new Date(this.data[i][dateField]).getTime();
                if ((millis < current) !== currentDiff) {
                    this.setPageForIndex(i);
                    break;
                }
            }
        }
    }

    setPageForIndex(index) {
        var res = Math.round(index / this.props.perPage);
        if (res === 0) {
            res = 1;
        }
        this.onSelect(res);
    }
}
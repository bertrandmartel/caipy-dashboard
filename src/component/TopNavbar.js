//react
import React, { Component } from 'react';

//react components
import { Navbar, NavItem, Icon, Chip } from 'react-materialize';

// jquery
import $ from 'jquery';
window.$ = window.jQuery = require('jquery');

/**
 * The navigation bar 
 */
export class TopNavbar extends Component {

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
     * refresh data (in dataset & in timeline)
     * @param  {String} type refresh type ("create" or "update")
     */
    refresh(type) {
        if (typeof this.props.onRefresh === 'function') {
            this.props.onRefresh(type);
        }
    }

    render() {
        return <Navbar href={process.env.PUBLIC_URL} brand='Caipy Dashboard' className="blue darken-1" right>
                    <NavItem onClick={() => this.fit()}><Icon medium>zoom_in</Icon></NavItem>
                    <NavItem onClick={() => this.stackToggle()}><Icon medium>clear_all</Icon></NavItem>
                    <NavItem onClick={() => this.removeProgram()}><Icon medium>content_cut</Icon></NavItem>
                    <NavItem onClick={() => this.urlSettings()}><Chip close={false}>{this.props.mode} mode</Chip></NavItem> 
                    <NavItem onClick={() => this.globalSettings()}><Icon medium>settings</Icon></NavItem>
                    <NavItem onClick={() => this.refresh("update")}><Icon>refresh</Icon></NavItem>
                    <NavItem href="https://github.com/bertrandmartel/caipy-dashboard" target="_blank" ><Icon>code</Icon></NavItem>
                </Navbar>
    }
}
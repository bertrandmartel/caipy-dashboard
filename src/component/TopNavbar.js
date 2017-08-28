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
     * Open URL settings modal
     */
    urlSettings() {
        $('#url-settings').modal('open');
    }
    
    /**
     * Open Global settings modal
     */
    globalSettings() {
        $('#global-settings').modal('open');
    }

    /**
     * Share this page
     */
    share(){
        if (typeof this.props.onShare === 'function') {
            this.props.onShare();
        }
    }

    render() {
        return <Navbar href={process.env.PUBLIC_URL} brand={'Caipy Dashboard v' + process.env.REACT_APP_VERSION} className="blue darken-1" right>
                    <NavItem onClick={() => this.globalSettings()}><Icon medium>settings</Icon></NavItem>
                    <NavItem onClick={() => this.share()}><Icon>share</Icon></NavItem> 
                    <NavItem onClick={() => this.urlSettings()}><Chip close={false}>{this.props.mode} mode</Chip></NavItem> 
                    <NavItem href="https://github.com/bertrandmartel/caipy-dashboard" target="_blank" ><Icon>code</Icon></NavItem>
                </Navbar>
    }
}
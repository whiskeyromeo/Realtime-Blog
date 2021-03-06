import React, { Component } from 'react';
import { subscribeToConnection } from '../../api/api';

class Connection extends Component {

    constructor(props) {
        super(props);
        this.state = {
            connection: 'connecting'
        };
    }

    componentWillMount() {
        subscribeToConnection(({
            state: connection,
            port
        }) => {
            this.setState({
                connection,
                port
            });
        });
    }

    render() {
        let content = null;
        if (this.state.connection === 'disconnected') {
            content = (
                <div className="connection-error">
                    <p>There was a problem with the connection...</p>
                </div>
            );
        }
        if (this.state.connection === 'connect_error') {
            content = (
                <div className="connection-error">
                    <p>Could not connect...</p>
                </div>
            );
        }
        if (this.state.connection === 'connecting') {
            content = (
                <div>
                    <p>Connecting...</p>
                </div>
            );
        }
        if (this.state.connection === 'connected') {
            content = (
                <div><p>Connected</p></div>
            );
        }

        return (
            <div className="connect">
                <p>Socket port: {this.state.port}</p>
                {content}
            </div>
        );
    }
}

export default Connection;

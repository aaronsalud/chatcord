import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import socketIOClient from "socket.io-client";
import { leaveRoom, setChannel } from '../actions';

const Chatroom = ({ channel, users, match, leaveRoom, setChannel }) => {

    const socketRef = useRef();
    const [messages, setMessages] = useState([]);
    const SOCKET_SERVER_URL = 'http://localhost:5000';
    const user = 'user1';

    useEffect(() => {
        if (!channel) {
            const { name } = match.params;
            setChannel(name);
        } else if(!socketRef.current){
            // Connect to socket
            socketRef.current = socketIOClient(SOCKET_SERVER_URL);
            socketRef.current.emit('joinRoom', { username: user, room: channel });

            //Listeners
            socketRef.current.on('message', (message) => {
                setMessages([...messages, message]);
            });
        }
    }, [match, setChannel, channel, messages]);


    const renderMessages = () => {
        return messages.map((message, index) => {
            return (
                <div className="message" key={index}>
                    <p className="meta">{message.username} <span>{message.time}</span></p>
                    <p className="text">{message.text}</p>
                </div>
            );
        });
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h1><i className="fas fa-smile"></i> ChatCord</h1>
                <button onClick={leaveRoom} className="btn">Leave Room</button>
            </header>
            <main className="chat-main">
                <div className="chat-sidebar">
                    <h3><i className="fas fa-comments"></i> Channel Name:</h3>
                    <h2 id="room-name">{channel}</h2>
                    <h3><i className="fas fa-users"></i> Users</h3>
                    <ul id="users">{users.map((user, index) => <li key={index}>{user}</li>)}</ul>
                </div>
                <div className="chat-messages">
                    {renderMessages()}
                </div>
            </main>
            <div className="chat-form-container">
                <form id="chat-form">
                    <input
                        id="msg"
                        type="text"
                        placeholder="Enter Message"
                        required
                        autoComplete="off"
                    />
                    <button className="btn"><i className="fas fa-paper-plane"></i> Send</button>
                </form>
            </div>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        channel: state.chat.channel,
        users: state.chat.users
    }
};

export default connect(mapStateToProps, { leaveRoom, setChannel })(Chatroom);
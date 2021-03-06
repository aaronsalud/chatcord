import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import socketIOClient from "socket.io-client";
import { leaveRoom, setChannel, setMessages, setChatroomUsers } from '../actions';
import { SEND_MESSAGE, JOIN_CHANNEL, CHATROOM_USERS_UPDATED, NEW_MESSAGE } from '../utils/socketEventTypes';

let socketConnection;
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_ENDPOINT;

const Chatroom = ({ channel, messages, username, users, match, leaveRoom, setChannel, setMessages, setChatroomUsers }) => {

    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!channel) {
            const { name } = match.params;
            setChannel(name);
        } else if (!socketConnection) {
            // Connect to socket
            socketConnection = socketIOClient(SOCKET_SERVER_URL);
            socketConnection.emit(JOIN_CHANNEL, { username, channel });

            //Listeners
            socketConnection.on(NEW_MESSAGE, (message) => setMessages(message));
            socketConnection.on(CHATROOM_USERS_UPDATED, (users) => setChatroomUsers(users));
        }
    }, [match, setChannel, channel, setMessages, username, setChatroomUsers]);

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

    const sendMessage = (e) => {
        e.preventDefault();
        socketConnection.emit(SEND_MESSAGE, message);
        setMessage("");
    };

    const onLeaveRoom = () => {
        socketConnection.close();
        socketConnection = null;
        leaveRoom();
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h1><i className="fas fa-smile"></i> ChatCord</h1>
                <button onClick={onLeaveRoom} className="btn">Leave Room</button>
            </header>
            <main className="chat-main">
                <div className="chat-sidebar">
                    <h3><i className="fas fa-comments"></i> Channel Name:</h3>
                    <h2 id="room-name">{channel}</h2>
                    <h3><i className="fas fa-users"></i> Users</h3>
                    <ul id="users">{users.map((user, index) => <li key={index}>{user.username}</li>)}</ul>
                </div>
                <div className="chat-messages">
                    {renderMessages()}
                </div>
            </main>
            <div className="chat-form-container">
                <form id="chat-form" onSubmit={sendMessage}>
                    <input id="msg" type="text" placeholder="Enter Message" value={message} onChange={(e) => setMessage(e.target.value)} required autoComplete="off" />
                    <button className="btn" type="submit"><i className="fas fa-paper-plane"></i> Send</button>
                </form>
            </div>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        username: state.user.username || 'testUser',
        channel: state.chat.channel,
        users: state.chat.users,
        messages: state.chat.messages
    }
};

export default connect(mapStateToProps, { leaveRoom, setChannel, setMessages, setChatroomUsers })(Chatroom);
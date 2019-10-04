/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
//'use strict';
//
//import React, {
//    Component
//} from 'react';
//
//import {
//    Platform,
//    WebView,
//    Modal,
//    View
//} from 'react-native';
//
//import CreantsReactAPI from './CreantsReactAPI';
//import CreantsLoginController from './CreantsLoginController';
//
//export default class CreantsReactLoginView extends React.Component {
//        webview = null
//        loginConroller = null
//
//        constructor(props) {
//            super(props);
//
//            this.messageQueue = [];
//            this.loginConroller = new CreantsLoginController(CreantsReactAPI,function(str){
//                if (this.webview) {
//                    this.webview.postMessage(str);
//                }
//            },props.callback);
//
//        }
//
//        onMessage = e => {
//            var self = this;
//            if (e.nativeEvent.data) {
//                var obj = JSON.parse(e.nativeEvent.data);
//                this.loginConroller.catchMessageFromWebViewToNative(obj);
//            }
//        }
//
//        componentDidMount() {
//            console.log("cc componentDidMount");
//            this.loginConroller.checkCurrentToken();
//        }
//
//        componentWillUnmount() {
//            console.log("cc componentWillUnmount");
//        }
//
//        render() {
//            return ( <
//                WebView ref = {
//                    webview => {
//                        this.webview = webview;
//                    }
//                }
//                source = {
//                    require('../index.html')
//                }
//                onMessage = {
//                    this.onMessage
//                } >
//                <
//                /WebView> );
//            }
//
//        };

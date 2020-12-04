/**
 * Created by long.nguyen on 6/5/2017.
 */
bb.pluginBox = (function () {
    var plugin = {};
    var fb_init = false;
    var admob = {};
    var facebook = {};
    var unityAds = {};
    facebook.init = function (permisions, isPublishAction) {
        cc.log("BBSDKBOX Init facebook login");
        fb_init = true;
        permisions = permisions || ["public_profile", "email"];
        if (cc.sys.isNative && sdkbox && sdkbox.PluginFacebook) {
            cc.log("Facebook login");
            sdkbox.PluginFacebook.init();
            sdkbox.PluginFacebook.setListener({
                onLogin: function (isLogin, msg) {
                    cc.log("onLogin" + isLogin + ", " + msg);
                    if (isLogin) {
                        var accessToken = sdkbox.PluginFacebook.getAccessToken();
                        cc.log("[Listener]Access Token: " + accessToken);
                        facebook.loginCallback && facebook.loginCallback(accessToken);
                        facebook.loginCallback = null;
                    } else {

                        facebook.loginCallback && facebook.loginCallback(null);
                        facebook.loginCallback = null;
                    }
                },
                onAPI: function (tag, data) {
                },
                onSharedSuccess: function (data) {
                },
                onSharedFailed: function (data) {
                },
                onSharedCancel: function () {
                },
                onPermission: function (isLogin, msg) {
                },
                onFetchFriends: function (ok, msg) {
                }
            });

        } else {
            facebook._permisions = permisions
        }
    };

    facebook.logIn = function (callback) {
        cc.log("BBSDKBOX facebook.login");
        if (cc.sys.isNative && sdkbox) {
            facebook.loginCallback = callback;
            !fb_init && facebook.init();
            if (sdkbox.PluginFacebook.isLoggedIn()) {
                var accessToken = sdkbox.PluginFacebook.getAccessToken();
                cc.log("[isLoggedIn]Access Token: " + accessToken);
                facebook.loginCallback && facebook.loginCallback(accessToken);
                facebook.loginCallback = null;
            } else {
                sdkbox.PluginFacebook.login();
            }
        } else {
            !fb_init && facebook.init();
            var _processLoginResponse = function (response) {
                if (response.status === 'connected') {
                    var authResponse = response.authResponse;
                    var accessToken = authResponse.accessToken;
                    return accessToken;
                }
                return null;
            };
            FB.getLoginStatus(function (response) {
                var accessToken = _processLoginResponse(response);
                if (!accessToken) {
                    FB.login(function (response) {
                        accessToken = _processLoginResponse(response);
                        if (accessToken) {
                            callback && callback(accessToken);
                        } else {
                            callback && callback(null);
                        }
                    }, {scope: facebook._permisions});
                } else {
                    callback && callback(accessToken);
                }
            });
        }
    };

    facebook.logOut = function () {
        if (cc.sys.isNative && sdkbox && sdkbox.PluginFacebook) {
            sdkbox.PluginFacebook.logout();
        } else if (FB && FB.logout) {
            FB.logout(function (response) {
                // user is now logged out
            });
        }
    };

    admob.init = function () {
        cc.log("BBSDKBOX admod.init 1");
        var skip = true;
        if (!skip && cc.sys.isNative && !admob._isInit) {
            if ("undefined" != typeof (sdkbox.PluginAdMob)) {
                admob._isInit = true;
                var plugin = sdkbox.PluginAdMob;
                plugin.setListener({
                    adViewDidReceiveAd: function (name) {
                        cc.log('adViewDidReceiveAd name=' + name);
                        plugin.cache(name);
                    },
                    adViewDidFailToReceiveAdWithError: function (name, msg) {
                        cc.log('adViewDidFailToReceiveAdWithError name=' + name + ' msg=' + msg);
                    },
                    adViewWillPresentScreen: function (name) {
                        cc.log('adViewWillPresentScreen name=' + name);
                    },
                    adViewDidDismissScreen: function (name) {
                        cc.log('adViewDidDismissScreen name=' + name);
                        plugin.cache(name);
                    },
                    adViewWillDismissScreen: function (name) {
                        cc.log('adViewWillDismissScreen=' + name);
                    },
                    adViewWillLeaveApplication: function (name) {
                        cc.log('adViewWillLeaveApplication=' + name);
                    },
                    reward: function (name, currency, amount) {
                        cc.log('reward=' + name + ' ' + currency + ' ' + amount);
                        admob._showCb && (admob._showCb(name, currency, amount));
                        admob._showCb = null;
                    }
                });
                plugin.init();

            } else {
                cc.log("no plugin init");
            }
        }
    };
    admob.cache = function () {
        cc.log("******** admob cache *******");
        if (cc.sys.isNative) {
            if (sdkbox && sdkbox.PluginAdMob) {
                sdkbox.PluginAdMob.cache('MU-Reward-Ads');
                sdkbox.PluginAdMob.cache('Mu-Interstitial');
            }
        }
    };
    admob.showVideo = function (cb) {
        cc.log("******** admob showVideo *******");
        if (cc.sys.isNative) {
            admob.init();
            if (sdkbox && sdkbox.PluginAdMob) {
                admob._showCb = cb;
                sdkbox.PluginAdMob.show('MU-Reward-Ads');
            }
        }
    };
    admob.isAvailable = function () {
        cc.log("******** admob isAvailable *******");
        if (cc.sys.isNative) {
            admob.init();
            var skip = true;
            if (!skip && sdkbox.PluginAdMob) {
                return sdkbox.PluginAdMob.isAvailable('MU-Reward-Ads');
            }
        }
        return false;
    };

    unityAds.init = function () {
        cc.log("BBSDKBOX unityAds.init");
        if (cc.sys.isNative && !unityAds._isInit) {
            var skip = true;
            if (!skip && sdkbox.PluginUnityAds) {
                unityAds._isInit = true;
                sdkbox.PluginUnityAds.setListener({
                    unityAdsDidClick: function (placementId) {
                        cc.log('unityAdsDidClick ' + placementId);
                    },
                    unityAdsPlacementStateChanged: function (placementId, oldState, newState) {
                        cc.log('unityAdsPlacementStateChanged:' + placementId + ' oldState:' + oldState + " newState:" + newState);
                    },
                    unityAdsReady: function (placementId) {
                        cc.log('unityAdsReady ' + placementId);
                    },
                    unityAdsDidError: function (error, message) {
                        cc.log('unityAdsDidError:' + error + ' message:' + message);
                    },
                    unityAdsDidStart: function (placementId) {
                        cc.log('unityAdsDidStart=' + placementId);
                    },
                    unityAdsDidFinish: function (placementId, state) {
                        cc.log('unityAdsDidFinish ' + placementId + ' state:' + state);
                        unityAds._showCb && (unityAds._showCb(placementId, state));
                        unityAds._showCb = null;
                    }
                });
                sdkbox.PluginUnityAds.init();
            }
        }
    };
    var placementId = '';
    unityAds.showVideo = function (cb) {
        if (cc.sys.isNative) {
            unityAds.init();
            var skip = true;
            if (!skip && sdkbox.PluginUnityAds) {
                if (sdkbox.PluginUnityAds.isReady(placementId)) {
                    unityAds._showCb = cb;
                    sdkbox.PluginUnityAds.show(placementId);
                } else {
                    cc.log('unityads is not ready');
                }
            }
        }
    };
    unityAds.isAvailable = function () {
        if (cc.sys.isNative) {
            unityAds.init();
            var skip = true;
            if (!skip && sdkbox.PluginUnityAds) {
                return sdkbox.PluginUnityAds.isReady(placementId);
            }
        }
        return false;
    };

    plugin.facebook = facebook;
    plugin.ads = {
        init: function () {
            admob.init();
            unityAds.init();
        },
        cache: function () {
            admob.cache();
        },
        isAvailable: function () {
            //var isAvailable = admob.isAvailable();
            //if( !isAvailable ){
            //    isAvailable = unityAds.isAvailable();
            //}
            //return isAvailable;
            return false;
        },
        showVideo: function (cb) {
            //var isAvailable = admob.isAvailable();
            //if (isAvailable) {
            //    admob.showVideo(cb);
            //}
            //if( !isAvailable ){
            //    isAvailable = unityAds.isAvailable();
            //    if( isAvailable ){
            //        unityAds.showVideo(cb);
            //    }
            //}
        }
    };

    plugin.iap = {
        _getCb: null,
        _restoreCb: null,
        _purchaseCb: null,
        init: function () {
            cc.log("BBSDKBOX plugin.iap");
            if (cc.sys.isNative  && sdkbox.IAP) {
                sdkbox.IAP.init();
                //sdkbox.IAP.enableUserSideVerification(true);
                sdkbox.IAP.setDebug(true);
                sdkbox.IAP.setListener({
                    onSuccess: function (product) {
                        //Purchase success
                        cc.log("Purchase successful: " + product.name);
                        plugin.iap._purchaseCb && plugin.iap._purchaseCb(null, product);
                    },
                    onFailure: function (product, msg) {
                        //Purchase failed
                        //msg is the error message
                        cc.log("Purchase failed: " + product.name + " error: " + msg);
                        plugin.iap._purchaseCb && plugin.iap._purchaseCb(msg, product);
                    },
                    onCanceled: function (product) {
                        //Purchase was canceled by user
                        cc.log("Purchase canceled: " + product.name);
                        plugin.iap._purchaseCb && plugin.iap._purchaseCb(null, null);
                    },
                    onRestored: function (product) {
                        //Purchase restored
                        cc.log("Restored: " + product.name);
                        plugin.iap._restoreCb && plugin.iap._restoreCb(product);
                    },
                    onProductRequestSuccess: function (products) {
                        cc.log("RequestSuccess: " + products.length);
                        plugin.iap._getCb && plugin.iap._getCb(null, products);
                        if (bb.framework.isAndroid()) {
                            sdkbox.IAP.restore();
                            cc.log("SDKBOX IAP RESTORE: ");
                        }
                    },
                    onProductRequestFailure: function (msg) {
                        //When product refresh request fails.
                        cc.log("Failed to get products");
                        plugin.iap._getCb && plugin.iap._getCb(msg, null);
                    },
                    onShouldAddStorePayment: function (productId) {
                        cc.log("onShouldAddStorePayment:" + productId);
                        return true;
                    },
                    onFetchStorePromotionOrder: function (productIds, error) {
                        cc.log("onFetchStorePromotionOrder:" + " " + " e:" + error);
                    },
                    onFetchStorePromotionVisibility: function (productId, visibility, error) {
                        cc.log("onFetchStorePromotionVisibility:" + productId + " v:" + visibility + " e:" + error);
                    },
                    onUpdateStorePromotionOrder: function (error) {
                        cc.log("onUpdateStorePromotionOrder:" + error);
                    },
                    onUpdateStorePromotionVisibility: function (error) {
                        cc.log("onUpdateStorePromotionVisibility:" + error);
                    }
                });
            }
        },

        restore: function (cb) {
            plugin.iap._restoreCb = cb;
            sdkbox.IAP.restore();
        },

        purchase: function (id, cb) {
            plugin.iap._purchaseCb = cb;
            sdkbox.IAP.purchase(id);
        },

        getItems: function (cb) {
            plugin.iap._getCb = cb;
            if (cc.sys.isNative) {
                sdkbox.IAP.refresh();
            } else {
                plugin.iap._getCb && plugin.iap._getCb("", null);
            }
        }
    };
    plugin.play = {};
    plugin.play._loginCb = null;
    plugin.play.init = function () {
        var skip = true;
        if (!skip && cc.sys.isNative ) {
            if ("undefined" != typeof (sdkbox.PluginSdkboxPlay)) {
                var sdkboxPlay = sdkbox.PluginSdkboxPlay
                sdkboxPlay.setListener({
                    onConnectionStatusChanged: function (connection_status) {
                        cc.log("connection status change: " + connection_status + " connection_status");
                        if (connection_status == 1000) {
                            cc.log('Player id: ' + sdkboxPlay.getPlayerId());
                            cc.log('Player name: ' + sdkboxPlay.getPlayerAccountField("name"));
                            cc.log("connection status: " + connection_status + " " + sdkboxPlay.getPlayerId() + " " + sdkboxPlay.getPlayerAccountField("name") + "(" + sdkboxPlay.getPlayerAccountField("display_name") + ")");
                            plugin.play._loginCb && plugin.play._loginCb(sdkboxPlay.getPlayerId());
                        } else {
                            cc.log("Not connected. Status: " + connection_status);
                            plugin.play._loginCb && plugin.play._loginCb(null);
                        }
                    },
                    onScoreSubmitted: function (leaderboard_name, score, maxScoreAllTime, maxScoreWeek, maxScoreToday) {
                        cc.log('onScoreSubmitted trigger leaderboard_name:' + leaderboard_name + ' score:' + score + ' maxScoreAllTime:' + maxScoreAllTime + ' maxScoreWeek:' + maxScoreWeek + ' maxScoreToday:' + maxScoreToday);
                    },
                    onMyScore: function (leaderboard_name, time_span, collection_type, score) {
                        cc.log('onMyScore trigger leaderboard_name:' + leaderboard_name + ' time_span:' + time_span + ' collection_type:' + collection_type + ' score:' + score);
                    },
                    onMyScoreError: function (leaderboard_name, time_span, collection_type, error_code, error_description) {
                        cc.log('onMyScoreError trigger leaderboard_name:' + leaderboard_name + ' time_span:' + time_span + ' collection_type:' + collection_type + ' error_code:' + error_code + ' error_description:' + error_description);
                    },
                    onPlayerCenteredScores: function (leaderboard_name, time_span, collection_type, json_with_score_entries) {
                        cc.log('onPlayerCenteredScores trigger leaderboard_name:' + leaderboard_name + ' time_span:' + time_span + ' collection_type:' + collection_type + ' json_with_score_entries:' + json_with_score_entries);
                    },
                    onPlayerCenteredScoresError: function (leaderboard_name, time_span, collection_type, error_code, error_description) {
                        cc.log('onPlayerCenteredScoresError trigger leaderboard_name:' + leaderboard_name + ' time_span:' + time_span + ' collection_type:' + collection_type + ' error_code:' + error_code + ' error_description:' + error_description);
                    },
                    onIncrementalAchievementUnlocked: function (achievement_name) {
                        cc.log("incremental achievement " + achievement_name + " unlocked.");
                    },
                    onIncrementalAchievementStep: function (achievement_name, step) {
                        cc.log("incremental achievent " + achievement_name + " step: " + step);
                    },
                    onIncrementalAchievementStepError: function (name, steps, error_code, error_description) {
                        cc.log('onIncrementalAchievementStepError trigger leaderboard_name:' + name + ' steps:' + steps + ' error_code:' + error_code + ' error_description:' + error_description);
                    },
                    onAchievementUnlocked: function (achievement_name, newlyUnlocked) {
                        cc.log('onAchievementUnlocked trigger achievement_name:' + achievement_name + ' newlyUnlocked:' + newlyUnlocked);
                    },
                    onAchievementUnlockError: function (achievement_name, error_code, error_description) {
                        cc.log('onAchievementUnlockError trigger achievement_name:' + achievement_name + ' error_code:' + error_code + ' error_description:' + error_description);
                    },
                    onAchievementsLoaded: function (reload_forced, json_achievements_info) {
                        cc.log('onAchievementsLoaded trigger reload_forced:' + reload_forced + ' json_achievements_info:' + json_achievements_info);
                    },
                    onSetSteps: function (name, steps) {
                        cc.log('onSetSteps trigger name:' + name + ' steps:' + steps);
                    },
                    onSetStepsError: function (name, steps, error_code, error_description) {
                        cc.log('onSetStepsError trigger name:' + name + ' steps:' + steps + ' error_code:' + error_code + ' error_description:' + error_description);
                    },
                    onReveal: function (name) {
                        cc.log('onReveal trigger name:' + name);
                    },
                    onRevealError: function (name, error_code, error_description) {
                        cc.log('onRevealError trigger name:' + name + ' error_code:' + error_code + ' error_description:' + error_description);
                    },
                    onGameData: function (action, name, data, error) {
                        if (error) {
                            // failed
                            cc.log('onGameData failed:' + error);
                        } else {
                            //success
                            if ('load' == action) {
                                cc.log('onGameData load:' + name + ':' + data);
                            } else if ('save' == action) {
                                cc.log('onGameData save:' + name + ':' + data);
                            } else {
                                cc.log('onGameData unknown action:' + action);
                            }
                        }
                    }
                });
                sdkboxPlay.init();
            }
        }
    };
    plugin.play.signIn = function (cb) {
        plugin.play._loginCb = cb;
        if (!sdkbox.PluginSdkboxPlay.isSignedIn()) {
            sdkbox.PluginSdkboxPlay.signin();
        }
    };
    plugin.play.signOut = function (cb) {
        if (sdkbox && sdkbox.PluginSdkboxPlay.isSignedIn()) {
            sdkbox.PluginSdkboxPlay.signout();
        }
    };
    plugin.review = {
        init: function () {
            if (bb.framework.isIos()) {
                cc.sys.isNative && sdkbox.PluginReview && sdkbox.PluginReview.init();
            } else {
                cc.log("initReview in Activity");
            }
        },

        rateGame: function () {
            if (bb.framework.isIos()) {
                //cc.sys.isNative && jsb.reflection.callStaticMethod("AppController", "rateGame");
                cc.sys.openURL(cc.formatStr("itms-apps://itunes.apple.com/app/id%s?action=write-review", ""));
            } else {
                //cc.sys.isNative && jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "rateGame", "()Ljava/lang/String;");
                cc.sys.openURL("https://play.google.com/store/apps/details?id=com.rpgwikigames.darknessrising");
            }
        }
    };
    plugin.analytics = {
        init: function () {
            cc.sys.isNative && sdkbox.PluginGoogleAnalytics && sdkbox.PluginGoogleAnalytics.init();
        },
        logEvent: function () {
            cc.sys.isNative && sdkbox.PluginGoogleAnalytics && sdkbox.PluginGoogleAnalytics.logEvent("Test", "Click", "", 1);
        }
    };
    return plugin;
}());

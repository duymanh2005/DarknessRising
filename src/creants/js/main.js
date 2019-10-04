/**
 * Created by longnguyen on 12/23/2016.
 *
 */

$(function () {

    $.ajax({
        type: 'GET',
        url: 'config.json',
        dataType: 'json',
        success: function (json) {
            creants_api.setConfig(json)
        },
        data: {},
        async: false
    });

    creants_api.BACKGROUND_COLOR && ($('body').css("background-color",creants_api.BACKGROUND_COLOR));

    $('#form_login')
        .bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                login_user: {
                    validators: {
                        notEmpty: {
                            message: 'Please enter user name'
                        },
                        stringLength: {
                            min: 6,
                            max: 20,
                            message: 'Please enter at least 6 characters and no more than 20'
                        }
                    }
                },
                login_password: {
                    validators: {
                        notEmpty: {
                            message: 'Please enter password'
                        },
                        stringLength: {
                            min: 6,
                            max: 20,
                            message: 'Please enter at least 6 characters and no more than 20'
                        }
                    }
                }
            }
        })
        .on('success.form.bv', function (e, data) {
            e.preventDefault();
            var name = $("#input_user_login").val();
            var pass = $("#input_password_login").val();
            $("#form_login").data('bootstrapValidator').resetForm();
            _showLoadingDialog();
            $("#input_password_login").val("");
            _fireEventToPlatform(creants_api.event.LOGIN_CREANTS_CLICK, {
                username: name,
                password: pass
            });
        });

    $('#getpassword_form')
        .bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                getpassword: {
                    validators: {
                        notEmpty: {
                            message: 'Please supply your email address'
                        },
                        emailAddress: {
                            message: 'Please supply a valid email address'
                        }
                    }
                }

            }
        })
        .on('success.form.bv', function (e, data) {
            event.preventDefault();
            $("#getpassword_form").data('bootstrapValidator').resetForm();
            var mail = $("#input_mail_getpassword").val();
            _showLoadingDialog();
            $.ajax({
                url: creants_api.getRecoveryPasswordRest(),
                type: "post",
                data: {
                    email: mail,
                    app_id: creants_api.APP_ID
                },
                success: function (result) {
                    console.log(result);
                    if (creants_api.isFailCode(result.code)) {
                        _showInfo(false, result.msg);
                    } else {
                        _showInfo(true, result.msg);
                        $('#tab_container a[href="#confirm-code"]').tab('show');
                    }
                    $("#input_mail_getpassword").val("");
                },
                error: function (result) {
                    $("#input_mail_getpassword").val("");
                    _showInfo(false);
                    console.log(result);
                }
            });
        });

    $('#confirmcode_form')
        .bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                confirmcode: {
                    validators: {
                        notEmpty: {
                            message: 'Please enter confirm code received from your email.'
                        }
                    }
                }
            }
        })
        .on('success.form.bv', function (e, data) {
            e.preventDefault();
            $("#confirmcode_form").data('bootstrapValidator').resetForm();
            _showLoadingDialog();
            $("#input_confirm_code").val("");
            $.ajax({
                url: creants_api.getVerifyValidationGenerateCodeRest(),
                type: "post",
                data: {
                    verify_code: code
                },
                success: function (result) {
                    console.log(result);
                    if (creants_api.isFailCode(result.code)) {
                        _showInfo(false, result.msg);
                    } else {
                        _showInfo(true, result.msg);
                        $('#tab_container a[href="#recover"]').tab('show');
                        creants_api.confirmRecoveryPasswordCode = code;
                    }
                },
                error: function (result) {
                    _showInfo(false);
                    console.log(result);
                }
            });
        });

    $('#recovery_form')
        .bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                recovery_password: {
                    validators: {
                        notEmpty: {
                            message: 'Please enter recovery password'
                        },
                        identical: {
                            field: 'recovery_cpassword',
                            message: 'Confirm your password below - type same password please'
                        }
                    }
                },
                recovery_cpassword: {
                    validators: {
                        notEmpty: {
                            message: 'Please confirm your recovery password'
                        },
                        identical: {
                            field: 'recovery_password',
                            message: 'The password and its confirm are not the same'
                        }
                    }
                }
            }
        })
        .on('success.form.bv', function (e, data) {
            e.preventDefault();
            $("#recovery_form").data('bootstrapValidator').resetForm();
            _showLoadingDialog();
            var pass = $("#input_password_recover").val();
            $("#input_password_recover").val("");
            $("#input_cpassword_recover").val("");
            $.ajax({
                url: creants_api.getResetPasswordRest(),
                type: "post",
                data: {
                    verify_code: creants_api.confirmRecoveryPasswordCode,
                    password: pass
                },
                success: function (result) {
                    console.log(result);
                    if (creants_api.isFailCode(result.code)) {
                        _showInfo(false, result.msg);
                    } else {
                        var token = result.token;
                        _showInfo(true, result.msg);
                        $('#tab_container a[href="#login"]').tab('show');
                        creants_api.confirmRecoveryPasswordCode = null;
                    }
                },
                error: function (result) {
                    _showInfo(false);
                    console.log(result);
                }
            });
        });

    $('#form_register')
        .bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                register_username: {
                    validators: {
                        notEmpty: {
                            message: 'Please enter user name'
                        },
                        stringLength: {
                            min: 6,
                            max: 20,
                            message: 'Please enter at least 6 characters and no more than 20'
                        }
                    }
                },
                register_password: {
                    validators: {
                        notEmpty: {
                            message: 'Please enter password'
                        },
                        identical: {
                            field: 'register_cpassword',
                            message: 'Confirm your password below - type same password please'
                        }
                    }
                },
                register_cpassword: {
                    validators: {
                        notEmpty: {
                            message: 'Please confirm your password'
                        },
                        identical: {
                            field: 'register_password',
                            message: 'The password and its confirm are not the same'
                        }
                    }
                },
                register_email: {
                    validators: {
                        notEmpty: {
                            message: 'Please supply your email address'
                        },
                        emailAddress: {
                            message: 'Please supply a valid email address'
                        }
                    }
                }
            }
        })
        .on('success.form.bv', function (e, data) {
            event.preventDefault();
            var pass = $("#input_password_register").val();
            var name = $("#input_user_register").val();
            var email = $("#input_email_register").val();

            _showLoadingDialog();
            $("#form_register").data('bootstrapValidator').resetForm();
            $("#input_password_register").val("");
            $("#input_cpassword_register").val("");
            $.ajax({
                url: creants_api.getSignUpREST(),
                type: "post",
                data: {
                    username: name,
                    password: pass,
                    email: email,
                    app_id: creants_api.APP_ID
                },
                success: function (result) {
                    console.log("****************** dang ky *********")
                    console.log(result);
                    if (creants_api.isFailCode(result.code)) {
                        _showInfo(false, result.msg);
                    } else {
                        $("#input_user_login").val(name);
                        $("#input_password_login").val(pass);
                        $('#tab_container a[href="#login"]').tab('show');
                        _showInfo(true, result.msg);
                    }
                },
                error: function (result) {
                    console.log(result);
                    _showInfo(false);
                }
            });
        });

    var _fireEventToPlatform = function (event, data) {
        if (creants_api.isCocosPlatform()) {
            localStorage.setItem("message_received_from_login_webview",JSON.stringify({
                event: event,
                data: data
            }));
            //window.location.href = "cocos2dx:" + JSON.stringify({
            //    event: event,
            //    data: data
            //});
        } else if (creants_api.isReactNativePlatform()) {
            window.postMessage(JSON.stringify({
                event: event,
                data: data
            }));
        }
        else if (creants_api.isWebPlatform()) {
            _testAPIWithajax(event, data);
        }
    };

    var _showLoginSuccess = function (result,fadeNow) {
        _closeLoadingDialog();
        creants_api._setLoginSession(result);
        $("#user_avatar_logout").attr('src', creants_api.getUserAvatarURL());
        $("#user_name_logout").html(creants_api.getUserFullName());
        _tooglePanel($("#panel_login"), $("#panel_logout"),fadeNow);
    };

    var _showLoadingDialog = function () {
        if (!$("#div_ok").hasClass("hidden")) {
            $("#div_ok").addClass("hidden");
        }
        if (!$("#div_fail").hasClass("hidden")) {
            $("#div_fail").addClass("hidden");
        }
        if ($("#div_loading").hasClass("hidden")) {
            $("#div_loading").removeClass("hidden");
        }
        $('#modal_info').modal('hide');
        $("#modal_loading").modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
    };

    var _showInfo = function (success, info) {
        if (!$("#div_loading").hasClass("hidden")) {
            $("#div_loading").addClass("hidden");
        }
        if (!$("#div_ok").hasClass("hidden")) {
            $("#div_ok").addClass("hidden");
        }
        if (!$("#div_fail").hasClass("hidden")) {
            $("#div_fail").addClass("hidden");
        }
        if (success) {
            info && $("#lbl_ok").html(info);
            if ($("#div_ok").hasClass("hidden")) {
                $("#div_ok").removeClass("hidden");
            }
        } else {
            info && $("#lbl_fail").html(info);
            if ($("#div_fail").hasClass("hidden")) {
                $("#div_fail").removeClass("hidden");
            }
        }
        $('#modal_loading').modal('hide');
        $('#modal_info').modal({
            show: true
        });
    };

    var _tooglePanel = function (panel1, panel2,isNow) {
        panel1.fadeToggle(isNow ? 0.00 : "slow", "linear", function () {
            panel2.fadeToggle(isNow ? 0.00 : "slow", "linear");
        });
    };

    var _closeLoadingDialog = function () {
        $('#modal_loading').modal('hide');
    };

    $("#btn_facebook").click(function (event) {
        event.preventDefault();
        _showLoadingDialog();
        _fireEventToPlatform(creants_api.event.LOGIN_FB_CLICK, {});
    });

    $("#btn_facebook2").click(function (event) {
        event.preventDefault();
        _showLoadingDialog();
        _fireEventToPlatform(creants_api.event.LOGIN_FB_CLICK, {});
    });

    $("#btn_playnow").click(function (event) {
        event.preventDefault();
        _showLoadingDialog();
        _fireEventToPlatform(creants_api.event.LOGIN_BY_GUEST_CLICK, {});
    });

    var preLoginName = null;
    $("#btn_logout").click(function () {
        preLoginName = creants_api.getUserFullName();
        _showLoadingDialog();
        _fireEventToPlatform(creants_api.event.LOGOUT, {
            token: creants_api.getCurrentToken()
        });
    });

    $("#a_language").click(function () {
        if ($("#icon_flag").hasClass("flag-vn")) {
            $("#icon_flag").removeClass("flag-vn");
            $("#icon_flag").addClass("flag-gb");
            $("#a_language").html("Tieng Anh");
        } else if ($("#icon_flag").hasClass("flag-gb")) {
            $("#icon_flag").removeClass("flag-gb");
            $("#icon_flag").addClass("flag-vn");
            $("#a_language").html("Tieng Viet");
        }
        $("#panel_login").fadeToggle("fast", "linear", function () {
            $("#panel_login").fadeToggle("fast", "linear");
        });
    });

    if (!creants_api.SUPPORT_GUEST) {
        $("#btn_facebook2").removeClass("hidden");
        $("#btn_playnow").addClass("hidden");
        $("#fb_group").addClass("hidden");
    }
    else{
        $("#btn_facebook2").addClass("hidden");
        $("#btn_playnow").removeClass("hidden");
        $("#fb_group").removeClass("hidden");
    }

    var isShowMainDialog = false;
    var _showMainDialog = function(){
        if( !isShowMainDialog ){
            isShowMainDialog = true;
            $("#main_dialog").modal({
                show: true,
                backdrop: 'static',
                keyboard: false
            });
        }
    };
    if( creants_api.isWebPlatform() ){ // this is used for testing quickly.
        _showMainDialog();
    }

    var _catchNativeEvent = function(message){
        var firstShow = !isShowMainDialog;
        if (message.event === creants_api.event.HAD_CURRENT_TOKEN) {
            var result = message.data;
            _showMainDialog();
            _showLoginSuccess(result,firstShow);
        } else if (message.event === creants_api.event.FAIL) {
            var fail = message.data;
            _showMainDialog();
            !firstShow && _showInfo(false, fail ? fail.msg : "Unknow");
        } else if (message.event === creants_api.event.LOSE_TOKEN) {
            creants_api.clearCurrentUser();
            _showMainDialog();
            _closeLoadingDialog();
            $('#tab_container a[href="#login"]').tab('show');
            _tooglePanel($("#panel_logout"), $("#panel_login"));
            if (preLoginName) {
                $("#input_user_login").val(preLoginName);
            }
        }
    };

    // listen the event of react native platform.
    document.addEventListener('message', function (e) {
        if (e) {
            var message = JSON.parse(e.data);
            _catchNativeEvent(message);
        }
    });

    //call the ajax for web platform.
    _testAPIWithajax = function (event, data) {
        console.log(event);
        console.log(data);
        var dataParam, reqUrl;
        var successFunc;

        if (creants_api.event.LOGIN_CREANTS_CLICK == event) {
            dataParam = {
                username: data.username,
                password: data.password,
                app_id: creants_api.APP_ID
            }

            reqUrl = creants_api.getSignInByCreantsREST();
            successFunc = _loginSuccess;
        } else if (creants_api.event.LOGOUT == event) {
            dataParam = {
                token: creants_api.getCurrentToken(),
                data: RC4.encrypt_data(creants_api.privateKey, "đây là data gửi lên cần được mã hóa")
            }
            reqUrl = creants_api.getSignOutREST();
            successFunc = _logoutSuccess;
        } else if (creants_api.event.LOGIN_FB_CLICK == event) {
            dataParam = {
                fb_token: "EAACEdEose0cBAK7ZCZA4dcTW8HuNsaqJ3SoaUWcAXrgZB8St0cfbBSbZA6bx4DeypC5GECy4kyDP2zkGZB340Ip3NFlIdHZAmNtRfS8OKhnGDaA7BABoISmuVWDJ7s2QRvPmo0jb8mYvdseS8OLkN05on1CO4uW0kJxEOozagaZBrFcOpAkwP0MFprBmjxhofIZD",
                app_id: creants_api.APP_ID
            }
            reqUrl = creants_api.getSignInByFbREST();
            successFunc = _loginSuccess;
        } else if (creants_api.event.LOGIN_BY_GUEST_CLICK == event) {
            dataParam = {
                device_id: "adr##EAACEh##" + creants_api.APP_ID
            }
            reqUrl = creants_api.getSignInByGuestREST();
            successFunc = _loginSuccess;
        }

        $.ajax({
            url: reqUrl,
            type: "POST",
            data: dataParam,
            success: function (result) {
                successFunc(result);
            },
            error: function (result) {
                console.log("******************* ERROR ****************")
                console.log(result);
                _showInfo(false);
            }
        });
    };

    _loginSuccess = function (result) {
        if (creants_api.isFailCode(result.code)) {
            _showInfo(false, result.msg);
        } else {
            _showLoginSuccess(result);
        }
    }

    _logoutSuccess = function (result) {
        creants_api.clearCurrentUser();
        _closeLoadingDialog();
        $('#tab_container a[href="#login"]').tab('show');
        _tooglePanel($("#panel_logout"), $("#panel_login"));
        if (preLoginName) {
            $("#input_user_login").val(preLoginName);
        }
    }

    // auto call knock knock event for native platform.
    if (!creants_api.isWebPlatform()) {
        setInterval(function () {
            _fireEventToPlatform(creants_api.event.KNOCK_KNOCK, {});

            // listen the event of cocos platform.
            if( creants_api.isCocosPlatform()){
                var msg = localStorage.getItem("message_send_from_cocos_native");
                if( msg ){
                    localStorage.removeItem("message_send_from_cocos_native");
                    _catchNativeEvent(JSON.parse(msg));
                }
            }
        }, 1500);
    }

});

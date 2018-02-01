
$("#auth").on('click', '#btn-login', function () {
    $.get('/login', function (data) {
        $("#auth").html(data);
        authjs(jQuery);
    });
});

$("#auth").on('click', "#btn-create", function () {
    $.get('/register', function (data) {
        $("#auth").html(data);
        authjs(jQuery);
    });
});

$("#auth").on('click', "#btn-anonymous", function () {
    $.get('/anonymous', function (data) {
        $("#auth").html(data);
        authjs(jQuery);
    });
});

$("#auth").on('click', "#btn-forgot", function () {
    $.get('/forgot-password', function (data) {
        $("#auth").html(data);
        authjs(jQuery);
    });
});


function authjs($) {
    "use strict";

    

    // Options for Message
    //----------------------------------------------
    var options = {
        'btn-loading': '<i class="fa fa-spinner fa-pulse"></i>',
        'btn-success': '<i class="fa fa-check"></i>',
        'btn-error': '<i class="fa fa-remove"></i>',
        'msg-success': 'All Good! Redirecting...',
    };

    $("#anonymous-form").validate({
        rules: {
            gs_username: "required",
        },
        errorClass: "form-invalid"
    });

    // Form Submission
    $("#anonymous-form").submit(function (e) {
        e.preventDefault();
        var postData = {
            gs_username: $("#gs_username").val(),
            _csrf: $('#auth :input[name="_csrf"]').attr('value'),
        };
        dummy_submit_form($(this), postData, '/anonymous');
    });

    // Login Form
    //----------------------------------------------
    // Validation
    $("#login-form").validate({
        rules: {
            lg_username: "required",
            lg_password: "required",
        },
        errorClass: "form-invalid"
    });

    // Form Submission
    $("#login-form").submit(function (e) {
        e.preventDefault();
        var postData = {
                lg_username: $("#lg_username").val(),
                lg_password: $("#lg_password").val(),
                lg_remember: $("#lg_remember").val(),
                _csrf: $('#auth :input[name="_csrf"]').attr('value'),
            };
        dummy_submit_form($(this), postData, '/login');
    });

    // Register Form
    //----------------------------------------------
    // Validation
    $("#register-form").validate({
        rules: {
            reg_username: "required",
            reg_password: {
                required: true,
                minlength: 8
            },
            reg_password_confirm: {
                required: true,
                minlength: 8,
                equalTo: "#register-form [name=reg_password]"
            },
            reg_email: {
                required: true,
                email: true
            },
            reg_agree: "required",
        },
        errorClass: "form-invalid",
        errorPlacement: function (label, element) {
            if (element.attr("type") === "checkbox" || element.attr("type") === "radio") {
                element.parent().append(label); // this would append the label after all your checkboxes/labels (so the error-label will be the last element in <div class="controls"> )
            }
            else {
                label.insertAfter(element); // standard behaviour
            }
        }
    });

    // Form Submission
    $("#register-form").submit(function (e) {
        e.preventDefault();
        var postData = {
            reg_username: $("#reg_username").val(),
            reg_password: $("#reg_password").val(),
            reg_password_confirm: $("#reg_password_confirm").val(),
            reg_email: $("#reg_email").val(),
            reg_agree: $("#reg_agree").val(),
            _csrf: $('#auth :input[name="_csrf"]').attr('value'),
        };
        dummy_submit_form($(this), postData, '/register');
    });


    // Loading
    //----------------------------------------------
    function remove_loading($form) {
        $form.find('[type=submit]').removeClass('error success');
        $form.find('.login-form-main-message').removeClass('show error success').html('');
    }

    function form_loading($form) {
        $form.find('[type=submit]').addClass('clicked').html(options['btn-loading']);
    }

    function form_success($form) {
        $form.find('[type=submit]').addClass('success').html(options['btn-success']);
        $form.find('.login-form-main-message').addClass('show success').html(options['msg-success']);
    }

    function form_failed($form, errMsg) {
        $form.find('[type=submit]').addClass('error').html(options['btn-error']);
        $form.find('.login-form-main-message').addClass('show error').html(errMsg);
    }

    // Dummy Submit Form (Remove this)
    //----------------------------------------------
    // This is just a dummy form submission. You should use your AJAX function or remove this function if you are not using AJAX.
    function dummy_submit_form($form, postData, dest) {
        if ($form.valid()) {
            remove_loading($form);
            $.ajax({
                url: dest,
                data: postData,
                type: "POST",
                dataType: "json",
                async: true,
                timeout: 5000,
                complete: function () {
                    
                },
                success: function (data, textStatus, jqXHR) {
                    if(data.err) {
                        form_failed($form, data.msg);
                    } else {
                        form_success($form);
                        setTimeout(function() {
                            window.location.href = '/';
                        }, 1000);
                    }
                },
                error: function (textStatus, jqXHR) {
                    form_failed($form, 'Error, please try again');
                }
            });
        }
    }

}


$(document).ready(function() {
    authjs(jQuery);
});
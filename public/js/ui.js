$("#ui-btn-logout").click(function() {
    var _csrf = $('input[name="_csrf"]').attr('value');
    console.log(_csrf);
    $.ajax({
        type: "POST",
        url: '/logout',
        data: {
            _csrf: _csrf,
        },
        success: function() {
            window.location.href = '/';
        }
    });
})
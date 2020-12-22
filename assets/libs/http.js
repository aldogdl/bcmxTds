export default function(method, url, success, params = null) {

  var op = {
    crossDomain : true,
    type: method, url: url,
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + $('#toS').attr('data-info'));
    },
    statusCode: {
      401: function() {
        var acc = confirm( "Reinicia sesión, tu token a caducado" );
        if(acc){
          window.location.href = $('#login').data('base');
        }
      }
    },
    success : success,
  };
  if(params != null){
    op['data'] = {'data':params}
  }

  $.ajax(op);

}

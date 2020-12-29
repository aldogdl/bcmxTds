import './../app.js'
import globals from './../globals';
import http from './../libs/http';
var global;
var lstCampoFile = {'franq':[], 'config':[]};

$(document).ready(function(){

  global = globals('getGlobals');

    _getFranquiciasActuales();
});

///
function _getFranquiciasActuales() {

  _bloquearAllScreen('containerMain', 'Buscando Franquicias...')

  http(
    'get',
    global['uriBaseFranq'] + '/get-all-franquicias/',
    function(resp){
      if(resp.length > 0){
        var lstElem = new Array();
        var plt = $.templates('#ptlfranq');
        for (var i = 0; i < resp.length; i++) {
          lstElem.push( plt.render(resp[i]) );
        }
        $('#containerLstFranqs').html(lstElem);

        //Encendemos los click de...

        _encenderClick()

        lstElem = undefined;
      }else{
        $('#containerLstFranqs').html('<small class="d-block text-danger">Sin Franquicias por el momento.</small>');
      }
      $('#containerMain').unblock();
    }, lstCampoFile
  );
}

function _encenderClick() {
  //CONFIGURACION
  $('#containerLstFranqs').find('a[id^=btnGestConfig]').on('click', function(e){
    e.preventDefault();
    var path = $(this).attr('href');
    path = path.replace('__idFranq__', $(this).data('id'));
    window.location.href = path;
    e.stopImmediatePropagation();
  });

  //EDICION
  $('#containerLstFranqs').find('a[id^=btnEditFranq]').on('click', function(e){
    e.preventDefault();
    var path = $(this).attr('href');
    path = path.replace('__idFranq__', $(this).data('id'));
    window.location.href = path;
    e.stopImmediatePropagation();
  });
}

/// Bloqueamos toda la pantalla
function _bloquearAllScreen(elemento, msg) {
  var load = '<div class="text-center"><div class="spinner-border text-warning" role="status"></div> <small class="d-block text-light">'+msg+'</small></div>';
  $('#'+elemento).block({ message: load, css: { border:'none', backgroundColor:'transparent' }});
}

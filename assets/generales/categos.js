import './../app.js';
import globals from './../globals';
import http from './../libs/http';

var jsonLoc = {'catego':0, 'subcat':0, 'nombre':'0', 'act': 'add', 'elem': '0'};
var global;

$(document).ready(function(){

});

/// vamos por las Categorias
function _getCategorias(url, elementHtml) {

  _bloquearAllScreen(elementHtml, 'Cargando...');
  http(
    'get',
    global['uriBaseLocs'] + '/l' + url,
    function(resp){
      if(resp.length > 0) {
        _hidratarCaja(resp, elementHtml);
      }else{
        $('#'+elementHtml).html(_getSinElementos())
      }
      $('#'+elementHtml).unblock();
    }
  );
}

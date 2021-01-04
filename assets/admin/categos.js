import './../app.js';
import globals from './../globals';
import http from './../libs/http';

var jsonLoc = {'catego':0, 'subcat':0, 'nombre':'0', 'act': 'add', 'elem': '0'};
var global;

$(document).ready(function(){

  global = globals('getGlobals');

  // Enviar el Formulario
  $('#frmGestCategos').submit(function(e){

    e.preventDefault();
    var data = $('#frmGestCategos').serializeArray();
    var nombre = $.trim(data[0]['value'].toLowerCase());
    var isValid = _isvalidNombre( nombre );
    if(isValid){
      isValid = _isValidIds();
    }

    if(isValid){
      _bloquearAllScreen('containerMain', 'Guardando...');
      jsonLoc['nombre'] = nombre;
      _addCategos();
    }
  });

  _getCategorias('/get-categos/', 'cjaCategos');

});

///
function _isvalidNombre( nombre ) {

    if(nombre.length == 0) {
      $('#printErrors').text('El nombre es Requerido');
      return false;
    }
    if(nombre.length <= 3) {
      $('#printErrors').text('Sé más específico en el Nombre');
      return false;
    }
    if(nombre.length > 100) {
      $('#printErrors').text('Demaciado largo el Nombre');
      return false;
    }
    return true;
}

///
function _isValidIds() {

  if(jsonLoc['act'] == 'add'){

    if(jsonLoc['catego'] == 0) {
      jsonLoc['elem'] = 'catego';
      return true;
    }else{
      if(jsonLoc['subcat'] == 0){
        jsonLoc['elem'] = 'subcat';
        return true;
      }
    }
  }else{

    if(jsonLoc['catego'] == 0) {
      $('#printErrors').text('Selecciona la Categoría para Editar');
      return false;
    }else{
      return true;
    }

    if(jsonLoc['subcat'] == 0) {
      $('#printErrors').text('Selecciona la SubCategoría para Editar');
      return false;
    }else{
      if(jsonLoc['catego'] == 0){
        $('#printErrors').text('Selecciona la Categoría.');
        return false;
      }
      return true;
    }
  }

  $('#printErrors').text('No es posible guardar nada!!');
  return false;
}

///
function _addCategos() {

  http(
    'post',
    global['uriBaseCats'] + '/gestionar-categos/',
    function(resp){

      $('#containerMain').unblock();
      if(resp['abort']){
        $('#printErrors').text(resp['body']);
        setTimeout(function () {
          $('#printErrors').text('Campo Obligatorio');
        }, 5000);
        return false;
      }

      if(jsonLoc['elem'] == 'catego') {
        if(jsonLoc['act'] == 'edit'){
          $('#txtTitAct').text('Alta de Nueva Categoría');
        }
        _getCategorias('/get-categos/', 'cjaCategos');
      }

      if(jsonLoc['elem'] == 'subcat') {
        if(jsonLoc['act'] == 'edit'){
          $('#txtTitAct').text('Alta de Nueva Categoría');
        }
        _getCategorias('/' + jsonLoc['catego'] + '/get-subcategos/', 'cjaCatSubs');
      }

      jsonLoc['act'] = 'add';
      $('#txtNombre').val('');
    }, jsonLoc
  );
}

/// vamos por las Categorias
function _getCategorias(url, elementHtml) {

  _bloquearAllScreen(elementHtml, 'Cargando...');
  http(
    'get',
    global['uriBaseCats'] + '/c' + url,
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

///
function _Editar(idElemento) {

  var elemento = $('#' + idElemento);
  if(elemento.data('tipo') == 'catego') {
    $('#'+idElemento).trigger('click');
    jsonLoc['elem'] = 'catego';
    jsonLoc['catego'] = elemento.data('id');
    jsonLoc['subcat'] = 0;
  }
  if(elemento.data('tipo') == 'subcat') {
    jsonLoc['elem'] = 'subcat';
    jsonLoc['subcat'] = elemento.data('id');
  }

  $('#txtTitAct').text('EDITAR CATEGORÍA');
  $('#txtNombre').val(elemento.data('nombre'));
}

///
function _Eliminar(idElemento) {

  var elemento = $('#' + idElemento);

  var acc = confirm('Segur@ de querer eliminar ' + elemento.data('nombre'));
  if(!acc){ return false; }
  _bloquearAllScreen('containerMain', 'Borrando...');

  http(
    'get',
    global['uriBaseCats'] + '/' + elemento.data('id') + '/' + elemento.data('tipo') + /del-categos/,
    function(resp){

      $('#containerMain').unblock();
      if(resp['abort']) {
        $('#printErrors').text(resp['body']);
        return false;
      }

      elemento.parent().parent().parent().remove();
      jsonLoc['nombre'] = '0';
      jsonLoc['act'] = 'add';

      if(elemento.data('tipo') == 'catego'){
        if(jsonLoc['catego'] == elemento.data('id')){
          jsonLoc['catego'] = 0;
        }
        var cant = parseInt($('#cantCategos').text());
        cant = ((cant -1) < 0) ? 0 : cant;
        $('#cantCategos').text(cant);
      }else{

        if(jsonLoc['subcat'] == elemento.data('id')){
          jsonLoc['subcat'] = 0;
        }
        var cant = parseInt($('#cantSubCategos').text());
        cant = cant -1;
        cant = (cant < 0) ? 0 : cant;
        $('#cantSubCategos').text(cant);
      }

      $('#txtNombre').val('');
    }
  );
}

///
function _hidratarCaja(resp, elementHtml) {

  if(resp.length > 0) {

    var plantilla = $.templates('#ptlCheckCats');
    var lstCats = new Array();
    for (var i = 0; i < resp.length; i++) {
      if(elementHtml == 'cjaCategos'){
        resp[i]['tipo'] = 'catego';
      }
      if(elementHtml == 'cjaCatSubs'){
        resp[i]['tipo'] = 'subcat';
      }
      lstCats.push( plantilla.render(resp[i]) );
    }
    $('#'+ elementHtml).html(lstCats);

    if(elementHtml == 'cjaCategos'){
      $('#cantCategos').text(lstCats.length);
    }
    if(elementHtml == 'cjaCatSubs'){
      $('#cantSubCategos').text(lstCats.length);
    }

    //Encendemos los click para seleccionar categorias.
    $('#'+ elementHtml).find('input[id^=radio_]').on('click', function(e) {
      if($(this).data('tipo') == 'catego'){ _seleccionarCatego($(this).data('id')); }
      e.stopImmediatePropagation();
    });

    // EDITAR
    $('#'+ elementHtml).find('a[id^=btnEdit]').on('click', function(e) {
      e.preventDefault();
      jsonLoc['act'] = 'edit';
      _Editar($(this).data('check'));
      e.stopImmediatePropagation();
    });

    // ELIMINAR
    $('#'+ elementHtml).find('a[id^=btnDel]').on('click', function(e) {
      e.preventDefault();
      jsonLoc['act'] = 'del';
      _Eliminar($(this).data('check'));
      e.stopImmediatePropagation();
    });

  }

}

///
function _seleccionarCatego(id) {

    jsonLoc['subcat'] = 0;
    jsonLoc['elem'] = 'catego';
    if(jsonLoc['catego'] != id){
      _getCategorias('/' + id + '/get-subcategos/', 'cjaCatSubs');
    }
    jsonLoc['catego'] = id;
    var prefix = (jsonLoc['act'] == 'add') ? 'Agregar Nueva ' : 'EDITAR ';
    $('#txtTitAct').text(prefix + 'CATEGORÍA');
}

///
function _seleccionarSubCatego(id) {

    jsonLoc['subcat'] = 0;
    jsonLoc['elem'] = 'catego';
    if(jsonLoc['catego'] != id){
      _getCategorias('/get-subcategos/', 'cjaCatSubs');
    }
    jsonLoc['catego'] = id;
    var prefix = (jsonLoc['act'] == 'add') ? 'Agregar Nueva ' : 'EDITAR ';
    $('#txtTitAct').text(prefix + 'CATEGORÍA');
}

/// Bloqueamos toda la pantalla
function _bloquearAllScreen(elemento, msg) {
  var load = '<div class="text-center"><div class="spinner-border text-warning" role="status"></div> <small class="d-block text-light">'+msg+'</small></div>';
  $('#'+elemento).block({ message: load, css: { border:'none', backgroundColor:'transparent' }});
}

/// Machote HTML para mostrar nada de elementos.
function _getSinElementos() {
  return '<h6 class="text-muted">Sin Elemento para mostrar</h6>';
}

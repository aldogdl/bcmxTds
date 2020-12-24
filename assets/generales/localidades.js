import './../app.js';
import globals from './../globals';
import http from './../libs/http';

var jsonLoc = {'pais':0, 'edo':0, 'cd':0, 'col':0, 'nombre':'0', 'act': 'add', 'elem': '0'};
var global;

///
$(document).ready(function(){

  global = globals('getGlobals');

  // Enviar el Formulario
  $('#frmGestLocalidades').submit(function(e){
    e.preventDefault();
    var data = $('#frmGestLocalidades').serializeArray();
    var nombre = $.trim(data[0]['value'].toLowerCase());
    var isValid = _isvalidNombre( nombre );
    if(isValid){
      isValid = _isValidIds();
    }

    if(isValid){
      _bloquearAllScreen('containerMain', 'Guardando...');
      jsonLoc['nombre'] = nombre;
      _addLocalidad();
    }
  });

  // Reiniciamos la pizarra para dar de alta nuevo pais.
  $('#refreshScreen').click(function(e){
    e.preventDefault();

    $('#cantEdo').text('0');
    $('#cantCds').text('0');
    $('#cantCols').text('0');

    $('#cjaEstados').html( _getSinElementos() );
    $('#cjaCiudades').html( _getSinElementos() );
    $('#cjaColonias').html( _getSinElementos() );
    jsonLoc['pais'] = 0;
    jsonLoc['edo'] = 0;
    jsonLoc['cd'] = 0;
    jsonLoc['col'] = 0;
    jsonLoc['nombre'] = '0';
    jsonLoc['act'] = 'add';
    jsonLoc['elem'] = '0';
    $('#nomPais').text('');
    $('#nomEdo').text('');
    $('#nomCd').text('');
    var paises = $('input[id^=radio_pais]');
    $.each(paises, function(i, e){
      $(e).prop('checked', false);
    });
    $('#titQueAlta').text('Alta de Nuevo País');

    e.stopImmediatePropagation();
  });

  ///
  _getLocalidades('/get-paises/', 'cjaPaises');

});

/// Colocamos los resultados del servidor en sus respectivos lugares.
function _hidratarCaja(data, elementHtml) {

  var plantilla = $.templates('#ptlCheckLoc');
  var lstElementos = new Array();

  if(elementHtml == 'cjaPaises'){
    $('#cantPais').text(data.length);
  }
  if(elementHtml == 'cjaEstados'){
    $('#cantEdo').text(data.length);
  }
  if(elementHtml == 'cjaCiudades'){
    $('#cantCds').text(data.length);
  }
  if(elementHtml == 'cjaColonias'){
    $('#cantCols').text(data.length);
  }

  for (var i = 0; i < data.length; i++) {
    if(elementHtml == 'cjaPaises'){
      data[i]['tipo'] = 'pais';
    }
    if(elementHtml == 'cjaEstados'){
      data[i]['tipo'] = 'edo';
    }
    if(elementHtml == 'cjaCiudades'){
      data[i]['tipo'] = 'cd';
    }
    if(elementHtml == 'cjaColonias'){
      data[i]['tipo'] = 'col';
    }
    lstElementos.push( plantilla.render(data[i]) );
  }
  $('#'+elementHtml).html(lstElementos);

  // boton para editar.
  $('#'+elementHtml).find('a[id^=btnEdit]').on('click', function(e) {
    e.preventDefault();
    _Editar( $('#'+elementHtml).find('#'+$(this).data('check')) );
    e.stopImmediatePropagation();
  });

  // boton para eliminar elementos.
  $('#'+elementHtml).find('a[id^=btnDel]').on('click', function(e) {
    e.preventDefault();
    _Eliminar( $('#'+elementHtml).find('#'+$(this).data('check')) );
    e.stopImmediatePropagation();
  });

  // Seleccionando checkboxs
  $('#'+elementHtml).find('input[id^=radio_]').click(function(e){
    jsonLoc['act'] = 'add';
    if($(this).data('tipo') == 'pais') {
      _seleccionandoPais( $(this).data('id'), $(this).data('nombre') );
    }
    if($(this).data('tipo') == 'edo') {
      _seleccionandoEdos( $(this).data('id'), $(this).data('nombre') );
    }
    if($(this).data('tipo') == 'cd') {
      _seleccionandoCds( $(this).data('id'), $(this).data('nombre') );
    }
    e.stopImmediatePropagation();
  });
}

/// Accion cuando le das click al checkbox del pais
function _seleccionandoPais(id, nombre) {

  jsonLoc['edo'] = 0;
  jsonLoc['cd'] = 0;
  jsonLoc['col'] = 0;
  $('#nomPais').text(nombre);
  $('#nomEdo').text('');
  $('#nomCd').text('');
  if(jsonLoc['pais'] != id) {
    $('#cantEdo').text('0');
    $('#cantCds').text('0');
    $('#cantCols').text('0');
    $('#cjaEstados').html(_getSinElementos());
    $('#cjaCiudades').html(_getSinElementos());
    $('#cjaColonias').html(_getSinElementos());
    _getLocalidades('/' + id + '/get-edos/', 'cjaEstados');
  }
  jsonLoc['pais'] = id;

  var prefixTipo = (jsonLoc['act'] == 'add') ? 'Coloca un nuevo ESTADO para ' : 'EDITAR '
  $('#titQueAlta').text(prefixTipo + nombre);
}

/// Accion cuando le das click al checkbox del estado
function _seleccionandoEdos(id, nombre) {

  jsonLoc['cd'] = 0;
  jsonLoc['col'] = 0;
  $('#nomEdo').text(nombre);
  $('#nomCd').text('');
  if(jsonLoc['edo'] != id) {
    $('#cantCds').text('0');
    $('#cantCols').text('0');
    $('#cjaCiudades').html(_getSinElementos());
    $('#cjaColonias').html(_getSinElementos());
    _getLocalidades('/' + id + '/get-ciudades/', 'cjaCiudades');
  }
  jsonLoc['edo'] = id;

  var prefixTipo = (jsonLoc['act'] == 'add') ? 'Coloca una nueva CIUDAD para ' : 'EDITAR '
  $('#titQueAlta').text(prefixTipo + nombre);
}

/// Accion cuando le das click al checkbox de la ciudad
function _seleccionandoCds(id, nombre) {

  jsonLoc['col'] = 0;
  $('#nomCd').text(nombre);
  if(jsonLoc['cd'] != id) {
    $('#cantCols').text('0');
    $('#cjaColonias').html(_getSinElementos());
    _getLocalidades('/' + id + '/get-colonias/', 'cjaColonias');
  }
  jsonLoc['cd'] = id;

  var prefixTipo = (jsonLoc['act'] == 'add') ? 'Coloca una nueva COLONIA para ' : 'EDITAR '
  $('#titQueAlta').text(prefixTipo + nombre);
}

/// Revisamos el nombre de la localidad colocada por el usuario
function _isvalidNombre(nombre) {

  if(nombre.length == 0) {
    $('#printErrors').text('El nombre es requerido');
    return false;
  }
  if(nombre.length <= 3) {
    $('#printErrors').text('Se más específico, por favor');
    return false;
  }
  return true;
}

///
function _isValidIds() {

  if(jsonLoc['act'] == 'add'){

    // Revisando Pais
    if(jsonLoc['pais'] == 0){
      jsonLoc['elem'] = 'pais';
      return true;
    }

    // Revisando Estados
    if(jsonLoc['edo'] == 0){
      jsonLoc['elem'] = 'edo';
      return _isValidInputEstado();
    }

    // Revisando Ciudad
    if(jsonLoc['cd'] == 0){
      jsonLoc['elem'] = 'cd';
      return _isValidInputCiudad();
    }

    // Revisando Colonia
    if(jsonLoc['col'] == 0){
      jsonLoc['elem'] = 'col';
      return _isValidInputColonia();
    }

    $('#printErrors').text('Revisa el Formulario');
    return false;

  }else{

    // Revisando Colonia para EDITAR
    switch (jsonLoc['elem']) {
      case 'col':
        jsonLoc['elem'] = 'col';
        return _isValidInputColonia();
        break;
      case 'cd':
        jsonLoc['elem'] = 'cd';
        return _isValidInputCiudad();
        break;
      case 'edo':
        jsonLoc['elem'] = 'edo';
        return _isValidInputEstado();
        break;
      case 'pais':
        jsonLoc['elem'] = 'pais';
        return true;
        break;
      default:
    }

    $('#printErrors').text('Revisa el Formulario');
    return false;
  }

  return true;
}

/// Revisamos que los datos para la Colonia esten completos
function _isValidInputColonia() {

  if(jsonLoc['cd'] != 0){
    var inputSelec = $('input[id^=radio_cd]');
    if(inputSelec.length > 0) {
      for (var i = 0; i < inputSelec.length; i++) {
        if($(inputSelec[i]).prop('checked')) {
          if($(inputSelec[i]).data('id') == jsonLoc['cd']){
            inputSelec = undefined;
            return true;
          }
        }
      }
    }
    inputSelec = undefined;
    $('#printErrors').text('La Ciudad no corresponde a la Colonia');
    return false;
  }else{
    $('#printErrors').text('Selecciona País, Estado y Ciudad');
    return false;
  }
}

/// Revisamos que los datos para la Ciudad esten completos
function _isValidInputCiudad() {

  if(jsonLoc['edo'] != 0){
    var inputSelec = $('input[id^=radio_edo]');
    if(inputSelec.length > 0) {
      for (var i = 0; i < inputSelec.length; i++) {
        if($(inputSelec[i]).prop('checked')) {
          if($(inputSelec[i]).data('id') == jsonLoc['edo']){
            inputSelec = undefined;
            return true;
          }
        }
      }
    }
    inputSelec = undefined;
    $('#printErrors').text('La Ciudad no corresponde al Estado');
    return false;
  }else{
    $('#printErrors').text('Selecciona País y Estado');
    return false;
  }
}

/// Revisamos que los datos para la Colonia esten completos
function _isValidInputEstado() {

  if(jsonLoc['pais'] != 0){
    var inputSelec = $('input[id^=radio_pais]');
    if(inputSelec.length > 0) {
      for (var i = 0; i < inputSelec.length; i++) {
        if($(inputSelec[i]).prop('checked')) {
          if($(inputSelec[i]).data('id') == jsonLoc['pais']){
            inputSelec = undefined;
            return true;
          }
        }
      }
    }
    inputSelec = undefined;
    $('#printErrors').text('El Estado no corresponde al País');
    return false;
  }else{
    $('#printErrors').text('Selecciona País');
    return false;
  }
}

/// vamos por las localidades al servidor.
function _getLocalidades(url, elementHtml) {

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

/// Agregamos una nueva localidad
function _addLocalidad() {

  http(
    'post',
    global['uriBaseLocs'] + '/add-localidad/',
    function(resp){

      $('#containerMain').unblock();
      if(resp['abort']) {
        $('#printErrors').text(resp['body']);
        return;
      }

      if(jsonLoc['elem'] == 'pais'){ _getLocalidades('/get-paises/', 'cjaPaises'); }
      if(jsonLoc['elem'] == 'edo'){ _getLocalidades('/' + jsonLoc['pais'] + '/get-edos/', 'cjaEstados'); }
      if(jsonLoc['elem'] == 'cd'){ _getLocalidades('/' + jsonLoc['edo'] + '/get-ciudades/', 'cjaCiudades'); }
      if(jsonLoc['elem'] == 'col'){ _getLocalidades('/' + jsonLoc['cd'] + '/get-colonias/', 'cjaColonias'); }
      $('#txtNombreLoc').val('');
      jsonLoc['act'] = 'add';
    },
    jsonLoc
  )
}

/// Editamos
function _Editar(elemento) {

  if(elemento.data('tipo') != 'col'){
    elemento.trigger('click');
  }else{
    jsonLoc['col'] = elemento.data('id');
    $('#titQueAlta').text('EDITAR ' + elemento.data('nombre'));
  }
  jsonLoc['act'] = 'edit';
  jsonLoc['elem'] = elemento.data('tipo');
  jsonLoc['nombre'] = elemento.data('nombre');

  $('#txtNombreLoc').val( elemento.data('nombre') );
  var prefixTipo = (jsonLoc['act'] == 'add') ? 'Coloca un nuevo ESTADO para ' : 'EDITAR '
  $('#titQueAlta').text(prefixTipo + elemento.data('nombre'));
}

/// Eliminamos
function _Eliminar(elemento) {

  var acc = confirm('Segur@ de querer eliminar ' + elemento.data('nombre'));
  if(!acc){ return false; }

  jsonLoc['act'] = 'del';
  _bloquearAllScreen('containerMain', 'Cargando...');
  http(
    'get',
    global['uriBaseLocs'] + '/' + elemento.data('id') + '/' + elemento.data('tipo') + '/del-localidad/',
    function(resp){
      if(!resp['abort']) {
        elemento.parent().parent().parent().remove();
        _descontarContador( elemento.data('tipo') );
      }else{
        $('#printErrors').text(resp['body']);
        setTimeout(function () {
          $('#printErrors').text('Campo Obligatorio');
        }, 5000);
      }
      jsonLoc['act'] = 'add';
      $('#containerMain').unblock();
    }
  );
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

///
function _descontarContador(tipo) {

  var cant = 0;
  if(tipo == 'pais'){
      cant = $('#cantPais').text();
      cant = parseInt(cant) - 1;
      cant = (cant < 0 ) ? 0 : cant;
      $('#cantPais').text(cant);
  }
  if(tipo == 'edo'){
      cant = $('#cantEdo').text();
      cant = parseInt(cant) - 1;
      cant = (cant < 0 ) ? 0 : cant;
      $('#cantEdo').text(cant);
  }
  if(tipo == 'cd'){
      cant = $('#cantCds').text();
      cant = parseInt(cant) - 1;
      cant = (cant < 0 ) ? 0 : cant;
      $('#cantCds').text(cant);
  }
  if(tipo == 'col'){
      cant = $('#cantCols').text();
      cant = parseInt(cant) - 1;
      cant = (cant < 0 ) ? 0 : cant;
      $('#cantCols').text(cant);
  }

}

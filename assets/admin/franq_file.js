import './../app.js';
import globals from './../globals';
import http from './../libs/http';
import './../../node_modules/jquery-ui/ui/widgets/datepicker.js';

var lstCampoFile = {'franq':[], 'config':[]};
var memoryTmp = {'franq':[], 'config':[]};
var indexEdit = -1;
var global;

$(document).ready(function(){

  global = globals('getGlobals');

  $('#frmConfig').submit(function(e){

    e.preventDefault();
    var data = $(this).serializeArray();
    var nomCamp = $.trim( data[0]['value'].toLowerCase() );
    const regex = /\s/gi;
    var campo = {
      'idIndex': -1,
      'campo'  : nomCamp.replace(regex, '_'),
      'despeq' : $.trim(data[1]['value']),
      'tipo'   : data[2]['value']
    };
    data = undefined;
    if(!_isValid(campo)){ return false; }

    if(indexEdit == -1){
      _addCampo(campo);
    }else{
      _editCampo(campo);
    }

    document.getElementById("frmConfig").reset();

    if(campo['tipo'] == 'franq'){
      $('#frmConfig_tipo1').prop('checked', true);
      $('#frmConfig_tipo2').prop('checked', false);
    }else{
      $('#frmConfig_tipo1').prop('checked', false);
      $('#frmConfig_tipo2').prop('checked', true);
    }
    $('#frmConfig_campo').select().trigger('focus');

    e.stopImmediatePropagation();
  });

  /// Limpiamos data de screen para dar de alta nuevo campo.
  $('#btnLimpiarPizarra').click(function(e){
    e.preventDefault();
    indexEdit = -1;
    _limpiarPizarra();
    memoryTmp = {'franq':[], 'config':[]};
    e.stopImmediatePropagation();
  });

  /// Enviar todo al servidor
  $('#submitAll').click(function(e){
    e.preventDefault();
    _enviarDataToServer();
    e.stopImmediatePropagation();
  });

  _getConfigAct();

});

/// Enviamos los datos para el archivo de configuración.
function _enviarDataToServer() {

  var acc = true;
  var texto = '¡ALERTA!\nSe ha detectado que la sección de __seccion__, no cuenta con ningún campo.\n\nEnviar una sección bacia eliminará todo lo que se encuentre en dicho archivo permanentemente.\n\n¿Estás segur@ de querer hacer eso?';
  if(lstCampoFile['franq'].length == 0) {
    acc = confirm( texto.replace('__seccion__', 'Campos de Franquicia'));
  }
  if(acc){
    if(lstCampoFile['config'].length == 0) {
      acc = confirm( texto.replace('__seccion__', 'Campos de Configuración'));
    }
  }

  if(acc){ _sendToServer();  }
}

/// Realizamos la accion real de _enviarDataToServer
function _sendToServer() {

  _bloquearAllScreen('containerMain', 'Enviando Datos...');
  http(
    'post',
    $('#getPathSendFileConfig').data('path'),
    function(resp){
      if(resp['has'] <= 4) {
        alert('No se pudo guardar los campos enviados al servidor, inténtalo nuevamente por favor.');
      }
      resp = undefined;
      $('#containerMain').unblock();
    }, lstCampoFile
  );
}

/// Validamos los campos para la creacion del archivo de configuracion
function _isValid(dataCampo) {

  var error = 'Los datos con asterico (*) son Obligatorios';
  var hasEr = false;
  if(dataCampo['campo'].length == 0) {
    error = 'El nombre de campo es necesario';
    hasEr = true;
  }
  if(dataCampo['despeq'].length == 0) {
    error = 'La Descripción es necesario';
    hasEr = true;
  }

  if(hasEr){
    $('#msgError').text(error).addClass('badge badge-danger text-light');
    setTimeout(function () {
      $('#msgError').text('Los datos con asterico (*) son Obligatorios').removeClass('badge badge-danger text-light');
    }, 3000);
  }

  return (hasEr) ? false : true;
}

///
function _printDataCampo() {

  var htmlF = new Array();
  var htmlC = new Array();
  var tpl  = $.templates('#ptlCampoData');
  $('#franqContent').html('');
  $('#configContent').html('');

  // Eliminamos primero los elementos que esten en memoryTmp
  var indexDel = -1;
  if(memoryTmp['franq'].hasOwnProperty('idIndex')) {
    for (var i = 0; i < lstCampoFile['franq'].length; i++) {
      if(lstCampoFile['franq'][i]['idIndex'] == memoryTmp['franq']['idIndex']) {
        indexDel = i;
        break;
      }
    }
    if(indexDel > -1){
      lstCampoFile[ 'franq' ].splice( indexDel, 1 );
    }
  }

  indexDel = -1;
  if(memoryTmp['config'].hasOwnProperty('idIndex')) {
    for (var i = 0; i < lstCampoFile['config'].length; i++) {
      if(lstCampoFile['config'][i]['idIndex'] == memoryTmp['config']['idIndex']) {
        indexDel = i;
        break;
      }
    }
    if(indexDel > -1){
      lstCampoFile[ 'config' ].splice( indexDel, 1 );
    }
  }
  memoryTmp = {'franq':[], 'config':[]};

  var index = -1;
  if(lstCampoFile['franq'].length > 0) {
    index = -1;
    $.each(lstCampoFile['franq'], function(i, campo) {
      index ++;
      campo['idIndex'] = index;
      htmlF.push( tpl.render( campo ) );
    });

    //Encendemos botones de edicion y eliminacion en la seccion de FRANQUICIAS
    $('#franqContent').html(htmlF).find('a[id^=btn]').on('click', function(e){
      e.preventDefault();
      _accionBtnsCampos(this);
      e.stopImmediatePropagation();
    });
  }

  if(lstCampoFile['config'].length > 0) {
    index = -1;
    $.each(lstCampoFile['config'], function(i, campo){
      index ++;
      campo['idIndex'] = index;
      htmlC.push( tpl.render( campo ) );
    });

    //Encendemos botones de edicion y eliminacion en la seccion de CONFIGURACION
    $('#configContent').html(htmlC).find('a[id^=btn]').on('click', function(e){
      e.preventDefault();
      _accionBtnsCampos(this);
      e.stopImmediatePropagation();
    });
  }

  /// Encendemos las acciones.

  htmlF = htmlC = tpl = undefined;
}

///
function _accionBtnsCampos(elemento) {

  var accion = $(elemento).data('act');

  if(accion == 'del') {
    lstCampoFile[$(elemento).data('tipo')].splice( $(elemento).data('index'), 1 );
    _printDataCampo();
  }

  if(accion == 'edit') {

    var campo = lstCampoFile[ $(elemento).data('tipo') ][ $(elemento).data('index') ];
    memoryTmp = {'franq':[], 'config':[]};
    memoryTmp[ $(elemento).data('tipo') ] = campo;
    indexEdit = campo['idIndex'];
    if(campo['tipo'] == 'franq'){
      $('#frmConfig_tipo1').prop('checked', true);
      $('#frmConfig_tipo2').prop('checked', false);
    }else{
      $('#frmConfig_tipo1').prop('checked', false);
      $('#frmConfig_tipo2').prop('checked', true);
    }
    $('#frmConfig_campo').val(campo['campo']);
    $('#frmConfig_despeq').val(campo['despeq']);
    $('#btnAccFile').text('Editar Campo').addClass('btn-success');
  }
  elemento = undefined;
}

///
function _addCampo(newCampo) {

  //Revisamos si existe el campo.
  var existe = false;
  for (var i = 0; i < lstCampoFile[ newCampo['tipo'] ].length; i++) {
    if( lstCampoFile[ newCampo['tipo'] ][i]['campo'] == newCampo['campo']){
        existe = true;
    }
  }

  if(!existe) {
    lstCampoFile[ newCampo['tipo'] ].push(newCampo);
    _printDataCampo();
  }

}

///
function _editCampo(newData) {

  lstCampoFile[ newData['tipo'] ].push(newData);
  _limpiarPizarra();
  newData = undefined;
  _printDataCampo();
}

///
function _limpiarPizarra() {
  indexEdit = -1;
  $('#btnAccFile').text('Agregar nuevo Campo').removeClass('btn-success');
  document.getElementById("frmConfig").reset();
}

///
function _getConfigAct() {

  lstCampoFile = {'franq':[], 'config':[]};
  var printScreen = false;
  $('#contentConfig').html( _getCargador() );
  var config = $('#getConfig').data('config');
  if(config == null) {
    $('#contentFranq').html( _getHtmlNadaParaVer() );
    $('#contentConfig').html( _getHtmlNadaParaVer() );
    return false;
  }
  if(config.hasOwnProperty('franq')){
    lstCampoFile['franq'] = config['franq'];
    printScreen = true;
  }else{
    $('#contentFranq').html( _getHtmlNadaParaVer() );
  }

  if(config.hasOwnProperty('config')){
    lstCampoFile['config'] = config['config'];
    printScreen = true;
  }else{
    $('#contentConfig').html( _getHtmlNadaParaVer() );
  }

  if(printScreen) {
    _printDataCampo();
  }
  config = undefined;
}

///
function _getHtmlNadaParaVer() {
  return '<h4 class="text-muted d-block m-auto">Nada para mostrar</h4>';
}

///
function _getCargador() {
  return '<div class="text-center m-auto"> <div class="spinner-border" role="status"> <span class="sr-only">Loading...</span> </div> </div>';
}

/// Bloqueamos toda la pantalla
function _bloquearAllScreen(elemento, msg) {
  var load = '<div class="text-center"><div class="spinner-border text-warning" role="status"></div> <small class="d-block text-light">'+msg+'</small></div>';
  $('#'+elemento).block({ message: load, css: { border:'none', backgroundColor:'transparent' }});
}

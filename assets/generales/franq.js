import './../app.js';
import globals from './../globals';
import http from './../libs/http';
import './../../node_modules/jquery-ui/ui/widgets/datepicker.js';

var lstCampoFile = {'franq':[], 'config':[]};
var memoryTmp = {'franq':[], 'config':[]};
var indexEdit = -1;
var global;
var baseMaps = 'https://www.google.com.mx/maps/place/Calle+';

$(document).ready(function(){

  global = globals('getGlobals');

  var links = $('#navbarNav .nav-item');
  if(links.length > 0) {
    var estasEn = $('#getEstasEn').text();
    $.each(links, function(i, link){
      if(estasEn.lastIndexOf(link.innerText) != -1){
        $(link).addClass('active');
      }
    });
  }
  links = undefined;

  // $("#franq_data_contac_nextPagoAt").datepicker(_getOpcionesDatePicker());

  // ENTRA SOLO A .../gestion-franquicias
  if(window.location.href.lastIndexOf('gestion-franquicias') != -1) {

    //fnc::checkAndConvertToSlug
    $('#franq_data_contac_nombre').blur(function(e){
      var txt = $(this).val();
      if(txt.length > 3){
        _bloquearAllScreen('blockSubDominio', 'Revisando...');
        http('get',
          global['uriBaseFranq'] + '/' + txt + '/check-and-convert-to-slug/',
          function(slug){
            $('#franq_data_contac_slug').val(slug['txt']);
            $('#blockSubDominio').unblock();
          }
        );
      }
    });

    /// FRM para gestionar franquicias.
    $('#frmGestFranq').submit(function(e){
      e.preventDefault();
      var data = $(this).serializeArray();
      var dataSend = {};
      if(data.length > 0) {
        $.each(data, function(index, val){
          var key = val['name'].replace('franq_data_contac[', '');
          key = key.replace(']', '');
          key = $.trim(key.toLowerCase());
          dataSend[key] = val['value'];
        });
      }

      var isValid = _isValidDataFranq(dataSend);
      if(isValid){
        //_bloquearAllScreen('containerMain', 'Guardando...');
        http('post',
          global['uriBaseFranq'] + '/save-data-franq/',
          function(resp){
            console.log(resp);
          }
        ), dataSend;
      }
      e.stopImmediatePropagation();
    });

    ///
    $('#irToGetLatLng').click(function(e){
      e.preventDefault();
      var loc = [];
      var calle = $('#franq_data_contac_domicilio').val();
      const regex = /\s/gi;

      console.log(calle.replace(regex, '+'));
      loc.push(calle.replace(regex, '+'));
      loc.push($('#franq_data_contac_col option:selected').text().replace(regex, '+'));
      loc.push($('#franq_data_contac_cd option:selected').text().replace(regex, '+'));
      loc.push($('#franq_data_contac_edo option:selected').text().replace(regex, '+'));
      loc.push($('#franq_data_contac_pais option:selected').text().replace(regex, '+'));

      var win = baseMaps + loc.join(',+');
      window.open(win, '_blank');
      loc = undefined;
      e.stopImmediatePropagation();
    });
    _irPorLosPaises();

  } /// fin de .../gestion-franquicias

  // ENTRA SOLO A .../archivo-configuracion
  if(window.location.href.lastIndexOf('configuracion') != -1) {

    /// Gestionando campos para la configuración
    $('#frmConfig').submit(function(e){

      e.preventDefault();
      var data = $(this).serializeArray();
      var nomCamp = $.trim( data[0]['value'].toLowerCase() );
      var campo = {
        'idIndex': -1,
        'campo'  : nomCamp.replace(' ', '_'),
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
  }
});



//------------// ENTRA SOLO A .../gestion-franquicias ---------------------

/// Validamos los datos para dar de alta una franquicia.
function _isValidDataFranq(dataSend) {

  var err = false;
  $.each(dataSend, function(k, v){
    if(v.length == 0 || v == '0'){
      $('#franq_data_contac_err_' + k).text('Campo Obligatorio.');
      err = true;
    }
  });
  return err;
}


///
function _irPorLosPaises() {

  _getLocalidad('p', 'get-paises/').then(opciones => {
    $('#franq_data_contac_pais').html(opciones).on('change', function(e){
      _irPorLosEstados( $(this).val() );
    });
  });
}

///
function _irPorLosEstados( idPais ) {

  _getLocalidad('e', idPais+ '/get-edos/').then((opciones) => {
    $('#franq_data_contac_edo').html(opciones).on('change', function(e){
      _irPorLasCiudades( $(this).val() );
    });
  });
}

///
function _irPorLasCiudades( idEdo ) {

  _getLocalidad('c', idEdo + '/get-ciudades/').then((opciones) => {
    $('#franq_data_contac_cd').html(opciones).on('change', function(e){
      _irPorLasColonias( $(this).val() );
    });
  });
}

///
function _irPorLasColonias( idCd ) {

  _getLocalidad('c', idCd + '/get-colonias/').then((opciones) => {
    $('#franq_data_contac_col').html(opciones);
  });
}

///
function _getLocalidad(prefix, url) {

  _bloquearAllScreen('sideFrmPage', 'Buscando Elementos...');
  return new Promise(function(resolve) {
    http(
      'get',
      global['uriBaseLocs'] + '/' + prefix + '/' + url,
      function(resp){
        if(resp.length > 0){
          var lstElem = new Array();
          lstElem.push($('<option/>').attr('value', '0').text('Selecciona Localidad'))
          for (var i = 0; i < resp.length; i++) {
            var opc = $('<option/>').attr('value', resp[i][prefix + '_id']).text(resp[i][prefix + '_nombre']);
            lstElem.push(opc);
          }
        }else{
          var opc = $('<option/>').attr('value', '0').text('Sin elementos');
          lstElem.push(opc);
        }
        resp = undefined;
        $('#sideFrmPage').unblock();
        resolve(lstElem);
      }
    );
  });
}

//------------// FIN DE .../gestion-franquicias ---------------------


//------------// ENTRA SOLO A .../archivo-configuracion ---------------------

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
    $('#contentFranq').html( '<h4 class="text-muted d-block m-auto">Nada para mostrar</h4>' );
    $('#contentConfig').html( '<h4 class="text-muted d-block m-auto">Nada para mostrar</h4>' );
    return false;
  }
  if(config.hasOwnProperty('franq')){
    lstCampoFile['franq'] = config['franq'];
    printScreen = true;
  }else{
    $('#contentFranq').html( '<h4 class="text-muted d-block m-auto">Nada para mostrar</h4>' );
  }

  if(config.hasOwnProperty('config')){
    lstCampoFile['config'] = config['config'];
    printScreen = true;
  }else{
    $('#contentConfig').html( '<h4 class="text-muted d-block m-auto">Nada para mostrar</h4>' );
  }

  if(printScreen) {
    _printDataCampo();
  }
  config = undefined;
}

//------------// FIN DE .../archivo-configuracion ---------------------

//------------// GENERALES --------------------------------------------

///
function _getOpcionesDatePicker() {
  return {
    closeText: 'Cerrar',
		prevText: ' Atras',
    nextText: ' Siguiente',
		currentText: 'Hoy',
		monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
		'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
		monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
		'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
		dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
		dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié;', 'Juv', 'Vie', 'Sáb'],
		dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
		weekHeader: 'Sm',
		dateFormat: 'dd-mm-yy',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''
  };
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

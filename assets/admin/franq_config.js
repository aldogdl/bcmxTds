import './../app.js';
import globals from './../globals';
import http from './../libs/http';
import './../../node_modules/jquery-ui/ui/widgets/datepicker.js';

var lstCampoFile = {'franq':[], 'config':[]};
var memoryTmp = {'franq':[], 'config':[]};
var global;

$(document).ready(function(){

  global = globals('getGlobals');

  // $("#franq_data_contac_nextPagoAt").datepicker(_getOpcionesDatePicker());

  //Click en las TAPS
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var clickEn = $(e.target);
    if(clickEn.attr('id') == 'franq-tab') {
      _crearInputs('franq');
    }
    if(clickEn.attr('id') == 'config-tab') {
      _crearInputs('config');
    }
    //e.relatedTarget // previous active tab
  });

  lstCampoFile = $('#getConfigAct').data('config');
  $('#setMsgAccFranq').text('Recuperando datos de la Franquicia');

  _getDataFranquicia( $('#getConfigAct').data('id') ).then((resp) => {

    if(resp.hasOwnProperty('f_id')) {

      $('#setFileConfig').text(txt);
      $('#setNombreFran').text(resp['f_nombre']);
      $('#setIdFranq').text(resp['f_id']);
      $('#setDomiclioFranq').text(resp['f_domicilio']);

      var txt = 'Sin Configurar aún';
      if(resp['f_configFile'] != '0') {
        txt = resp['f_configFile'];
        $('#setMsgAccFranq').text('Buscando archivo de Configuración');
        console.log('ir por la config');
        _crearInputs('franq');
      }else{
        _crearInputs('franq');
      }
    }

  });

  // Click para guardar configuracion
  $('.btnSaveConfig').click(function(e){
    console.log('recoger data');
  });

});

///
function _getDataFranquicia(idFranq) {

  return new Promise((resolve) => {
    http(
      'get',
      global['uriBaseFranq'] +'/'+ idFranq + '/get-franquicia-by-id/',
      function(resp){
        resolve(resp)
      }
    );
  });

}

///
function _crearInputs(tipo) {

  $('#setMsgAccFranq').text('Construyendo Formulario de Configuración');

  if(!memoryTmp[tipo].hasOwnProperty('campo')) {

    var tpl = $.templates('#ptlInputConfig');
    var lstElem = new Array();
    var funcionesExt = {
      'getTitulo': function(txt) {
        var sust = /_/gi
        txt = txt.replace(sust, ' ');
        return txt.toUpperCase();
      },
      'getIdInput': function(nomCampo, tipo) {
        return tipo + '_' + nomCampo;
      },
      'getNameInput': function(nomCampo, tipo) {
        return tipo + '[' + nomCampo + ']';
      }
    };
    $.each(lstCampoFile[tipo], function(k, val){
      lstElem.push( tpl.render(val, funcionesExt) );
    });
    if(tipo == 'franq'){
      $('#containerConfigFranq').html(lstElem);
    }else{
      $('#containerConfigConfig').html(lstElem);
    }
    lstElem = undefined;
  }
}

/// Bloqueamos toda la pantalla
function _bloquearAllScreen(elemento, msg) {
  var load = '<div class="text-center"><div class="spinner-border text-warning" role="status"></div> <small class="d-block text-light">'+msg+'</small></div>';
  $('#'+elemento).block({ message: load, css: { border:'none', backgroundColor:'transparent' }});
}

import './../app.js';
import globals from './../globals';
import http from './../libs/http';

var global;
var baseMaps = 'https://www.google.com.mx/maps/place/Calle+';
var tipoFrm = '0';

$(document).ready(function(){

  global = globals('getGlobals');
  tipoFrm = $('#getTipoFrm').data('idfranq');

  //fnc::checkAndConvertToSlug
  $('#franq_data_contac_nombre').blur(function(e){
    var txt = $(this).val();
    if(txt.length > 3){
      _bloquearAllScreen('blockSubDominio', 'Revisando...');
      http('get',
      global['uriBaseFranq'] + '/' + txt + '/check-and-convert-to-slug/',
      function(slug){
        if(!slug['abort']){
          $('#franq_data_contac_slug').val(slug['body']);
        }else{
          $('#showErrGral').removeClass('d-none').find('#txtMsgErr').text(slug['body']);
          setTimeout(() => {
            $('#showErrGral').addClass('d-none').find('#txtMsgErr').text('ERROR EN EL FORMULARIO');
          }, 7000);
        }
        $('#blockSubDominio').unblock();
      }
    );
  }
  });

  // Fnc::frmGestFranq
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

    if(!isValid){
      if(tipoFrm != '0' && tipoFrm != 0){
        dataSend['id'] = tipoFrm;
      }
      _sendData(dataSend);
    }
    dataSend = data = undefined;
    e.stopImmediatePropagation();
  });

  ///
  $('#irToGetLatLng').click(function(e){
    e.preventDefault();
    var loc = [];
    var calle = $('#franq_data_contac_domicilio').val();
    const regex = /\s/gi;

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

  if(tipoFrm == 0 || tipoFrm == '0'){
    _irPorLosPaises();
  }else{
    _irPorDataFranquiciaForEdit();
  }

});

///
function _sendData(dataSend) {

  _bloquearAllScreen('containerMain', 'Guardando...');
  http('post',
  global['uriBaseFranq'] + '/save-data-franq/',
  function(resp){
    if(resp['abort']){
      $('#showErrGral').removeClass('d-none').find('#txtMsgErr').text(resp['body']);
      $('#containerMain').unblock();
      return false;
    }
    window.location.href = $('#getPathList').data('path');
  }, dataSend);
}

/// Vamos por los datos para editarlos.
function _irPorDataFranquiciaForEdit() {

  _bloquearAllScreen('containerMain', 'Recuperando Datos');
  http(
    'get',
    global['uriBaseFranq'] + '/' + tipoFrm + '/get-franquicia-by-id-all-data/',
    function(resp){
      if(resp.hasOwnProperty('f_id')){
        $('#franq_data_contac_nombre').val(resp['f_nombre']);
        $('#franq_data_contac_despeq').val(resp['f_despeq']);
        $('#franq_data_contac_slug').val(resp['f_slug']);
        $('#franq_data_contac_nomapp').val(resp['f_nomApp']);

        $('#franq_data_contac_domicilio').val(resp['f_domicilio']);
        $('#franq_data_contac_latlng').val(resp['f_latLng']);

        //Vamos por los PAISES.
        _getLocalidad('p', 'get-paises/').then(opciones => {

          $('#franq_data_contac_pais').html(opciones).on('change', function(e){
            _irPorLosEstados( $(this).val() );
          }).find('option[value='+resp['p_id']+']').prop('selected', true);

          //Vamos por los ESTADOS.
          _getLocalidad('e', resp['p_id'] + '/get-edos/').then(opciones => {

            $('#franq_data_contac_edo').html(opciones).on('change', function(e){
              _irPorLosEstados( $(this).val() );
            }).find('option[value='+resp['e_id']+']').prop('selected', true);

            //Vamos por los CIUDADES.
            _getLocalidad('c', resp['e_id'] + '/get-ciudades/').then(opciones => {

              $('#franq_data_contac_cd').html(opciones).on('change', function(e){
                _irPorLosEstados( $(this).val() );
              }).find('option[value='+resp['cd_id']+']').prop('selected', true);

              //Vamos por los COLONIAS.
              if(resp['cl_id'] != '' && resp['cl_id'] != '0' && resp['cl_id'] != 0){
                _getLocalidad('c', resp['cd_id'] + '/get-colonias/').then(opciones => {

                  $('#franq_data_contac_col').html(opciones).find('option[value='+resp['cl_id']+']').prop('selected', true);

                });
              }
            });
          });
        });
        $('#btnSubmitFranq').text('EDITAR');

      }else{
        alert('No se encotró la Franquicia Solicitada');
      }
      $('#containerMain').unblock();
    }
  );
}

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
    var lstElem = new Array();
    http(
      'get',
      global['uriBaseLocs'] + '/' + prefix + '/' + url,
      function(resp){
        if(resp.length > 0){
          lstElem = new Array();
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

/// Bloqueamos toda la pantalla
function _bloquearAllScreen(elemento, msg) {
  var load = '<div class="text-center"><div class="spinner-border text-warning" role="status"></div> <small class="d-block text-light">'+msg+'</small></div>';
  $('#'+elemento).block({ message: load, css: { border:'none', backgroundColor:'transparent' }});
}

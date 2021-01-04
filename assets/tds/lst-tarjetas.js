import './../app.js';
import globals from './../globals';
import http from './../libs/http';

var global;
var progressPasos = ['sanitizar', 'categos', 'franq', 'enlaces', 'tds'];
var calif = {};

$(document).ready(function(){
  global = globals('getGlobals');

  $('#refreshList').click(function(e){
    e.preventDefault();
    _getTarjetasAll();
    e.stopImmediatePropagation();
  });

  _getTarjetasAll();
});

///
function _getTarjetasAll() {

  _bloquearAllScreen('containerMain', 'Cargando Tarjetas...');

  http(
    'get',
    global['uriBaseTarje'] + '/get-tarjetas-indisenio/',
    function(resp){
      if(resp.length > 0) {
        $('#cantiTds').text(resp.length);
        _printScreenTarjetas(resp);
      }else{

      }
      $('#containerMain').unblock();
    }
  );
}

///
function _printScreenTarjetas(tds) {

  var tpl = $.templates('#ptlCard');
  var lstElem = new Array();
  var fcti = {
    'trucate': function(txt) {
      return (txt.length >= 31) ? txt.substring(0, 20) : txt
    }
  };
  for (var i = 0; i < tds.length; i++) {
    lstElem.push( tpl.render(tds[i], fcti) );
  }
  $('#containerTds').html(lstElem);
  _encenderClicks();
  lstElem = tpl = undefined;
}

///
function _encenderClicks() {

  // VER DATA
  $('#containerTds').find('a[id^=btnVerData]').on('click', function(e){
    e.preventDefault();

    $('#msgProccTerminado').addClass('d-none');
    $('#titSecNegoSelec').text($(this).data('nombre'));
    $('#titSecNegoSelecId').text($(this).data('id'));

    e.stopImmediatePropagation();
  });

  // MEDICAL
  $('#containerTds').find('a[id^=btnMedic]').on('click', function(e){
    e.preventDefault();
    var acc = true;
    if(calif.hasOwnProperty('idSel')) {
      if(calif['idSel'] != $(this).data('id')) {
        acc = confirm('Actualmente, estás en el proceso de ' + $('#titSecNegoSelec').text() + ', quieres eliminar el historial actual y pasar a el de ' + $(this).data('nombre'));
        if(!acc) return false;
      }
    }
    $('#msgProccTerminado').addClass('d-none');
    $('#titSecNegoSelec').text($(this).data('nombre'));
    $('#titSecNegoSelecId').text($(this).data('id'));
    calif = _getCalifProcesos();
    var total = 0;
    $.each(calif, function(k, v){
      if(v['max_val'] != undefined){
        total = total + v['max_val'];
      }
    });
    calif['total'] = total;
    calif['idSel'] = $(this).data('id');
    total = undefined;
    _sanitizarDatosGenerales($(this).data('id'), $(this).data('disenio'));
    e.stopImmediatePropagation();
  });

  // TERMINAR
  $('#containerTds').find('a[id^=btnTerminar]').on('click', function(e){
    e.preventDefault();
    $('#msgProccTerminado').addClass('d-none');
    $('#titSecNegoSelec').text($(this).data('nombre'));
    $('#titSecNegoSelecId').text($(this).data('id'));

    var save = true;
    var bloqueHtml = $(this).data('bloque');
    if(!$('#'+bloqueHtml).hasClass('border-success')) {
      alert('No puedes Terminar este proceso hasta que la verificación del registro sea Satisfactoria.');
      return false;
    }
    var isPagado = $('#'+bloqueHtml + ' .isPagado').text();
    if(isPagado == 'Sin Pago') {
      save = confirm('No se ha marcado el servicio como PAGADO, ¿Aún así deseas Forzar la Finalización del Proceso de esta Tarjeta?');
    }

    if(save){
      _terminarProceso(bloqueHtml, {'idTd': $(this).data('id'), 'idDis': $(this).data('disenio')}  );
    }

    e.stopImmediatePropagation();
  });
}

///
function _terminarProceso(bloqueHtml, dataSend) {

  _bloquearAllScreen(bloqueHtml, 'Terminando Proceso...');
  var tplProc = $.templates('#checkProcesos');
  var proc = {
    'titulo'   : 'Terminando Proceso',
    'subTi'    : 'Limpiando Registros en las Bases de Datos',
    'idElement': 'containerTerminarProcc'
  }
  $('#containerSecundary').html(tplProc.render(proc));
  $('#progress-bar').css('width', '0%');
  $('#califSanitizar').addClass('d-none');

  http(
    'post',
    global['uriBaseTarje'] +'/terminar-proceso-tarjeta/',
    function(resp){

      if(resp['abort']) {
        $('#'+bloqueHtml).unblock();
        return false;
      }else{
        calif = new Array();
        $('#' + bloqueHtml).remove();
        $('#containerSecundary').html(' ');
        $('#msgProccTerminado').removeClass('d-none');
      }
    }, dataSend
  );
}

///
function _sanitizarDatosGenerales(idTd, idDisenio) {

  var tplProc = $.templates('#checkProcesos');
  var proc = {
    'titulo'   : 'Sanitizando Datos',
    'subTi'    : 'Revisando Información General del Negocio',
    'idElement': 'containerSanitizarData'
  }
  $('#containerSecundary').html(tplProc.render(proc));

  $('#califSanitizar').removeClass('d-none').find('#califTotal').text( calif['total'] );
  $('#califSanitizar').find('#califTotalRes').text( 0 );
  $('.progress-bar').css('width', '0%');

  //fnc::sanitizarDatos
  _irToServer('/'+idTd+'/sanitizar-datos/').then((result) => {
    if(result['abort']) {
      var tpl = $.templates('#ptlErrorCampo');
      var lstElem = new Array();
      //Seccion de calificacion.
      var calificacion = calif['sanitizar']['max_val'];
      var resultCalif = calificacion - result['body'].length;
      var sumaCalif = 0;
      // fin de calificacion
      for (var i = 0; i < result['body'].length; i++) {
        result['body'][i]['idTd'] = idTd;
        if(result['body'][i]['status'] == 'warning') {
          sumaCalif = sumaCalif + 0.5;
        }
        if(result['body'][i]['status'] == 'error') {
          calif['sanitizar']['status'] = false;
        }
        lstElem.push(tpl.render( result['body'][i] ));
      }
      calif['sanitizar']['value'] = (resultCalif + sumaCalif);
      $('#califSanitizar').find('#califTotalRes').text( calif['sanitizar']['value'] );

      $('#containerSecundary').find('#containerSanitizarData').html(lstElem);

      // Encender los click para editar
      $('#containerSecundary').find('#containerSanitizarData').find('a[id^=btnEdit]').on('click', function(e){
        e.preventDefault();

        var txt = prompt('EDITAR EL DATO de ' + $(this).data('campo').toUpperCase() , $('#' +'getValueCampo_'+ $(this).data('campo')).text());
        if(txt != null) {
          var dataSend = {
            'id' : $(this).data('id'),
            'val': txt,
            'campo': $(this).data('campo')
          }
          _sendDataForEditCampo(dataSend, '/editar-campo/', 'bloque'+$(this).data('campo'));
        }
        e.stopImmediatePropagation();
      });

      tpl = lstElem = undefined;
    }else{
      calif['sanitizar']['value'] = calif['sanitizar']['max_val'];
      $('#califSanitizar').find('#califTotalRes').text( calif['sanitizar']['value'] );
      $('#containerSecundary').find('#containerSanitizarData').html( _getSatisfecho('Datos Generales') );
    }

    _setProgresoDeCheck(idTd, 'sanitizar');
    _checkSCategos(idTd, idDisenio);
  });
}

///
function _checkSCategos(idTd, idDisenio) {

  var tplProc = $.templates('#checkProcesos');
  var proc = {
    'titulo'   : 'Categorías y SubCategorías',
    'subTi'    : 'Revisando las categorías del negocio.',
    'idElement': 'containerCategosData'
  }
  $('#containerSecundary').append(tplProc.render(proc));

  _irToServer('/'+idTd+'/check-categos/').then((result) => {

    if(result['abort']){
      //Seccion de calificacion.
      var valores = 0;
      if(result['body']['scatego'] == 'error') {
        calif['categos']['status'] = false;
      }else{
        valores = valores + 1;
      }
      if(result['body']['txtDiv'] == '0') {
        calif['categos']['status'] = false;
      }else{
        valores = valores + 1;
      }
      if(valores > 0) {
        calif['categos']['value'] = valores;
        var valAct = $('#califSanitizar').find('#califTotalRes').text();
        valAct = parseFloat(valAct) + calif['categos']['value'];
        $('#califSanitizar').find('#califTotalRes').text( valAct );
      }
      // fin de calificacion
      var tpl = $.templates('#ptlFrmCategos');
      var data = {
        'idTd'    : idTd,
        'queVende': result['msg']['queVende'],
        'txtDiv'  : (result['txtDiv'] != '0') ? result['txtDiv'] : ''
      }
      tpl = tpl.render(data)
      $('#containerSecundary').find('#containerCategosData').html(tpl);

      // Encendemos los cambios del select para CATEGORIAS.
      $('#containerSecundary').find('#containerCategosData').find('#frmCategosErr_cat').on('change', function() {
        if($(this).val() == 'buscar') {
          _getCategorias('/get-categos/', 'frmCategosBlock').then((htmlOpts) => {

            $('#containerSecundary').find('#containerCategosData').find('#frmCategosErr_cat').html(htmlOpts);

          });
        }else{
          if($(this).val() != 'aqui') {

            _getCategorias('/' + $(this).val() + '/get-subcategos/', 'frmCategosBlock').then((htmlOpts) => {
              $('#containerSecundary').find('#containerCategosData').find('#frmCategosErr_scat').html(htmlOpts);
            });

          }
        }
      });

      // Encendemos el click para editar las palabras CLAVES
      $('#containerSecundary').find('#containerCategosData').find('#btnEditPalClas').on('click', function(e) {
        e.preventDefault();
        var txt = prompt('EDITAR PALABRAS CLAVES', $('#getPalClas').text());
        if(txt != null) {
          $('#getPalClas').text(txt);
        }
        e.stopImmediatePropagation();
      });

      // Encendemos el click para editar las palabras CLAVES
      $('#containerSecundary').find('#containerCategosData').find('#frmCategosErr').on('submit', function(e) {
        e.preventDefault();
        var valores = $(this).serializeArray();
        var dataSend = {'id': $(this).data('id'), 'scat':'', 'div':'', 'palclas':''};
        for (var i = 0; i < valores.length; i++) {
          var campo = valores[i]['name'].replace('frmCategosErr[', '');
          campo = campo.replace(']', '');
          if(campo != 'cat'){
            dataSend[campo] = valores[i]['value'];
          }
        }
        dataSend['palclas'] = $('#containerSecundary').find('#containerCategosData').find('#getPalClas').text();
        var isValid = _validarCategos(dataSend);
        if(isValid){
          _sendFrmOfCategos(dataSend);
        }
        e.stopImmediatePropagation();
      });

    }else{
      calif['categos']['value'] = calif['categos']['max_val'];
      var valAct = $('#califSanitizar').find('#califTotalRes').text();
      valAct = parseFloat(valAct) + calif['categos']['value'];
      $('#califSanitizar').find('#califTotalRes').text( valAct );

      $('#containerSecundary').find('#containerCategosData').html(_getSatisfecho('Categorías'))
    }

    _setProgresoDeCheck(idTd, 'categos');
    _checkFraquicia(idTd, idDisenio);
  });

}

///
function _checkFraquicia(idTd, idDisenio) {

  var tplProc = $.templates('#checkProcesos');
  var proc = {
    'titulo'   : 'Franquicias',
    'subTi'    : 'Revisando la pertenencia a una Franquicia.',
    'idElement': 'containerFranq'
  }
  $('#containerSecundary').append(tplProc.render(proc));

  _irToServer('/'+idTd+'/check-franquicia/').then((result) => {
    if(result['abort']){
      //Seccion de calificacion.
      var valores = 0;
      if(!result['body']) {
        calif['franq']['status'] = false;
      }else{
        valores = valores + 1;
      }
      if(valores > 0) {
        calif['franq']['value'] = valores;
        var valAct = $('#califSanitizar').find('#califTotalRes').text();
        valAct = parseFloat(valAct) + calif['franq']['value'];
        $('#califSanitizar').find('#califTotalRes').text( valAct );
      }
      // fin de calificacion
      tplProc = $.templates('#ptlCheckFranquicias');

      $('#containerSecundary')
        .find('#containerFranq')
        .html( tplProc.render({'franqs':result['msg']}) )
        .find('#frmFranqs')
        .on('submit', function(e){
          e.preventDefault();

          var data = $(this).serializeArray();
          if(data[0]['value'] != 0 || data[0]['value'] != '0'){

            _saveFranquicia( idTd, data[0]['value'] );

          }else{
            alert('Selecciona una Franquicia, por favor.');
            return false;
          }

          e.stopImmediatePropagation();
      });
    }else{
      calif['franq']['value'] = calif['franq']['max_val'];
      var valAct = $('#califSanitizar').find('#califTotalRes').text();
      valAct = parseFloat(valAct) + calif['franq']['value'];
      $('#califSanitizar').find('#califTotalRes').text( valAct );
      $('#containerSecundary').find('#containerFranq').html( _getSatisfecho('Franquicia') );
    }

    _setProgresoDeCheck(idTd, 'franq');
    _checkEnlaces(idTd, idDisenio);
  });
}

///
function _checkEnlaces(idTd, idDisenio) {

  var tplProc = $.templates('#checkProcesos');
  var proc = {
    'titulo'   : 'Enlaces Principales',
    'subTi'    : 'Checando la integridad de los enlaces.',
    'idElement': 'containerEnlaces'
  }
  $('#containerSecundary').append(tplProc.render(proc));

  _irToServer('/'+idTd+'/check-enlaces/').then((result) => {

    if(result['abort']){
      console.log(result);
    }else{
      calif['enlaces']['value'] = calif['enlaces']['max_val'];
      var valAct = $('#califSanitizar').find('#califTotalRes').text();
      valAct = parseFloat(valAct) + calif['enlaces']['value'];
      $('#califSanitizar').find('#califTotalRes').text( valAct );
      $('#containerSecundary').find('#containerEnlaces').html(_getSatisfecho('Enlaces Principales'));
    }

    _setProgresoDeCheck(idTd, 'enlaces');
    _getTarjetaByIdTd(idTd, idDisenio);
  });
}

///
function _saveFranquicia(idTd, idFranq) {

  _bloquearAllScreen('containerFranq', 'Guardando...');

  http(
    'get',
    global['uriBaseTarje'] + '/' + idTd + '/' + idFranq +'/set-franquicia/',
    function(resp){

      $('#containerFranq').unblock();
      if(resp['abort']) {
        alert('ERROR | ALERTA\n\n' + resp['body']);
        return false;
      }else{
        $('#containerSecundary').find('#containerFranq').html( _getSatisfecho('Franquicia') );
      }
    }
  );
}

///
function _getTarjetaByIdTd(idTd, idDisenio) {

  var tplProc = $.templates('#checkProcesos');
  var proc = {
    'titulo'   : 'Tarjeta Interactiva',
    'subTi'    : 'Checando la integridad de la tarjeta interactiva y sus elementos.',
    'idElement': 'containerTd'
  }
  $('#containerSecundary').append(tplProc.render(proc));

  _irToServer('/'+idTd+'/get-tarjeta-by-idtd/').then((result) => {

    if(!result['abort']){

      //Revisamos si existe fisicamente.
      if(result['body']['td'].lastIndexOf('.pdf')) {
        http(
          'get',
          global['uriBaseSelf'] + '/tds/gestion/' + result['body']['td'] + '/check-existencia-elementos-tds/',
          function(resp){

            if(resp['abort']) {
              tplProc = $.templates('#ptlErrorTdImg');
              var valores = 0;
              if(resp['body']['img']) {
                valores = valores + 1;
              }else{
                calif['tds']['status'] = false;
              }
              if(resp['body']['td']) {
                valores = valores + 1;
              }else{
                calif['tds']['status'] = false;
              }
              if(valores > 0) {
                calif['tds']['value'] = valores;
                var valAct = $('#califSanitizar').find('#califTotalRes').text();
                valAct = parseFloat(valAct) + calif['tds']['value'];
                $('#califSanitizar').find('#califTotalRes').text( valAct );
              }
              //Hidratmos HTML y encendemos click de REPARAR.
              $('#containerSecundary').find('#containerTd').html(tplProc.render(resp['body'])).find('#btnRepararImg').on('click', function(e){
                e.preventDefault();
                _buildImgParaElPdf(result);
                e.stopImmediatePropagation();
              });
              _setProgresoDeCheck(idTd, 'tds');
            }
          }
        );
      }else{
        console.log('Error no cuenta con tarjeta interactiva');
      }
    }else{
      console.log('No cuenta con Tarjeta Registrada');
    }
  });
}

///
function _buildImgParaElPdf(resultServer) {

  _bloquearAllScreen('blockTdImg', 'Reparando...');
  http(
    'get',
    global['uriBaseSelf'] + '/bcmx/tds/panel/' + resultServer['body']['td'] + '/build-img-from-pdf/',
    function(result){
      if(result['result'] == 'Listo!!') {
        resultServer['body']['img'] = true;
        $('#containerSecundary').find('#containerTd').html(tplProc.render(resultServer['body']));
      }
      $('#blockTdImg').unblock();
    }
  );
}

///
function _sendDataForEditCampo(dataSend, url, elementHtml) {

  _bloquearAllScreen(elementHtml, 'Guardando...');
  http(
    'post',
    global['uriBaseTarje'] + url,
    function(resp){
      $('#'+elementHtml).unblock();
      if(resp['abort']) {
        alert(resp['body']);
        return false;
      }else{
        $('#containerSecundary').find('#containerSanitizarData').find('#'+elementHtml).remove();
        if(dataSend['campo'] == 'costo'){
          $('#containerTds').find('#bloqueCosto'+dataSend['id']).text(dataSend['val']);
        }
      }
    }, dataSend
  );
}

///
function _sendFrmOfCategos(dataSend) {

  _bloquearAllScreen('frmCategosBlock', 'Guardando...');
  http(
    'post',
    global['uriBaseTarje'] + '/editar-categos/',
    function(resp){
      $('#frmCategosBlock').unblock();
      if(resp['abort']) {
        alert(resp['body']);
        return false;
      }else{
        $('#containerSecundary').find('#containerCategosData').html(_getSatisfecho('Categorías'));
      }
    }, dataSend
  );
}

///
function _validarCategos(dataSend) {

  var prefix = '!CATEGORIAS! :: ERROR\n\n';

  if(dataSend['scat'] == '0' || dataSend['scat'] == 0){
    alert(prefix + 'Es necesario que selecciones una Sub Categoría para el Negocio.');
    return false;
  }
  if(dataSend['div'] == '0' || dataSend['div'].length == 0){
    alert(prefix + 'Es necesario que coloques una División para el Negocio.');
    return false;
  }
  if(dataSend['div'].length < 4){
    alert(prefix + 'Se más específico en la División para el Negocio.');
    return false;
  }
  if(dataSend['div'].indexOf(',') != -1){
    alert(prefix + 'No coloques más de una palabra por favor.');
    return false;
  }
  var pedazos = dataSend['div'].split(' ');
  if(pedazos.length > 1) {
    for (var i = 0; i < pedazos.length; i++) {
      if(pedazos[i].length > 3){
        alert(prefix + 'No coloques más de una palabra por favor.');
        return false;
      }
    }
  }
  pedazos = dataSend['palclas'].split(',');
  if(pedazos.length <= 3){
    alert(prefix + 'Coloca más palabras claves, separadas por comas.');
    return false;
  }
  return true;
}

/// vamos por las Categorias
function _getCategorias(url, elementHtml) {

  _bloquearAllScreen(elementHtml, 'Cargando...');
  return new Promise((resolve) => {

    http(
      'get',
      global['uriBaseCats'] + '/c' + url,
      function(resp){
        $('#'+elementHtml).unblock();
        if(resp.length > 0) {
          var lstElem = new Array();
          if(url == '/get-categos/'){
            lstElem.push($('<option/>').text('Lista de Categorías').val('0'));
          }
          for (var i = 0; i < resp.length; i++) {
            var opt = $('<option/>').text(resp[i]['c_nombre']).val(resp[i]['c_id']);
            lstElem.push(opt);
          }
          resolve(lstElem);
        }else{
          resolve($('<option/>').text('Sin Categorías').val('0'));
        }
      }
    );
  });
}

///
function _irToServer(url) {

  return new Promise((resolve) => {
    http(
      'get',
      global['uriBaseTarje'] + url,
      function(resp){
        resolve(resp);
      }
    );
  });
}

/// Movemos el progress en cada paso
function _setProgresoDeCheck(idTd, paso) {

  var pasos = progressPasos.length;
  var estoyEn = progressPasos.indexOf(paso);
  if(estoyEn > -1) {
    estoyEn = estoyEn +1;
    var partes = 100/pasos;
    var marck = partes * estoyEn;
    $('.progress-bar').css({'width': marck+'%', 'height':'3px'});

    if(marck >= 100) {

      futureCheckStatusMark().then((resp) => {
        if(resp) {
          _marcarComoRevisada(idTd);
        }
      })
    }
  }
}

///
function futureCheckStatusMark() {

  return new Promise((resolve) => {
    for (var variable in calif) {
      if (calif.hasOwnProperty(variable)) {
        if(calif[variable].hasOwnProperty('status')) {
          if(!calif[variable]['status']){
            resolve(false);
          }
        }
      }
    }
    resolve(true);
  });
}

///
function _marcarComoRevisada(idTd) {

  var total = parseFloat( $('#califTotal').text() );
  var calificacion = parseFloat( $('#califTotalRes').text() );
  var res = ((calificacion * 100) / total);
  if(res > 90){
    setTimeout(function () {
      $('#bloqueCard' + idTd).addClass('border border-success');
      $('#isChecked' + idTd).removeClass('d-none');
    }, 2000);
  }
}

///
function _getSatisfecho(titulo) {
  return '<div class="card p-2"><small class="text-secondary"><i class="fas fa-check text-primary"></i> <span class="font-weight-bold text-success">'+titulo+'</span> >> Resultado Satisfactorio</small></div>';
}

/// Bloqueamos toda la pantalla
function _bloquearAllScreen(elemento, msg) {
  var load = '<div class="text-center"><div class="spinner-border text-warning" role="status"></div> <small class="d-block text-light">'+msg+'</small></div>';
  $('#'+elemento).block({ message: load, css: { border:'none', backgroundColor:'transparent' }});
}

///
function _getCalifProcesos() {

  calif = {
    'sanitizar': {
      'max_val': 7,  'value'  : 0, 'status':true, 'titulo': 'Sanitizando Datos'
    },
    'categos': {
      'max_val': 2,  'value'  : 0, 'status':true, 'titulo': ''
    },
    'franq': {
      'max_val': 1,  'value'  : 0, 'status':true, 'titulo': ''
    },
    'enlaces': {
      'max_val': 3,  'value'  : 0, 'status':true, 'titulo': ''
    },
    'tds': {
      'max_val': 2,  'value'  : 0, 'status':true, 'titulo': ''
    },
    'total': 0,
    'idSel':0
  };
  return calif;
}

import './app.js';
import globals from './globals';
import http from './http';

$(document).ready(function(){

  var global = globals('getGlobals');
  _getCantidades();

  /// fnc ModalGetTdsNewsMys
  $('#modalLstSolicitudesDisenio').on('shown.bs.modal', function (event) {
    var modal = $(this);
    var button = $(event.relatedTarget);
    var htmlCargando = $.templates('#cargando');
    var tipoGet = button.data('tipo');
    var idDiseniador = $('#idU').data('id');

    // Ir por la lista de Nuevos Diseños.
    var uri = global.uriBasePanel + '/'+idDiseniador+'/get-tds/'+tipoGet+'/';
    http('GET', uri, function(data){

      var tmpl = $.templates('#lstTdsNews');
      modal.find('.modal-title').text(button.data('titulo'));
      modal.find('.modal-body').html('<div class="bg-light overflow-auto p-2" style="max-height: 350px;">'+tmpl.render(data)+'</div>');

      // Click para seleccionar tarjeta digital
      modal.find('a[id^=td]').on('click', function(e){
        e.preventDefault();
        var terminarProceso = $('#terminarProceso');
        if(!terminarProceso.hasClass('d-none')){
          terminarProceso.addClass('d-none');
        }
        terminarProceso = undefined;
        $('#msgTdGral').text('Visualizando un Diseño Nuevo, Tomalo para procesarlo');
        // Colocar la data en el panel.
        printTarjetaInScreen(data[$(this).data('idtd')]);
        data = null;
        $('#modalLstSolicitudesDisenio').modal('hide');
        e.stopImmediatePropagation();
      });
    }); //fin del HTTP.

    modal.find('.modal-title').text('Buscando Diseños');
    modal.find('.modal-body').html(htmlCargando.render());
  });

  /// fnc ModalGetTdsNuevos
  $('#modalDownloadFotoDisenio').on('shown.bs.modal', function (event) {
    var modal = $(this);
    var button = $(event.relatedTarget);
    var htmlCargando = $.templates('#cargando');
    modal.find('.modal-body').html(htmlCargando.render());

    var uriFoto = global.dominio +'/'+ global.pathImgsDisNews + '/' + button.data('nombre');
    modal.find('.modal-body').html('<img width="400" src="' +uriFoto+ '" />');
    var uri = global.dominio + '/downloads/zmpanel/panel/'+button.data('nombre')+'/download-foto-disenio/';

    modal.find('#dowloadFoto').attr('href', uri);
  });

  /// terminar el diseño
  $('#terminarProceso').click(function(e){
    e.preventDefault();
    var titPage = $('#msgTdGral').text();
    if(titPage.indexOf('buscomex') == -1) {
      alert('No se ha detectado un PDF terminado, asegurate de ello antes de terminar el proceso por favor..');
      return false;
    }

    var acc = confirm('Este Diseño se marcará como terminado y desaparecerá de tus pendientes.\n\n¿Estás segur@ de hacerlo?.');
    if(!acc){ return false; }

    var idDisenio = $('#contenedorDelPanel').find('#idDisSelect').data('iddis');

    var uri = global.uriBasePanel + '/terminar-proceso-disenio/';
    var load = '<div class="text-center"><div class="spinner-border text-warning" role="status"></div> <small class="d-block text-light">Terminando</small></div>';
    $('#containerMain').block({ message: load, css: { border:'none', backgroundColor:'transparent' }});

    http('POST', uri, function(data){
      if(!data['abort']){
        window.location.href = window.location.href;
      }else{
        $('#containerMain').unblock();
        alert(data['body']);
      }
    }, {'id':idDisenio}); //fin del HTTP.
    e.stopImmediatePropagation();
  });

  /// Colocar la data del diseño seleccionado en el modal dentro del panel.
  function printTarjetaInScreen(dataTd) {

    var acciones = {
      'cortarTxt': function(txt) {
        if(txt.length > 39) {
          txt = txt.substring(0, 36);
          return txt + '...';
        }else{
          return txt;
        }
      },
      'orderQueVende': function(txt) {
        var lista = txt.split(',');
        if(lista.length > 0) {
          for (var i = 0; i < lista.length; i++) {
            lista[i] = $.trim(lista[i]);
          }
          return lista.join(', ');
        }
        return txt;
      }
    };

    var tmpl = $.templates('#panelDisenio');
    var idContenedor = '#contenedorDelPanel';
    $(idContenedor).html(tmpl.render(dataTd, acciones));

    // Colocamos las imagenes encontradas.
    _colocarImagenes(idContenedor, dataTd['ds_lstFoto']);

    //Encender Click para copiar los links
    $(idContenedor).find('a[id^=copyar]').on('click', function(e){
      e.preventDefault();
      copiarAlPortapapeles(this.id);
      $('#'+this.id).addClass('text-muted');
      e.stopImmediatePropagation();
    });

    if(dataTd['em_id'] > 0){
      dataTd = {'nombreFile':dataTd['td_td']};
      _printDataDisenioTomado(dataTd);
    }else{
      // Click para tomar el diseño de la digital
      $(idContenedor).find('#takeDisenio').on('click', function(e){
        e.preventDefault();
        var data = {
          'idTd': $(this).data('idtd'),
          'nombreEmpresa': $(this).data('nemp').toLowerCase(),
        };
        $(this).addClass('d-none');
        $(idContenedor).find('#divProcesandoTake').removeClass('d-none');
        _tomarDisenio(data);
        e.stopImmediatePropagation();
      });
    }
  }

  /// nombreFile
  function _tomarDisenio(data) {

    $('#msgTdGral').text('Archivo PDF aún Inexistente.');
    data['idDiseniador'] = $('#idU').data('id');
    // Marcamos cantidades
    var cantNuevos = $('#setCantNews').text();
    cantNuevos = parseInt(cantNuevos) - 1;
    $('#setCantNews').text( (cantNuevos < 0) ? '0' : cantNuevos);
    var cantMios = $('#setCantMios').text();
    cantMios = parseInt(cantMios) + 1;
    $('#setCantMios').text(cantMios);
    var cargando = $.templates('#cargando');
    $('#disTomadoContainer').find('#containerQrPeq').html(cargando.render());

    // tomando el diseño
    var uri = global.uriBasePanel + '/tomar-disenio/';
    http('POST', uri, function(data){
      $('#divProcesandoTake').addClass('d-none');
      _printDataDisenioTomado(data);
      data = undefined;
    }, data); //fin del HTTP.
    data = undefined;
  }

  ///
  function _printDataDisenioTomado(data) {

    $('#takeDisenio').addClass('d-none');
    var acciones = {
      'nombreCut': function(nombreFile) {
        return (nombreFile.length > 29) ? nombreFile.substring(0, 29) + '...' : nombreFile;
      }
    };

    var tmp = $.templates('#disTomado');
    $('#contenedorDelPanel').find('#disTomadoContainer').html(tmp.render(data, acciones));

    // subimos el archivo final PDF
    $('#contenedorDelPanel').find('#frmUpPdf').on('submit', function(e){
        e.preventDefault();
        _subirPDFinal(this);
        e.stopImmediatePropagation();
    });

    // Copiar el nombre del archivo.
    $('#disTomadoContainer').find('#copiarNombreFile').on('click', function(e){
      e.preventDefault();
      copiarAlPortapapeles('copiarNombreFile');
      $(this).addClass('text-muted');
      e.stopImmediatePropagation();
    });

    var objLinkDownload = $('#contenedorDelPanel').find('#downloadQrLink');
    var path = objLinkDownload.attr('href');
    path = path.replace('__uri__', data['nombreFile']);
    objLinkDownload.attr('href', path);
    objLinkDownload.removeClass('d-none');
    objLinkDownload = undefined;

    // Ir por el QR pequeño.
    var uri = $('#contenedorDelPanel').data('genqr');
    uri = uri.replace('__uri__', data['nombreFile']);
    var noF = data['nombreFile'];
    http('GET', uri, function(data){
      var img = $('<img/>').attr('src', data['qr']).css({'height':200});
      $('#contenedorDelPanel').find('#containerQrPeq').html(img);
      _determinarTitulo(noF);
      data = undefined;
    });
    data = undefined;
  }

  ///
  function _subirPDFinal(frmPdf) {

    var htmlCargando = $.templates('#cargando');
    var htmlFrm = $('#containerFrmUp').html();
    $('#containerFrmUp').html(htmlCargando);

    var formData = new FormData(frmPdf);
    var uri = $('#getPathToUpPdf').data('url');
    var nombreFile = $('#copiarNombreFile').data('url');
    uri = uri.replace('__url__', nombreFile);

    $.ajax({
      url: uri,
      type: "post",
      dataType: "html",
      data: formData,
      cache: false,
      contentType: false,
      processData: false
    }).done(function(res){
      var resultado = JSON.parse(res);
      if(resultado['result'] != 'ok') {
        $('#containerFrmUp').html(resultado['result']);
      }else{
        _determinarTitulo(nombreFile);
        $('#containerFrmUp').html(htmlFrm);
        htmlFrm = undefined;
      }
    });
  }

  ///
  function _colocarImagenes(contenedor, imagenes) {

    var totImg = 4;
    var lstFotos = new Array();

    if(imagenes.length < totImg){
      var rota = (totImg - imagenes.length);
      for (var i = 0; i < rota; i++) {
        lstFotos.push('0');
      }
      imagenes = imagenes.concat(lstFotos);
      lstFotos = new Array();
    }
    var acciones = {
      'path': function(foto) {
        return global.dominio +'/'+ global.pathImgsDisNews + '/' + foto;
      }
    }

    var plFoto = $.templates('#icoFotos');
    for (var i = 0; i < imagenes.length; i++) {
      lstFotos.push(plFoto.render({'nombre':imagenes[i]}, acciones));
    }
    if(lstFotos.length > 0) {
      $(contenedor).find('#contentFotos').html('').append(lstFotos);
    }
    lstFotos = undefined;
  }

  /// copiar al portapapeles
  function copiarAlPortapapeles(id_elemento) {
    var $temp = $("<input>")
    $("body").append($temp);
    $temp.val($('#'+id_elemento).data('url')).select();
    document.execCommand("copy");
    $temp.remove();
  }

  /// Ir por las cantidades de diseños nuevos y los que tiene el diseñador acualmente
  function _getCantidades() {

    http('GET', global.uriBasePanel + '/' + $('#idU').data('id') +'/get-cant-tds/', function(data){
      $('#setCantNews').html(data['nuevos']);
      $('#setCantMios').html(data['mios']);
      data = undefined;
    });
  }

  /// Vemos si existe el PDF en fisico del registro visualizado
  function _determinarTitulo(nombreFile) {

    var uri = $('#getPathasPdf').data('url');
    uri = uri.replace('__uri__', nombreFile);

    $('#msgTdGral').text('Buscando Tarjeta Digital Fisica');
    http('GET', uri, function(data){
      if(data['path'].indexOf('buscomex') != -1){
        var a = $('<a/>').addClass('text-decoration-none text-success').text(data['path']).attr({'href': data['path'], 'target': '_blank'});
        $('#msgTdGral').html(a);
        $('#terminarProceso').removeClass('d-none');
      }else{
        $('#msgTdGral').text(data['path']);
        var terminarProceso = $('#terminarProceso');
        if(!terminarProceso.hasClass('d-none')){
          terminarProceso.addClass('d-none');
        }
        terminarProceso = undefined;
      }
    }); //fin del HTTP.
    return;
  }

});

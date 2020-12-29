import './styles/app.scss';
const $ = require('jquery');
require('jsrender')($);
require('bootstrap');
$.views.settings.delimiters("<%", "%>");

$(document).ready(function(){

  if(window.location.href.lastIndexOf('franquicias/')) {
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
  }
});

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

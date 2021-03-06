export default function(nombreFnc) {

  switch (nombreFnc) {
    case 'getGlobals':
      return getGlobals();
      break;
    case 'getVersion':
      return getVersion();
      break;
    default:
      return 'err';
  }

  //
  function getGlobals() {

    const env = $('#getEnv').data('env');
    const protocolo = (env == 'dev') ? 'http://' : 'https://';
    const base      = (env == 'dev') ? 'localhost:8000' : 'dbzm.info';
    const baseSelf  = (env == 'dev') ? 'localhost:8001' : 'buscomex.com';
    const dominio   = protocolo + base;
    return {
      'protocolo'        : protocolo,
      'base'             : base,
      'dominio'          : dominio,
      'uriBaseDb'        : dominio,
      'uriBaseSelf'      : protocolo + baseSelf,
      'uriBasePanel'     : dominio + '/apis/zmpanel/panel',
      'uriBaseLocs'      : dominio + '/apis/zmpanel/localidades',
      'uriBaseCats'      : dominio + '/apis/zmpanel/categos',
      'uriBaseFranq'     : dominio + '/apis/zmpanel/franquicias',
      'uriBaseTarje'     : dominio + '/apis/zmpanel/tarjetas',
      'pathImgsDisNews'  : (env == 'dev') ? 'bcmx_tds/fotos_for_disenio' : 'bcmx_tds/fotos_for_disenio',
    };
  }

  //
  function getVersion() {
    return '1.0.0';
  }
}

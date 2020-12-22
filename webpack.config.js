var Encore = require('@symfony/webpack-encore');

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    .setOutputPath('public_html/build/')
    .setPublicPath('/build')

    .addEntry('app', './assets/app.js')
    .addEntry('http', './assets/libs/http.js')
    .addEntry('panelDisenio', './assets/tds/panel-disenio.js')
    .addEntry('franq', './assets/generales/franq.js')
    .addEntry('localidades', './assets/generales/localidades.js')
    .addEntry('jqblock', './assets/jquery.blockUI.js')

    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = 3;
    })
    .enableSassLoader()
    .autoProvidejQuery()
;

module.exports = Encore.getWebpackConfig();

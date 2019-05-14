"use strict";

angular.module("ngapp", [ "ui.router", "ngMaterial", "ngCordova", "ngStorage", "ngSanitize", "ngMessages", "ng.deviceDetector" ])
// ngTouch is No Longer Supported by Angular-Material

.run(function($rootScope, $cordovaDevice, $state, $cordovaCamera){
    //, $cordovaStatusbar
    //, $cordovaPushV5
    $rootScope.$state = $state;
    document.addEventListener("deviceready", function () {

        console.log("deviceready");

        //$cordovaStatusbar.overlaysWebView(false); // Always Show Status Bar
        //$cordovaStatusbar.styleHex('#E53935'); // Status Bar With Red Color, Using Angular-Material Style
        //window.plugins.orientationLock.lock("portrait");

        /*cordova.plugins.backgroundMode.enable();
        cordova.plugins.backgroundMode.onactivate = function() {
            //La función
            //Añadir un setTimeout(funcion, 10000); para hacer que la función se ejecute cada x segundos
            console.log('backgroundMode');
        };*/
        // cerrar la app con atras del cel, si estoy en la home
        /*if ( $state.current.title == 'Home' ) {
            document.addEventListener("backbutton", function () {
                if (confirm("Realmente desea salir de la aplicación?")) {
                    navigator.app.exitApp();
                }
            }, false);
        }*/
    }, false);
    // Hijack Android Back Button (You Can Set Different Functions for Each View by Checking the $state.current)
    document.addEventListener("backbutton", function (e) {
        //if ( $state.is('init') ) {
        if ( $state.current.title == "Home" ) {
            if (confirm("Realmente desea salir de la aplicación?")) {
                navigator.app.exitApp();
            }
        } else {
            //e.preventDefault();
            navigator.app.backHistory();
        }
    }, false);
})

.config(function($mdThemingProvider, $mdGestureProvider, $compileProvider) { // Angular-Material Color Theming
  $mdGestureProvider.skipClickHijack();

  $mdThemingProvider.theme('default')
    .primaryPalette('cyan')
    .accentPalette('blue');

    // Hijack para leer las fotos de la camara y galeria
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|content):|data:image\//);
});
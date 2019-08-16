"use strict";

angular.module("ngapp").factory('Auth', function($http){
    var user;

    return{
        setUser : function(aUser){
            localStorage.setItem( 'cliente_logged', JSON.stringify(aUser) );
            user = aUser;
        },
        unsetUser : function(){
            localStorage.removeItem( 'cliente_logged' );
            user = false;
        },
        isLoggedIn : function(){
            var user = JSON.parse(localStorage.getItem( 'cliente_logged' ));

            // actualizo los datos del cliente
            if ( user != false && user != null ) {
                var url = 'clientes/getClientes/id/'+ user.id +'/format/json';
                $http.get(base_url_api + url).success(function (response) {
                    if ( response.return == 'success' ) {
                        localStorage.setItem( 'cliente_logged', JSON.stringify(response.data) );
                        user = response.data
                    }
                }).error(function (data) {
                    toastFactory.simpleToast(data.error, 'error-toast');
                });
            }
            return (user) ? user : false;
        },
      }
});

angular.module("ngapp").factory('deviceDetectorFactory', function(deviceDetector){
    var device = [];

    return {
        getDevice : function() {
            device.data = deviceDetector;
            device.allData = JSON.stringify(device.data, null, 2);
            return device;
        }
    }
});

angular.module("ngapp").factory('notificationFactory', function(){
    var notificacion;

    return {
        notificarWeb : function( titulo, texto, link ) {
            console.log(titulo);
            if ("Notification" in window) {
                if ( Notification.permission !== "granted" ) {
                    Notification.requestPermission();
                } else {
                    notificacion = new Notification( titulo,
                        {
                            icon: "assets/img/logo-app-mini.png",
                            tag: titulo,
                            body: texto
                        }
                    );
                    notificacion.onclick = function(){
                        window.open( base_url_app + "link");
                    }
                }
            }
        },
        notificarMobile : function( notificacionArray ) {
            cordova.plugins.notification.local.schedule(notificacionArray);
        }
    }
});

angular.module("ngapp").controller("AppController", function(shared, $state, $scope, $mdSidenav, $mdComponentRegistry, notificationFactory, deviceDetectorFactory, $http, $interval, Auth){

    $scope.cliente_logged = null;
    $scope.logout = function ()
    {
        Auth.unsetUser();
        $state.go('main');
    }
    $scope.isLogged = function ()
    {
        var cliente_logged = Auth.isLoggedIn();
        if ( cliente_logged != false )  $scope.cliente_logged = cliente_logged;
    }
    $scope.isLogged();

    // detectar device
    $scope.device = deviceDetectorFactory.getDevice();

    // permiso notificaciones web
    if ( $scope.device.data.os == 'windows' || $scope.device.data.os == 'mac' ) {
        if ( Notification.permission !== "granted" ) {
            Notification.requestPermission();
        }
    }
    console.log($scope.device.data.os);

    $scope.notificar = function ()
    {
        notificationFactory.notificar('Prueba', 'Probando Notificacion', 'dashboard');
    }

    // buscar notificaciones
    $scope.verificarNotificaciones = function()
    {
        console.log('verificarNotificaciones');
        var url = 'ordenes/getNotificaciones/cliente/'+ $scope.cliente_logged.id +'/format/json';
        var notificacionesMobile = [];

        $http.get(base_url_api + url).success(function (response) {
            if ( response.return == 'success' ) {
                if ( response.data.length > 0 ) {
                    if ( $scope.device.data.os == 'android' || $scope.device.data.os == 'ios' ) {
                        if ( response.data.length == 1 ) {
                            notificationFactory.notificarMobile({
                                title: response.data[0].titulo,
                                text: response.data[0].texto,
                                foreground: true,
                                icon: base_url_img + "ico-app.png"
                            });
                        } else {
                            for (var i = 0; i < response.data.length; i++) {
                                var link = ( response.data[i].link != "" ) ? response.data[i].link : 'dashboard';
                                notificacionesMobile.push({id: response.data[i].id, title: response.data[i].titulo, text: response.data[i].texto, foreground: true, icon: base_url_img + "ico-app.png"});
                            }
                            notificationFactory.notificarMobile(notificacionesMobile);
                        }
                    } else {
                        for (var i = 0; i < response.data.length; i++) {
                            var link = ( response.data[i].link != "" ) ? response.data[i].link : 'dashboard';
                            return notificationFactory.notificarWeb(response.data[i].titulo, response.data[i].body, link);
                        }
                    }
                }
            }
        }).error(function (data) {
            console.log(data.error);
        });
    }

    if ( $scope.cliente_logged != null ) {
        var promise = $interval(function() { $scope.verificarNotificaciones(); }, 30000);

        $scope.$on('$destroy', function () {
            $interval.cancel(promise);
        });
    }

    $scope.auth = shared.info.auth;
    $scope.toggle = angular.noop;

    $scope.title = $state.current.title;
    $scope.currentUrl = $state.current;

    $scope.isOpen = function() { return false };

    $mdComponentRegistry
    .when("left")
    .then( function(sideNav){
        $scope.isOpen = angular.bind( sideNav, sideNav.isOpen );
        $scope.toggle = angular.bind( sideNav, sideNav.toggle );
    });

    $scope.toggleRight = function() {
        $mdSidenav("right").toggle()
            .then(function(){
        });
    };

    $scope.toggleLeft = function() {
        $mdSidenav("left").toggle()
            .then(function(){
        });
    };

    $scope.close = function() {
        $mdSidenav("right").close()
            .then(function(){
        });
    };

    $scope.goToBack = function() {
        window.history.back();
    }

    $scope.menu = [];
    $scope.menu.sidenav = [
        {id: '1', name: 'Polizas', link: 'polizas', icon: 'payment'},
        {id: '2', name: 'Siniestros', link: 'siniestros', icon: null, image: 'assets/img/ico-siniestros-grey.png'},
        {id: '3', name: 'Denuncias', link: 'denuncias', icon: 'assignment'},
        {id: '4', name: 'Asistencia Mecánica', link: 'asistencia', icon: null, image: 'assets/img/ico-asistencia-grey.png'},
        {id: '5', name: 'Mensajes', link: 'mensajes', icon: 'message'},
        {id: '6', name: 'Notificaciones', link: 'notificaciones', icon: 'notifications'},
        {id: '7', name: 'Beneficios', link: 'beneficios', icon: null, image: 'assets/img/ico-beneficios-grey.png'},
        {id: '8', name: 'Mi Perfil', link: 'profile', icon: 'person'}
    ];
    $scope.menu.cliente = [
        {id: '1', name: 'Polizas', link: 'polizas', icon: 'payment'},
        {id: '2', name: 'Siniestros', link: 'siniestros', icon: null, image: 'assets/img/ico-siniestros.png'},
        {id: '3', name: 'Asistencia Mecánica', link: 'asistencia', icon: null, image: 'assets/img/ico-asistencia.png'},
        {id: '4', name: 'Mensajes', link: 'mensajes', icon: 'message'},
        {id: '5', name: 'Notificaciones', link: 'notificaciones', icon: 'notifications'},
        {id: '6', name: 'Beneficios', link: 'beneficios', icon: null, image: 'assets/img/ico-beneficios.png'}
    ];
    $scope.menu.siniestro = [
        {id: '1', name: 'Accidente o Choque', icon: 'directions_car'},
        {id: '2', name: 'Daños en Vehículo', icon: 'directions_car'},
        {id: '3', name: 'Robo o Hurto', icon: 'pan_tool'},
        {id: '4', name: 'Incendio', icon: 'whatshot'},
        {id: '5', name: 'Granizo', icon: 'local_car_wash'},
        {id: '6', name: 'Inundación', icon: 'waves'}
    ];
    $scope.menu.poliza = [
        {id: '1', name: 'Polizas', link: 'polizas', icon: 'payment'},
        {id: '2', name: 'Autos', link: 'autos', icon: 'directions_car'}
    ];
    $scope.goToLink = function( page ) {
        $state.go(page);
        $scope.close()
    }
    $scope.goToPage = function( page ) {
        $state.go(page);
    }
    $scope.refresh = function() {
        location.reload();
    }
});

angular.module("ngapp").controller("LoginController", function(shared, $state, $scope, $mdSidenav, $http, $timeout, $mdComponentRegistry, toastFactory, Auth){

    $scope.isLogged = function ()
    {
        var cliente_logged = Auth.isLoggedIn();
        if ( cliente_logged != false )  $state.go('dashboard');
    }
    $scope.isLogged();

    // vars
    $scope.registroSubmit = null;
    $scope.registroSuccess = null;
    $scope.registro = {};
    $scope.registro.solicitante = null;
    $scope.registro.solicitanteResponse = null;
    $scope.registro.tipo = 1;

    $scope.loginSuccess = true;
    $scope.login = {};
    $scope.cliente_logged = null;

    // botones
    $scope.btnVerificar = false;
    $scope.btnRegistrar = false;

    $scope.registrar = function()
    {
        $scope.btnRegistrar = true;
        var url = 'login/registro/format/json';

        var dataObj = {
            post: $scope.registro
        };

        $http.post(base_url_api + url, dataObj).success(function (response) {
            //console.log(response);
            if ( response == 'success' ) {
                $scope.registroSuccess = true;
            } else if ( response == 'existe' ) {
                toastFactory.simpleToast('El Cliente ya se encuentra registrado', 'error-toast');
            } else {
                toastFactory.simpleToast('Error Inesperado', 'error-toast');
            }
            $scope.btnRegistrar = false;
        }).error(function (data) {
            toastFactory.simpleToast(data.error, 'error-toast');
            console.log(data);
            $scope.btnRegistrar = false;
        });
    }

    $scope.sigin = function()
    {
        var url = 'login/sigin/format/json';

        if ( $scope.login.email != null && $scope.login.pass != null )
        {
            var dataObj = {
                post: $scope.login
            };
            $http.post(base_url_api + url, dataObj).success(function (response)
            {
                if ( response.return == 'success' ) {
                    $scope.loginSuccess = true;
                    $scope.cliente_logged = response.user;

                    // guardo en session
                    Auth.setUser(response.user);

                    // redirect
                    $state.go("dashboard");
                } else {
                    toastFactory.simpleToast(response, 'error-toast');
                }
            }).error(function (data) {
                toastFactory.simpleToast(data, 'error-toast');
            });
        }
        else {
            toastFactory.simpleToast('Complete los datos', 'error-toast');
        }
    }

    // forgot
    $scope.btnForgot = false;
    $scope.forgotSubmit = false;
    $scope.forgotSuccess = null;
    $scope.forgot = {};
    $scope.forgot.email = null;
    $scope.recuperar = function()
    {
        $scope.btnForgot = true;
        $scope.forgotSubmit = null;

        var url = 'login/forgot/format/json';

        if ( $scope.forgot.email != null )
        {
            var dataObj = {
                post: $scope.forgot
            };
            $http.post(base_url_api + url, dataObj).success(function (response)
            {
                if ( response.return == 'success' ) {
                    $scope.forgotSuccess = true;
                } else {
                    toastFactory.simpleToast(response.error, 'error-toast');
                }
            }).error(function (data) {
                toastFactory.simpleToast(data.error, 'error-toast');
            });
        }
        else {
            toastFactory.simpleToast('Complete los datos', 'error-toast');
        }
    }
});

angular.module("ngapp").controller("DashboardController", function(shared, $state, $scope, $http, $timeout, $mdComponentRegistry, Auth){

    // reviso si esta logueado
    $scope.isLogged = function ()
    {
        var cliente_logged = Auth.isLoggedIn();

        if ( cliente_logged == false )  $state.go('main');
        else                            $scope.cliente_logged = cliente_logged;
    }
    $scope.isLogged();

});

angular.module("ngapp").controller("ProfileController", function(shared, $state, $stateParams, $scope, $http, Auth, toastFactory){

    // reviso si esta logueado
    $scope.isLogged = function ()
    {
        var cliente_logged = Auth.isLoggedIn();

        if ( cliente_logged == false )  $state.go('main');
        else                            $scope.cliente_logged = cliente_logged;
    }
    $scope.isLogged();

    // botones y vista de la edicion del perfil
    $scope.clientePerfil = null;
    $scope.editarSubmitBtn = false;
    $scope.editarView = false;
    $scope.editarInputs = function ()
    {
        if ( $scope.editarView == false ) {
            $scope.editarView = true;
        } else {
            $scope.editarView = false;
        }
    }

    // edito los datos del cliente
    $scope.submitEditar = function ()
    {
        console.log($scope.clientePerfil);
        $scope.editarSubmitBtn = true;
        var url = 'clientes/editar/format/json';

        var dataObj = {
            post: $scope.clientePerfil
        };

        $http.post(base_url_api + url, dataObj).success(function (response) {
            //console.log(response);
            if ( response == 'success' ) {
                toastFactory.simpleToast('Cambios guardados', 'success-toast');
                // guardo en session los nuevos datos
                Auth.setUser(dataObj.post);
            } else {
                toastFactory.simpleToast('Error al querer Guardar los Datos', 'error-toast');
            }
            $scope.btnRegistrar = false;
        }).error(function (data) {
            toastFactory.simpleToast(data, 'error-toast');
        });
        $scope.editarSubmitBtn = false;
        $scope.editarView = false;
    }

    // traigo los datos del cliente seleccionado
    $scope.getCliente = function( id )
    {
        var url = 'clientes/getClientes/id/'+ id +'/format/json';

        $http.get(base_url_api + url).success(function (response) {
            if ( response.return == 'success' ) {
                $scope.clientePerfil = response.data;
            }
            else {
                toastFactory.simpleToast('No se encontro el Cliente', 'error-toast');
            }
        }).error(function (data) {
            toastFactory.simpleToast(data.error, 'error-toast');
        });
    }

    // si viene un cliente por parametro, lo tomo, sino, es el logged
    if ( $stateParams.ID != "" ) {
        $scope.getCliente($stateParams.ID);
    } else {
        var clientePerfil = $scope.cliente_logged;
        $scope.clientePerfil = $scope.cliente_logged;
    }
});

angular.module("ngapp").controller("PolizasController", function(shared, $state, $scope, $http, $timeout, toastFactory, Auth, $window){

    // reviso si esta logueado
    $scope.isLogged = function ()
    {
        var cliente_logged = Auth.isLoggedIn();

        if ( cliente_logged == false )  $state.go('main');
        else                            $scope.cliente_logged = cliente_logged;
    }
    $scope.isLogged();

    $scope.base_url_logos = base_url_logos;
    $scope.base_url_polizas = base_url_polizas;

    $scope.initFilter = function ()
    {
        $scope.searchText = '';
        $scope.menuActivoPoliza = null;
    }
    //$scope.initFilter();

    //$scope.polizas = null;
    $scope.getPolizas = function( cliente )
    {
        console.log(cliente);
        //var polizas = JSON.parse(localStorage.getItem( 'cliente_polizas' ));
        var polizas = null;

        if ( polizas == null || polizas == undefined || polizas == '' ) {

            console.log('busco las polizas con la api');
            //var url = 'clientes/getPolizas/patente/'+ cliente.patente + '/format/json';
            //var url = 'clientes/getPolizas/cliente/'+ cliente.Cli_Cod + '/format/json';
            var url = 'clientes/getAutos/clienteId/'+ cliente.id + '/format/json';

            $http.get(base_url_api + url).success(function (response) {
                if ( response.return == 'success' ) {
                    console.log(response.data);
                    $scope.polizas = response.data;
                    //localStorage.setItem( 'cliente_polizas', JSON.stringify($scope.polizas) );

                    // formateo la fecha
                    for (var i = 0; i < $scope.polizas.length; i++) {
                        $scope.polizas[i].OperVigDesde = new Date($scope.polizas[i].Oper_VigDesde);
                        $scope.polizas[i].OperVigHasta = new Date($scope.polizas[i].Oper_VigHasta);
                    }

                    $timeout(function() {
                        //$scope.polizas = polizas;
                    }, 10, false);
                }
                else {
                    toastFactory.simpleToast('No hay Polizas Vigentes para el Cliente', 'info-toast');
                }
            }).error(function (data) {
                toastFactory.simpleToast(data.error, 'info-toast');
            });

        } else {
            console.log('busco las polizas en el storage');
        }

        $timeout(function() {
            $scope.polizas = polizas;
        }, 0, false);
    }
    //$scope.getPolizas( $scope.cliente_logged.Cli_Cod );
    $scope.getPolizas( $scope.cliente_logged );

    $scope.abrirPoliza = function ( archivo )
    {
        $window.open( base_url_polizas + '/' + archivo + '.pdf' );
    }

    $scope.getAutos = function( cliente )
    {
        console.log(cliente);
        //var polizas = JSON.parse(localStorage.getItem( 'cliente_polizas' ));
        var autos = null;

        if ( autos == null || autos == undefined || autos == '' ) {

            console.log('busco los autos con la api');
            //var url = 'clientes/getAutos/patente/'+ cliente.patente + '/format/json';
            //var url = 'clientes/getAutos/cliente/'+ cliente.Cli_Cod + '/format/json';
            var url = 'clientes/getAutos/clienteId/'+ cliente.id + '/format/json';

            $http.get(base_url_api + url).success(function (response) {
                if ( response.return == 'success' ) {
                    console.log(response.data);
                    $scope.autos = response.data;
                    //localStorage.setItem( 'cliente_polizas', JSON.stringify($scope.polizas) );

                    $timeout(function() {
                        //$scope.polizas = polizas;
                    }, 10, false);
                }
                else {
                    toastFactory.simpleToast('No hay Autos del Cliente', 'info-toast');
                }
            }).error(function (data) {
                toastFactory.simpleToast(data.error, 'info-toast');
            });

        } else {
            console.log('busco los autos en el storage');
        }

        $timeout(function() {
            $scope.autos = autos;
        }, 0, false);
    }
    $scope.getAutos( $scope.cliente_logged );

    $scope.menuActivoPoliza = null;
    $scope.goToLinkId = function( id )
    {
        if ( $scope.searchText != null ) {
            $scope.initFilter();
        }
        $scope.menuActivoPoliza = id;
    }

    $scope.initAutoNew = function ()
    {
        $scope.auto_new = {};
        $scope.auto_new.patente = null;
        $scope.auto_new.flota = false;
        $scope.auto_new.Cli_Nombre = null;
    }
    $scope.initAutoNew();

    $scope.buscarPatente = function ()
    {
        if ( $scope.auto_new.patente != null || $scope.auto_new.patente != undefined || $scope.auto_new.patente != '' ) {

            console.log('busco los autos con la api');
            //var url = 'clientes/getAutos/patente/'+ $scope.auto_new.patente + '/format/json';
            if ( $scope.auto_new.flota != false ) {
                var url = 'clientes/getPolizas/patente/'+ $scope.auto_new.patente + '/flota/'+ $scope.auto_new.flota + '/format/json';
            } else {
                var url = 'clientes/getPolizas/patente/'+ $scope.auto_new.patente + '/format/json';
            }

            $http.get(base_url_api + url).success(function (response) {
                if ( response.return == 'success' ) {
                    console.log(response.data);
                    if ( response.data[0] != null ) {
                        $scope.auto_new.Aut_Id = response.data[0].Aut_Id;
                        $scope.auto_new.Cli_Nombre = response.data[0].Cli_Nombre;
                        $scope.auto_new.Aut_Patente = response.data[0].Aut_Patente;
                        $scope.auto_new.Aut_Marca = response.data[0].Aut_Marca;
                        $scope.auto_new.Aut_Modelo = response.data[0].Aut_Modelo;
                    }
                    console.log($scope.auto_new);
                }
                else {
                    toastFactory.simpleToast('No hay Autos que coincidan', 'info-toast');
                }
            }).error(function (data) {
                toastFactory.simpleToast(data.error, 'info-toast');
            });

        }
    }

    $scope.btnAgregar = false;
    $scope.agregarPatente = function ()
    {
        $scope.btnAgregar = true;
        var url = 'clientes/addPatenteCliente/format/json';
        console.log($scope.auto_new);
        var dataObj = {
            auto: $scope.auto_new,
            cliente: $scope.cliente_logged.id
        };
        console.log(dataObj);
        $http.post(base_url_api + url, dataObj).success(function (response) {
            //console.log(response);
            if ( response == 'success' ) {
                // mensaje de ok
                $scope.menuActivoPoliza = 'newAutoSuccess';
                // vuelvo a buscar las patentes
                $scope.getAutos( $scope.cliente_logged );
                // vuelvo a buscar las polizas
                $scope.getPolizas( $scope.cliente_logged );
                // reinicio el auto nuevo
                $scope.initAutoNew();
            } else if ( response == 'existe' ) {
                toastFactory.simpleToast('La Patente ya se encuentra registrada', 'error-toast');
            } else if ( response == 'original' ) {
                toastFactory.simpleToast('La Patente fue registrada al darse de alta', 'error-toast');
            } else {
                toastFactory.simpleToast('Error Inesperado', 'error-toast');
            }
            $scope.btnAgregar = false;
        }).error(function (data) {
            toastFactory.simpleToast(data.error, 'error-toast');
            console.log(data);
            $scope.btnAgregar = false;
        });
    }

    $scope.filtrarPoliza = function ( patente )
    {
        $scope.searchText = patente;
        $scope.menuActivoPoliza = 'polizas';
    }
});

angular.module("ngapp").controller("MensajesController", function(shared, $state, $scope, $http, $timeout, toastFactory, Auth, $window){

    // reviso si esta logueado
    $scope.isLogged = function ()
    {
        var cliente_logged = Auth.isLoggedIn();

        if ( cliente_logged == false )  $state.go('main');
        else                            $scope.cliente_logged = cliente_logged;
    }
    $scope.isLogged();

    $scope.messageWindowHeight = parseInt($window.innerHeight - 128) + 'px';

    $scope.mensajes = [];
    var mensajesArray = [];

    $scope.getMensajes = function( cliente_id )
    {
        var url = 'clientes/getMensajes/cliente/'+ cliente_id + '/estado/2/format/json';

        $http.get(base_url_api + url).success(function (response) {
            if ( response.return == 'success' ) {
                mensajesArray = response.data;
                var fechaUltima = null;
                if ( mensajesArray.length > 0 ) {
                    for (var i = 0; i < mensajesArray.length; i++) {
                        var fecha = mensajesArray[i].fecha_enviado.split(' ');
                        if (fechaUltima != fecha[0]) {
                            fechaUltima = fecha[0];
                            mensajesArray[i].fechaGrupal = mensajesArray[i].fecha_enviado;
                        } else {
                            mensajesArray[i].fechaGrupal = null;
                        }
                    }
                    //mensajesArray = $scope.mensajes;
                    $scope.mensajes = mensajesArray;
                }
            }
            else {
                toastFactory.simpleToast('No hay Mensajes para el Cliente', 'info-toast');
            }
        }).error(function (data) {
            toastFactory.simpleToast(data.error, 'info-toast');
        });

        //setTimeout('$scope.getMensajes( $scope.cliente_logged.id )',10000);
        if ( $state.current.name == 'mensajes' ) {
            $timeout(function(){
                $scope.getMensajes( $scope.cliente_logged.id );
            }, 10000);
        }
    }
    $scope.getMensajes( $scope.cliente_logged.id );

    // envio de mensajes
    $scope.sendMessage = function ()
    {
        if ( $scope.message == '' || $scope.message == null || $scope.message == undefined ) {
            toastFactory.simpleToast('Debe escribir un Mensaje', 'error-toast');
            return false;
        }

        // fecha
        var fecha = new Date();
        var mes = fecha.getMonth() + 1;
        var fecha_ahora = fecha.getFullYear()+'-'+mes+'-'+fecha.getDate()+' '+fecha.getHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();

        // muestro el mensaje con el reloj
        $timeout(function() {
            mensajesArray.push({id:"123", cliente_enviado:"1", cliente_id:$scope.cliente_logged.id, estado:"1",fechaGrupal:null, fecha_entregado:fecha_ahora, fecha_enviado:fecha_ahora, fecha_leido:"0000-00-00 00:00:00", mensaje:$scope.message, operador_id:"1"});
            $scope.mensajes = mensajesArray;
        }, 1, false);
        var indice = parseInt($scope.mensajes.length - 1);

        var url = 'clientes/message/format/json';

        var dataObj = {
            mensaje: $scope.message,
            fecha: fecha_ahora,
            cliente: $scope.cliente_logged.id
        };

        $http.post(base_url_api + url, dataObj).success(function (response) {
            //console.log(response);
            if ( response.return == 'success' ) {
                //toastFactory.simpleToast('Cambios guardados', 'success-toast');
                //$scope.mensajes.push({id:"", cliente_enviado:"1", cliente_id:$scope.cliente_logged.id, estado:"1",fechaGrupal:null, fecha_entregado:fecha_ahora, fecha_enviado:fecha_ahora, fecha_leido:"0000-00-00 00:00:00", mensaje:$scope.message, operador_id:"1"});
                $scope.message = '';
                // si se guardo muestro el tilde
            } else {
                toastFactory.simpleToast('Error al querer Enviar el Mensaje', 'error-toast');
            }
        }).error(function (data) {
            toastFactory.simpleToast(data, 'error-toast');
        });
    }
});

angular.module("ngapp").controller("DenunciasController", function(shared, $state, $scope, $http, $timeout, toastFactory, Auth){

    // reviso si esta logueado
    $scope.isLogged = function ()
    {
        var cliente_logged = Auth.isLoggedIn();

        if ( cliente_logged == false )  $state.go('main');
        else                            $scope.cliente_logged = cliente_logged;
    }
    $scope.isLogged();

    $scope.denuncias = [];

    $scope.getDenuncias = function( cliente_id )
    {
        var url = 'clientes/getDenuncias/cliente/'+ cliente_id + '/estado/1/format/json';

        $http.get(base_url_api + url).success(function (response)
        {
            if ( response.return == 'success' ) {
                $scope.denuncias = response.data;

                var fechaUltima = null;
                for (var i = 0; i < $scope.denuncias.length; i++) {
                    var fecha = $scope.denuncias[i].fecha.split(' ');
                    if ( fechaUltima != fecha[0] ) {
                        fechaUltima = fecha[0];
                        $scope.denuncias[i].fechaGrupal = $scope.denuncias[i].fecha;
                    } else {
                        $scope.denuncias[i].fechaGrupal = null;
                    }
                }
            }
            else {
                toastFactory.simpleToast('No hay Denuncias hechas por el Cliente', 'info-toast');
            }
        }).error(function (data) {
            toastFactory.simpleToast(data.error, 'info-toast');
        });
    }
    $scope.getDenuncias( $scope.cliente_logged.id );

    $scope.map = null;
    $scope.marker = null;
    $scope.denunciaActiva = null;
    $scope.verDenuncia = function ( denuncia )
    {
        if ( $scope.denunciaActiva == null ) {
            $scope.denunciaActiva = denuncia.id;

            if ( denuncia.ubicacion_map != '' ) {
                var ubi = denuncia.ubicacion_map.split(',');
                $scope.getMap(Number(ubi[0]), Number(ubi[1]), denuncia.id);
            }
        } else {
            $scope.denunciaActiva = null;
            $scope.map = null;
            $scope.marker = null;
        }
    }

    $scope.getMap = function ( lat, lng, id )
    {
        $scope.map = new google.maps.Map(document.getElementById('map_' + id), {
            center: {lat: lat, lng: lng},
            zoom: 16
        });
        //$scope.infoWindow = new google.maps.InfoWindow;

        // marker
        $scope.marker = new google.maps.Marker({
            position: {
                lat: lat,
                lng: lng
            },
            title: "Ubicación del siniestro"
        });
        $scope.marker.setMap($scope.map);
    }
});

angular.module("ngapp").controller("SiniestrosController", function(shared, $state, $scope, $http, $timeout, toastFactory, Auth, $cordovaCamera, $cordovaFileTransfer){

    // reviso si esta logueado
    $scope.isLogged = function ()
    {
        var cliente_logged = Auth.isLoggedIn();

        if ( cliente_logged == false )  $state.go('main');
        else                            $scope.cliente_logged = cliente_logged;
    }
    $scope.isLogged();

    // busco los autos
    $scope.autos = null;
    $scope.getAutos = function( cliente )
    {
        var autos = null;

        if ( autos == null || autos == undefined || autos == '' ) {

            console.log('busco los autos con la api');
            //var url = 'clientes/getAutos/cliente/'+ cliente.Cli_Cod + '/format/json';
            var url = 'clientes/getAutos/clienteId/'+ cliente.id + '/format/json';

            $http.get(base_url_api + url).success(function (response) {
                if ( response.return == 'success' ) {
                    $scope.autos = response.data;
                    $scope.siniestro.auto = $scope.autos[0].Aut_Id;
                }
                else {
                    toastFactory.simpleToast('No hay Autos del Cliente', 'info-toast');
                }
            }).error(function (data) {
                toastFactory.simpleToast(data.error, 'info-toast');
            });

        } else {
            console.log('busco los autos en el storage');
        }

        $timeout(function() {
            $scope.autos = autos;
        }, 0, false);
    }
    $scope.getAutos( $scope.cliente_logged );

    // denunciar siniestro
    $scope.initFormSiniestro = function ()
    {
        var fecha_hoy = new Date();
        var hor = fecha_hoy.getHours();
        var min = fecha_hoy.getMinutes();

        $scope.formPaso = 1;
        $scope.btnGuardar = false;

        $scope.siniestro = {};
        $scope.siniestro.cliente_id = $scope.cliente_logged.id;
        $scope.siniestro.tipo = 1;
        $scope.siniestro.conductor = 1;
        $scope.siniestro.otro_nombre = $scope.cliente_logged.nombre;
        $scope.siniestro.otro_telefono = null;
        $scope.siniestro.tercero_nombre = null;
        $scope.siniestro.tercero_telefono = null;
        $scope.siniestro.relato = null;
        $scope.siniestro.úbicacion = '';
        $scope.siniestro.ubicacion_map = '';
        $scope.siniestro.fecha = fecha_hoy;
        $scope.siniestro.hora = hor;
        $scope.siniestro.horas = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
        $scope.siniestro.minuto = min;
        $scope.siniestro.minutos = [0,5,10,15,20,25,30,35,40,45,50,55];
    }
    $scope.initFormSiniestro();

    $scope.nextStep = function ( tipo )
    {
        $scope.siniestro.tipo = tipo;

        if ( $scope.formPaso == 1 )         $scope.formPaso = 2;
        else if ( $scope.formPaso == 2 )    $scope.formPaso = 3;
        else if ( $scope.formPaso == 3 )    $scope.formPaso = 1;
    }

    $scope.siniestro_id = null;
    $scope.btn_guardar_denuncia = 'Guardar Denuncia';

    $scope.guardarSiniestro = function ()
    {
        $scope.btnGuardar = true;
        $scope.btn_guardar_denuncia = 'Guardando Datos...';

        var url = 'clientes/guardarSiniestro/format/json';
        var dataObj = {
            post: $scope.siniestro
        };

        $http.post(base_url_api + url, dataObj).success(function (response) {
            console.log(response);
            if ( response.return == 'success' )
            {
                $scope.formPaso = 3;
                $scope.siniestro_id = response.siniestro_id;

                if ( $scope.galeria.length > 0 )
                {
                    //$scope.btn_guardar_denuncia = 'Guardando Fotos...';
                    
                    for (var i = 0; i < $scope.galeria.length; i++) {
                        console.log('guardar foto');
                        console.log($scope.galeria[i]);
                        $scope.uploadFoto( $scope.galeria[i], i );
                    }
                }
            } else {
                toastFactory.simpleToast('Error Inesperado', 'error-toast');
            }
            $scope.btnGuardar = false;
        }).error(function (data) {
            toastFactory.simpleToast(data.error, 'error-toast');
            console.log(data);
            $scope.btnGuardar = false;
        });
    }

    $scope.map = null;
    $scope.marker = null;
    $scope.infoWindow = null;
    $scope.position = null;
    $scope.address = null;

    $scope.initMap = function ()
    {
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 16
        });
        $scope.infoWindow = new google.maps.InfoWindow;

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            console.log('entro a navigator.geolocation()');
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    $scope.position = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    console.log(position);

                    // marker
                    $scope.marker = new google.maps.Marker({
                        position: {
                            lat: $scope.position.lat,
                            lng: $scope.position.lng
                        },
                        title: "Mi actual ubicación"
                    });
                    $scope.marker.setMap($scope.map);

                    // geodecoder
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({'latLng': $scope.marker.getPosition()}, function(results, status) {
                        if ( status == google.maps.GeocoderStatus.OK ) {
                            var address = results[0]['formatted_address'];
                            $scope.address = address;
                            $scope.siniestro.úbicacion = address;
                        }
                    });

                    $scope.siniestro.ubicacion_map = $scope.position.lat + ',' +$scope.position.lng;
                    // info window
                    //$scope.infoWindow.setPosition($scope.position);
                    //$scope.infoWindow.setContent('Location found.');
                    //$scope.infoWindow.open($scope.map);
                    $scope.map.setCenter($scope.position);
                },
                function() {
                    $scope.handleLocationError(true, $scope.infoWindow, $scope.map.getCenter());
                },
                { maximumAge:60000, timeout: 5000, enableHighAccuracy: true }
            );
        } else {
            // Browser doesn't support Geolocation
            $scope.handleLocationError(false, $scope.infoWindow, $scope.map.getCenter());
        }
    }

    $scope.handleLocationError = function (browserHasGeolocation, infoWindow, pos)
    {
        console.log('handleLocationError');
        console.log(browserHasGeolocation);
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open($scope.map);
    }

    $scope.initMap();

    var placeSearch, autocomplete;
    var componentForm = { street_number: 'short_name', route: 'long_name', locality: 'long_name', administrative_area_level_1: 'short_name', country: 'long_name', postal_code: 'short_name' };

    function initialize()
    {
        // Create the autocomplete object, restricting the search
        // to geographical location types.
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
            { types: ['geocode'] });
        // When the user selects an address from the dropdown,
        // populate the address fields in the form.
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            fillInAddress();
        });
    }

    // [START region_fillform]
    function fillInAddress()
    {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();
        var direccion = '';

        // marco el mapa
        //$( '#latitud' ).val( place.geometry.location.lat() );
        //$( '#longitud' ).val( place.geometry.location.lng() );
        //load_map( place.geometry.location.lat(), place.geometry.location.lng() );
        $scope.siniestro.ubicacion_map = place.geometry.location.lat() + ',' + place.geometry.location.lng()
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()},
            zoom: 16
        });
        // marker
        $scope.marker = new google.maps.Marker({
            position: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            },
            title: "Mi actual ubicación"
        });
        $scope.marker.setMap($scope.map);

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
                var val = place.address_components[i][componentForm[addressType]];
                //document.getElementById(addressType).value = val;
                direccion = direccion + val + ', ';
            }
        }
        console.log(direccion)
        //$( '#direccion' ).val( direccion );
    }
    // [END region_fillform]
    initialize();

    $scope.galeria = [];
    /*$scope.galeria.push('assets/img/logo-app.png');
    $scope.galeria.push('assets/img/logo-app-mini.png');
    $scope.galeria.push('assets/img/logo-app-mini-original.png');
    $scope.galeria.push('assets/img/logo-berkley.jpg');*/

    $scope.openCamera = function ()
    {
        var options = {
            quality: 80,
            allowEdit: true,
            saveToPhotoAlbum: true,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG
        };

        $cordovaCamera.getPicture(options).then(function(imageURI) {
            console.log(imageURI);
            //var image = document.getElementById('myImage');
            //image.src = imageURI;
            $scope.galeria.push( imageURI );
        }, function(err) {
            // error
            alert(err);
        });
        //$cordovaCamera.cleanup(); // only for FILE_URI
    }

    $scope.openGalery = function ()
    {
        var options = {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            //mediaType: Camera.MediaType.PICTURE,
            encodingType: Camera.EncodingType.JPEG
        };

        $cordovaCamera.getPicture(options).then(function(imageURI) {
            //var image = document.getElementById('myImage');
            //image.src = imageURI;
            console.log(imageURI);
            $scope.galeria.push( imageURI );
        }, function(err) {
            // error
            alert(err);
        });
        //$cordovaCamera.cleanup(); // only for FILE_URI
    }

    var botonCamera = document.getElementById('btn_camara');
    var botonGalery = document.getElementById('btn_galery');

    // activo los botones una vez que este listo del dispositivo
    document.addEventListener("deviceready", function () {
        // boton de camara
        botonCamera.onclick = function(){
            $scope.openCamera();
        };
        // boton de galeria
        botonGalery.onclick = function(){
            $scope.openGalery();
        };
    }, false);

    $scope.uploadFoto = function ( imageURI, canti )
    {
        var server = base_url_api + "clientes/uploadFoto";
        var name = 'imagen_' + canti + '_' + $scope.getDateNow();

        var win = function (r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
        }

        var fail = function (error) {
            alert("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
        }

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = name + '.jpg';
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;

        console.log('chunkedMode: ' + options.chunkedMode);

        var params = {};
        params.value1 = $scope.siniestro_id;
        options.params = params;

        var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI( server ), win, fail, options);

        /*var options = {
            fileKey: $scope.siniestro_id,
            fileName: imageURI,
            chunkedMode: false,
            httpMethod: "post"  //here the methed (get, post,..)
        };

        $cordovaFileTransfer.upload(server, imageURI, options)
            .then(function(result) {
                // Success!
                console.log('Success!');
                console.log(result);
            }, function(err) {
                // Error
                console.log('Error');
                console.log(err);
            }, function (progress) {
                // constant progress updates
                console.log('progress');
                console.log(progress);
            });
            */
    }

    $scope.uploadFile = function ( file )
    {
        var _file = $scope.myFile;
        console.log('file is ');
        console.log(file);

        var uploadUrl = base_url_api + "clientes/uploadOrders";
        $scope.siniestro_id = 1;
        fileUpload.uploadFileToUrl( file, uploadUrl, $scope, $scope.siniestro_id );
    }

    $scope.getDateNow = function ()
    {
        var fecha = new Date(); // Fecha actual
        var mes = fecha.getMonth() + 1; // obteniendo mes
        var dia = fecha.getDate(); // obteniendo dia
        var ano = fecha.getFullYear(); // obteniendo año

        var sec = fecha.getSeconds(); // obteniendo segundos
        var min = fecha.getMinutes(); // obteniendo minutos
        var hor = fecha.getHours(); // obteniendo horas

        if(dia<10)
            dia='0'+dia; // agrega cero si el menor de 10
        if(mes<10)
            mes='0'+mes; // agrega cero si el menor de 10

        return ano + "" + mes + "" + dia + "" + hor + "" + min + "" + sec;
    }
});

angular.module("ngapp").controller("NotificacionesController", function(shared, $state, $scope, $http, $timeout, toastFactory, Auth){

    // reviso si esta logueado
    $scope.isLogged = function ()
    {
        var cliente_logged = Auth.isLoggedIn();

        if ( cliente_logged == false )  $state.go('main');
        else                            $scope.cliente_logged = cliente_logged;
    }
    $scope.isLogged();

    $scope.notificaciones = null;
    $scope.getNotificaciones = function( cliente_id )
    {
        var url = 'ordenes/getNotificaciones/cliente/'+ cliente_id + '/estado/2/format/json';

        $http.get(base_url_api + url).success(function (response)
        {
            if ( response.return == 'success' ) {
                $scope.notificaciones = response.data;
                var fechaUltima = null;
                for (var i = 0; i < $scope.notificaciones.length; i++) {
                    var fecha = $scope.notificaciones[i].fecha.split(' ');
                    if ( fechaUltima != fecha[0] ) {
                        fechaUltima = fecha[0];
                        $scope.notificaciones[i].fechaGrupal = $scope.notificaciones[i].fecha;
                    } else {
                        $scope.notificaciones[i].fechaGrupal = null;
                    }
                }
            }
            else {
                toastFactory.simpleToast('No hay Notificaciones para el Cliente', 'info-toast');
            }
        }).error(function (data) {
            toastFactory.simpleToast(data.error, 'info-toast');
        });
    }
    $scope.getNotificaciones( $scope.cliente_logged.id );
});

angular.module("ngapp").factory('toastFactory', function($mdToast){
    // simple toast
    return {
        simpleToast: function( formData, themes ) {
            $mdToast.show(
                $mdToast.simple().textContent(formData).position('bottom right').hideDelay(5000).theme(themes)
            );
        }
    }
});

angular.module("ngapp").factory('simpleAlertFactory', function($mdDialog){
    // simple alert
    return {
        simpleAlert: function ( ev, title, text ) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title(title)
                    .textContent(text)
                    .ariaLabel('Alert Dialog')
                    .ok('OK')
                    .targetEvent(ev)
            );
        }
    }
});

angular.module("ngapp").filter('trim', function () {
    return function(value) {
        if(!angular.isString(value)) {
            return value;
        }
        return value.replace(/^\s+|\s+$/g, ''); // you could use .trim, but it's not going to work in IE<9
    };
});

angular.module("ngapp").filter('toYear', function () {
     return function (dateString) {
         var dateObject = new Date(dateString);
         return dateObject.toISOString();
     };
});

angular.module("ngapp").directive('fileModel', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
});

// We can write our own fileUpload service to reuse it in the controller
angular.module("ngapp").service('fileUpload', function ($http, toastFactory) {
        this.uploadFileToUrl = function(file, uploadUrl, $scope, siniestro){
        var fd = new FormData();
        fd.append('file', file);
        fd.append('siniestro', siniestro);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
             headers: {'Content-Type': undefined,'Process-Data': false}
        })
        .success(function(response){
            console.log("Success");
            console.log(response);

            if ( response.result == 'success' ) {
                toastFactory.simpleToast('Archivo Subido', 'error-toast');
            } else {
                toastFactory.simpleToast('Error al Subir el Archivo', 'error-toast');
            }
            //return response;
        })
        .error(function(){
            toastFactory.simpleToast('Error al Subir el Archivo', 'error-toast');
        });
    }
});

angular.module("ngapp").factory('Excel',function($window){
    var uri='data:application/vnd.ms-excel;base64,',
        template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
        base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));},
        format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
    return {
        tableToExcel:function(tableId,worksheetName){
            var table=$(tableId),
                ctx={worksheet:worksheetName,table:table.html()},
                href=uri+base64(format(template,ctx));
            return href;
        }
    };
});

angular.module("ngapp").directive('scrollToBottom', function($timeout, $window) {
    return {
        scope: {
            scrollToBottom: "="
        },
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.$watchCollection('scrollToBottom', function(newVal) {
                if (newVal) {
                    $timeout(function() {
                        element[0].scrollTop =  element[0].scrollHeight;
                    }, 0);
                }

            });
        }
    };
});
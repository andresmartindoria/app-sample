"use strict";

angular.module("ngapp")

.run( ['$rootScope', '$state', '$stateParams',
	function ($rootScope, $state, $stateParams) {
		//$rootScope.$state = $state;
		//$rootScope.$stateParams = $stateParams;
        //$rootScope.mensajes = null;
	}
])

.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise("/main");

    $stateProvider.state("main", {
        url: "/main",
        templateUrl: "app/components/main/main.html",
        title: "Ingreso",
        controller: "LoginController",
        controllerAs: "main"
    })
    .state("register", {
        url: "/register",
        templateUrl: "app/components/main/register.html",
        title: "Registro",
        controller: "LoginController",
        controllerAs: "main"
    })
    .state("forgot", {
        url: "/forgot",
        templateUrl: "app/components/main/forgot.html",
        title: "Olvide mi Contraseña",
        controller: "LoginController",
        controllerAs: "main"
    })
    .state("dashboard", {
        url: "/dashboard",
        templateUrl: "app/components/main/dashboard.html",
        title: "Home",
        controller: "DashboardController",
        controllerAs: "board"
    })
    .state("profile", {
        url: "/profile/:ID",
        templateUrl: "app/components/main/profile.html",
        title: "Perfil",
        controller: "ProfileController",
        controllerAs: "profile"
    })
    .state("polizas", {
        url: "/polizas",
        templateUrl: "app/components/main/polizas.html",
        title: "Polizas",
        controller: "PolizasController",
        controllerAs: "polizas"
    })
    .state("mensajes", {
        url: "/mensajes",
        templateUrl: "app/components/main/mensajes.html",
        title: "Mensajes",
        controller: "MensajesController",
        controllerAs: "mensajes"
    })
    .state("siniestros", {
        url: "/siniestros",
        templateUrl: "app/components/main/siniestros.html",
        title: "Siniestros",
        controller: "SiniestrosController",
        controllerAs: "siniestros"
    })
    .state("denuncias", {
        url: "/denuncias",
        templateUrl: "app/components/main/denuncias.html",
        title: "Mis Denuncias",
        controller: "DenunciasController",
        controllerAs: "denuncias"
    })
    .state("notificaciones", {
        url: "/notificaciones",
        templateUrl: "app/components/main/notificaciones.html",
        title: "Notificaciones",
        controller: "NotificacionesController",
        controllerAs: "notificaciones"
    });
}]);

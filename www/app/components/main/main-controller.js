"use strict";

angular.module("ngapp").controller("MainController", function(shared, $state, $scope, $mdSidenav, $mdComponentRegistry, $cordovaCamera){

    var ctrl = this;

    this.auth = shared.info.auth;

    this.toggle = angular.noop;

    this.title = $state.current.title;


    this.isOpen = function() { return false };
    $mdComponentRegistry
    .when("left")
    .then( function(sideNav){
      ctrl.isOpen = angular.bind( sideNav, sideNav.isOpen );
      ctrl.toggle = angular.bind( sideNav, sideNav.toggle );
    });

    this.toggleRight = function() {
    $mdSidenav("left").toggle()
        .then(function(){
        });
    };

    this.close = function() {
    $mdSidenav("right").close()
        .then(function(){
        });
    };

    $scope.openCamera = function ()
    {
        var options = {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA
        };

        $cordovaCamera.getPicture(options).then(function(imageURI) {
            console.log(imageURI);
            var image = document.getElementById('myImage');
            image.src = imageURI;
        }, function(err) {
            // error
            alert(err);
        });


        //$cordovaCamera.cleanup(); // only for FILE_URI
    }

    document.addEventListener("deviceready", function () {

    }, false);

    var botonCamera = document.getElementById('boton');
    botonCamera.onclick = function(){
        $scope.openCamera();
    };
});

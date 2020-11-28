angular.module('SmartOrdersApp', ['ngCookies'])

.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}])


.controller('smartOrdersController', function($scope, $http, $interval, $cookies) {

      //Check if logged in
      // if($cookies.get("acceleronLunaAdminToken")){
      //   $scope.isLoggedIn = true;
      // }
      // else{
      //   $scope.isLoggedIn = false;
      //   window.location = "adminlogin.html";
      // }

      $scope.isLoggedIn = true;

      //Logout function
      $scope.logoutNow = function(){
        if($cookies.get("acceleronLunaAdminToken")){
          $cookies.remove("acceleronLunaAdminToken");
          window.location = "adminlogin.html";
        }
      }

      $scope.outletCode = localStorage.getItem("branch");

      $scope.tablesList = [];
      $scope.isTablesLoaded = false;


      var data = {};
      data.token = "sHtArttc2ht%2BtMf9baAeQ9ukHnXtlsHfexmCWx5sJOjMmduTS8FqbWXZu3C46tTVWfJK2QlHYHIQvEmu05QacaIoEtT4ABkAPy3dnnxeGYI%3D"//$cookies.get("acceleronLunaAdminToken");
      $('#vegaPanelBodyLoader').show(); $("body").css("cursor", "progress");
      $http({
        method  : 'POST',
        url     : 'https://accelerateengine.app/smart-menu/apis/tablestatus.php',
        data    : data,
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response) {
        console.log(response)
         $('#vegaPanelBodyLoader').hide(); $("body").css("cursor", "default");
         if(response.data.status){
           $scope.tablesList = response.data.data;
           $scope.isTablesLoaded = true;
         }
         else{
           $scope.isTablesLoaded = false;
         }
      });

      $scope.getTileClasses = function(table){

        let tileColor = "free";

        if(table.isTableFree){
          tileColor = "free";
        }

        switch(table.orderStatus){
          case "0":{
            tileColor = "active";
            break;
          }
          case "1":{
            tileColor = "billed";
            break;
          }
          default:{
            tileColor = "free";
          }
        }

        if((table.hasNewOrder) && (tileColor == "free" || tileColor == "active")){
          tileColor = "new";
        }

        if(!table.isTableFree){
          tileColor = tileColor + " serviceWarning";
        }

        return tileColor;
      }

      $scope.getTileText = function(table){

        if(table.hasNewOrder){
          return "New";
        }

        if(table.isTableFree){
          return "Free";
        }

        switch(table.orderStatus){
          case "0":{
            if(table.stewardName && table.stewardName != ""){
              return table.stewardName;
            }
            return "Running";
          }
          case "1":{
            if(table.systemBillNumber && table.systemBillNumber != ""){
              return "Billed #" + table.systemBillNumber;
            }
            return "Billed";
          }
          default:{
            return "";
          }
        }
      }


      $scope.getServiceWarningIcon = function(requestType){
        switch(requestType){
          case "TAKE_BILL":{
            return "fa-file-text-o";
          }
          case "CALL_STEWARD":{
            return "fa-user-o";
          }
          case "SERVE_FAST":{
            return "fa-bolt";
          }
          default:{
            return "fa-paper-o";
          }
        }
      }

  });

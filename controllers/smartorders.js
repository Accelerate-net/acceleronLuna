angular.module('SmartOrdersApp', ['ngCookies'])

.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}])


.controller('smartOrdersController', function($scope, $http, $interval, $cookies) {

const TOKEN_FOR_TESTING = "sHtArttc2ht%2BtMf9baAeQ9ukHnXtlsHfexmCWx5sJOhHIq1S%2F7Wg6G8g0PY2zmkff5rCh%2BPGETDqicga%2B2XyW9hsC3qlAOG0OrAJwvjTCC8%3D";



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
      data.token = TOKEN_FOR_TESTING;//$cookies.get("acceleronLunaAdminToken");
      $('#vegaPanelBodyLoader').show(); $("body").css("cursor", "progress");
      $http({
        method  : 'POST',
        url     : 'https://accelerateengine.app/smart-menu/apis/tablestatus.php',
        data    : data,
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response) {
         $('#vegaPanelBodyLoader').hide(); $("body").css("cursor", "default");
         if(response.data.status){
           $scope.tablesList = response.data.data;
           $scope.isTablesLoaded = true;
         }
         else{
           $scope.isTablesLoaded = false;
         }
      });

      $scope.individualOrder = {};

      $scope.openTable = function(table){
        console.log(table);
        $scope.currentTableData = table;

        var isTableOccuppied = !$scope.currentTableData.isTableFree;
        var tableOrderStatus = $scope.currentTableData.orderStatus;

        if(isTableOccuppied){
            if(table.hasNewOrder){ //There is a new order on the table --> Punch
                var data = {};
                data.token = TOKEN_FOR_TESTING;//$cookies.get("acceleronLunaAdminToken");
                data.masterorder = table.masterOrderId;
                $('#vegaPanelBodyLoader').show(); $("body").css("cursor", "progress");
                $http({
                  method  : 'POST',
                  url     : 'https://accelerateengine.app/smart-menu/apis/fetchorder.php',
                  data    : data,
                  headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .then(function(response) {
                  console.log(response)
                   $('#vegaPanelBodyLoader').hide(); $("body").css("cursor", "default");
                   if(response.data.status){
                     $scope.individualOrder = response.data.data;
                     var cart = $scope.individualOrder.cart;
                     for(var i = 0; i < cart.length; i++){
                        cart[i].isAvailable = true;
                     }

                     $scope.individualOrder.cart = cart;

                     $('#punchOrderModal').modal('show');
                   }
                   else{
                     alert('Failed to load the order - ' + response.data.error);
                   }
                });
            }
            else{
                  var hasActiveRequest = table.activeServiceRequest != "" ? true : false;
                  if(hasActiveRequest){ //There is active service request on the table --> Acknowledge

                  }
                  else{
                        if(tableOrderStatus == 0){ //show VIEW ITEMS / GENERATE BILL options
                          $scope.showOptions(['VIEW_ORDERS', 'GENERATE_BILL']);
                          //$('#generateBillModal').modal('show');
                        }
                        else if(tableOrderStatus == 1){ //already billed - waiting for settlement (orange tile) - show VIEW ITEMS / SETTLE BILL options
                          $scope.showOptions(['SETTLE_BILL', 'VIEW_ORDERS']);
                        }
                        else if(tableOrderStatus == 2){ //bill paid - show Confirm and clear mapping (remove table - qr mapping) 
                          $scope.showOptions(['CONFIRM_PAYMENT']);
                        }
                  }
            }
        }

      }

      $scope.getOrderCount = function(number){
        if(number == 1){
          return "2nd";
        }
        else if(number == 2){
          return "3rd";
        }
        else if(number > 2){
          return (number+1) + "th";
        }
      }


      $scope.showOptions = function(optionsList){
        
        $('#tableOptionsModal').modal('show');
        for(var i = 0; i < optionsList.length; i++){

        }
      }


      $scope.changeItemAvailability = function(item){
         var cart = $scope.individualOrder.cart;
         for(var i = 0; i < cart.length; i++){
            if(cart[i].code == item.code && cart[i].variant == item.variant){
              cart[i].isAvailable = !cart[i].isAvailable;
            }
         }
         $scope.individualOrder.cart = cart;
      }

      $scope.generateBillForTable = function(tableData){
              
              console.log('tableData', tableData);

              var data = {};
              data.token = TOKEN_FOR_TESTING; //$cookies.get("acceleronLunaAdminToken");
              data.masterorder = 59;
              data.systemBillNumber = tableData.systemBillNumber;
              data.totalBillAmount = tableData.billAmount;
              $('#vegaPanelBodyLoader').show(); $("body").css("cursor", "progress");
              $http({
                method  : 'POST',
                url     : 'https://accelerateengine.app/smart-menu/apis/generateinvoice.php',
                data    : data,
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
              })
              .then(function(response) {
                console.log(response)
                 $('#vegaPanelBodyLoader').hide(); $("body").css("cursor", "default");
                 if(response.data.status){
                   $('#generateBillModal').modal('hide');
                 }
                 else{
                   alert('Failed to generate bill - ' + response.data.error);
                 }
              });



      }


      $scope.punchOrderAccept = function(currentTableData, individualOrder){
        console.log(currentTableData, individualOrder)
      }

      $scope.punchOrderReject = function(currentTableData, individualOrder){
        
      }

      $scope.getOrderTime = function(time, format){
        if(format == 'PAST'){
          return moment(time).fromNow();
        }
        if(format == 'ABSOLUTE'){
          return moment(time).format('LT');
        }
      }

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
          case "2":{
            tileColor = "settled";
            break;
          }
          default:{
            tileColor = "free";
          }
        }

        if((table.hasNewOrder) && (tileColor == "free" || tileColor == "active")){
          tileColor = "new";
        }

        var isServiceRequest = table.activeServiceRequest != "" ? true : false;
        if(isServiceRequest){
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
          case "2":{
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


      $scope.getServiceWarningIcon = function(table){
        var requestType = table.activeServiceRequest;
        switch(requestType){
          case "CALL_REQUEST_BILL":{
            return "fa-file-text-o";
          }
          case "CALL_CALL_STEWARD":{
            return "fa-user-o";
          }
          case "CALL_SERVE_FAST":{
            return "fa-bolt";
          }
          default:{
            return "fa-paper-o";
          }
        }
      }

      $scope.getServiceWarningLabel = function(table){
        var requestType = table.activeServiceRequest;
        switch(requestType){
          case "CALL_REQUEST_BILL":{
            return "Take Bill";
          }
          case "CALL_CALL_STEWARD":{
            return "Attend";
          }
          case "CALL_SERVE_FAST":{
            return "Serve Fast";
          }
          default:{
            return "Attend";
          }
        }
      }

  });

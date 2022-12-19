import app from "../../app";

app.service("messageService", function (message) {
  this.showMessage = function (messageText) {
    message.message = messageText;
    setTimeout(function () {
      message.message = "";
    }, 3000);
    // if ($scope.panelInfo) {
    //   var d = new Date();
    //   //$scope.panel.unshift(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " : " + message);
    //   $scope.panel.unshift(d.toTimeString().slice(0, 8) + " : " + message);
    //   if ($scope.panel.length > 10) {
    //     $scope.panel.pop();
    //   }
    // }
  };
});

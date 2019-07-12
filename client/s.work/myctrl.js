


app.config(function($routeProvider) {
  $routeProvider
  .when("/", {
    templateUrl : "login.html"
  })
  .when("/red", {
    templateUrl : "https://www.w3schools.com/angular/red.htm"
  })
  .when("/green", {
    templateUrl : "enter.html"
  })
  .when("/enter", {
    templateUrl : "enter.html"
  });
});

apps.controller('myctrl', function($scope) {
    $scope.name = "sos";
});
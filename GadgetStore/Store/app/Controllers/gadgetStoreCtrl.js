angular.module('gadgetsStore')
    .constant('gadgetsUrl', 'http://localhost:52674/api/gadgets')
    .constant('ordersUrl', 'http://localhost:52674/api/orders')
    .constant('categoriesUrl', 'http://localhost:52674/api/categories')
    .constant('tempOrdersUrl',     'http://localhost:52674/api/sessions/temporders/gettemporders')
    .constant('saveTempOrdersUrl', 'http://localhost:52674/api/sessions/temporders/savetemporder')
    .constant('tokenUrl', '/Token')
    .constant('tokenKey', 'accessToken')
    .controller('gadgetStoreCtrl', function ($scope, $http, $location, gadgetsUrl, categoriesUrl, ordersUrl,tempOrdersUrl,saveTempOrdersUrl, cart,tekenKey) {
        
        $scope.data = {};

        $http.get(gadgetsUrl)
            .success(function (data) {
                $scope.data.gadgets = data;
            })
            .error(function (error) {
                $scope.data.error = error;
            });

        $http.get(categoriesUrl)
        .success(function (data) {
            $scope.data.categories = data;
        })
        .error(function (error) {
            $scope.data.error = error;
        });

        $scope.sendOrder = function (shippingDetails) {
            var token = sessionStorage.getItem(tokenKey);
            console.log(token);
            var headers = {};

            if (token) {
                headers.Authorization = 'Bearer ' + token;
            }

            var order = angular.copy(shippingDetails);
            order.gadgets = cart.getProducts();
            $http.post(saveTempOrdersUrl, order, { headers: { 'Authorization': 'Bearer ' + token } })
            .success(function (data, status, headers, config) {
                $scope.data.OrderLocation = headers('Location');
                $scope.data.OrderID = data.OrderID;
                cart.getProducts().length = 0;
                $scope.saveOrder();
            })
            .error(function (error) {
                if (status != 401)
                    $scope.data.orderError = data.Message;
                else {
                    $location.path("/login");
                }                
            }).finally(function () {
                $location.path("/complete");
            });
        }

        $scope.showFilter = function () {
            return $location.path() == '';
        }

        $scope.checkoutComplete = function () {
            return $location.path() == '/complete';
        }

        $scope.saveOrder = function () {
            var currentProducts = cart.getProducts();

            $http.post(saveTempOrdersUrl, currentProducts)
                .success(function (data, status, headers, config) {
                }).error(function (error) {
                }).finally(function () {
                });
        }

        $scope.checkSessionGadgets = function () {
            $http.get(tempOrdersUrl)
            .success(function (data) {
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        cart.pushItem(item);
                    }
                }
            })
            .error(function (error) {
                console.log('error checking session: ' + error);
            });
        }

        $scope.logout = function () {
            sessionStorage.removeItem(tokenKey);
        }
        $scope.createAccount = function () {
            $location.path("/register");
        }

    });
const app = angular.module('homeApp', []);

app.controller('homeController', function ($scope, $http) {
    $scope.role = JSON.parse(localStorage.getItem('user')).role;
    $scope.modal = false;
    $scope.cartItems = 0;
    $scope.quantity = 1;
    $scope.products = [];
    $scope.cartId;
    $scope.modalRender = 0;
    $scope.productIdUpdate = 0;
    $scope.searchTerm = '';

    if ($scope.role === 'user') {
        window.location.href = "/";
    }

    $scope.openModalProducts = (value, id) => {
        $scope.modalRender = value;
        $scope.productIdUpdate = id;
        $scope.modal = true;
    }
    $scope.closeModalProducts = () => {
        $scope.modal = false;
    }

    $scope.logout = () => {
        localStorage.clear();
        window.location.href = "/";
    }

    $scope.submit = (name, description, price, imgUrl) => {
        $http.post("http://localhost:3000/api/v1/product", {
            name,
            description,
            price,
            imageUrl: imgUrl,
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then((response) => {
            console.log(response);
            $scope.getAllProducts();
            $scope.closeModalProducts();
        }).catch((error) => {
            console.log(error);
        });
    };

    $scope.submitUpdateProduct = (name, description, price, imageUrl) => {
        $http.put(`http://localhost:3000/api/v1/product/${$scope.productIdUpdate}`, {
            name,
            description,
            price,
            imageUrl,
        }, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('token')
            }
        }).then((response) => {
            console.log(response);
            $scope.getAllProducts();
            $scope.closeModalProducts();
        }).catch((error) => {
            console.log(error);
        });
    }

    $scope.removeProduct = () => {
        $http.delete(`http://localhost:3000/api/v1/product/${$scope.productIdUpdate}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('token')
            }
        }).then((response) => {
            console.log(response);
            $scope.getAllProducts();
            $scope.closeModalProducts();
        }).catch((error) => {
            console.log(error);
        });

    }

    $scope.getAllProducts = () => {
        $http.get("http://localhost:3000/api/v1/product", {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then((response) => {
            $scope.products = response.data;
        }).catch((error) => {
            console.log(error);
        });
    }

    $scope.createCart = () => {
        $http.post("http://localhost:3000/api/v1/cart", {
            userId: JSON.parse(localStorage.getItem('user')).id,
            total: 0,
            closed: false,
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.log(error);
        });
    }

    $scope.addToCart = (id, price) => {
        console.log(userDetails);
        for (let i = 0; i < userDetails.length; i++) {
            const userDetail = userDetails[i];
            if (userDetail.cart === undefined || userDetail.cart.length === 0) {
                console.log("O usuário", userDetail.username, "não tem carrinhos. Criando um novo carrinho...");
                $scope.createCart();
                return;
            }

            const lastCartIndex = userDetail.cart.length - 1;
            const lastCart = userDetail.cart[lastCartIndex];

            const isLastCartClosed = lastCart.closed;
            console.log("isLastCartClosed", isLastCartClosed);
            localStorage.setItem("cartID", userDetail.cart[lastCartIndex].id)
            if (isLastCartClosed) {
                console.log("O último carrinho para o usuário", userDetail.username, "está fechado. Criando um novo carrinho...");
                $scope.createCart();
            } else {
                console.log("O último carrinho para o usuário", userDetail.username, "está aberto. Mantendo o mesmo carrinho...");
                $http.post("http://localhost:3000/api/v1/cartItem", {
                    productId: id,
                    cartId: userDetail.cart[lastCartIndex].id,
                    quantity: 1,
                    price: price,
                }, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then((response) => {
                    console.log(response);
                    $scope.countItems();
                })
                    .catch((error) => {
                        if (error.status === 400) {
                            alert("Item já está no carrinho");
                        }
                        console.log(error);
                    });
            }
        }
    }

    $scope.getAllProducts();
    $scope.countItems = () => {
        userDetailsPromise.then(() => {
            userDetails.forEach(user => {
                $scope.cartItems = 0;
                user.cart.forEach(cart => {
                    $scope.cartItems += cart.CartItem.length;
                });
            });
        });
    }
    $scope.countItems();

    $scope.searchProducts = () => {
        if (!$scope.searchTerm.trim()) {
            $scope.getAllProducts();
        } else {
            $scope.products = $scope.products.filter(product => {
                return product.name.toLowerCase().includes($scope.searchTerm.toLowerCase());
            });
        }
    };
});
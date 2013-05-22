define(['angular'],
function(angular) {
    'use strict';

    return function($scope, $window, desks, statuses, Desk, DeskService, TaskStatus) {
        $scope.desks = desks;
        $scope.statuses = statuses;
        $scope.colors = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

        $scope.createDesk = function() {
            $scope.desk = {};
        };

        $scope.editDesk = function(desk) {
            $scope.orig = desk;
            $scope.desk = angular.copy(desk);
        };

        $scope.saveDesk = function() {
            angular.forEach($scope.statuses, function(status) {
                TaskStatus.save(status, function(status) {
                    $scope.statuses.push(status);
                });
            });

            if ('Id' in $scope.desk) {
                Desk.update($scope.desk, function() {
                    angular.extend($scope.orig, $scope.desk);
                });
            } else {
                Desk.save($scope.desk, function(desk) {
                    Desk.get({Id: desk.Id}, function(desk) {
                        $scope.desks.unshift(desk);
                    });
                });
            }
        };

        $scope.deleteDesk = function(desk, $index) {
            if ($window.confirm('Are you sure?')) {
                Desk.delete({Id: desk.Id}, function() {
                    $scope.desks.splice($index, 1);
                });
            }
        };

        $scope.addMember = function(desk) {
            $scope.desk = desk;
            $scope.users = DeskService.getAvailableUsers(desk);
        };

        $scope.removeMember = function(desk, user) {
            DeskService.removeMember(desk, user);
            desk.members = DeskService.getMembers(desk);
        };

        $scope.addCard = function(desk, cards) {
            $scope.desk = desk;
            $scope.cards = cards;
            $scope.card = {};
        };

        $scope.saveCard = function(desk, card) {
            DeskService.saveCard(desk, card).
                then(function(card) {
                    $scope.cards.push(card);
                });
        };

        $scope.deleteCard = function(cards, $index) {
            DeskService.deleteCard(cards[$index]);
            cards.splice($index, 1);
        };

        $scope.addTaskStatus = function(desk) {
            $scope.statuses.push({Active: 'true'});
        };
    };
});

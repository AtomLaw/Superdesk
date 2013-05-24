define(['angular'],
function(angular) {
    'use strict';

    return function($scope, DeskLoader, DeskService, TaskService) {
        $scope.compact = false;
        $scope.list = false;
        $scope.my = false;

        $scope.desk = DeskLoader();

        $scope.addTask = function(desk, parentTask) {
            $scope.orig = {};
            $scope.task = {Status: 'to do', Desk: desk, User: null, Parent: parentTask};
            $scope.parentTask = parentTask;
        };

        $scope.editTask = function(task, parentTask) {
            $scope.orig = task;
            $scope.task = {
                Id: task.Id,
                Title: task.Title,
                Status: task.Status,
                DueDate: task.DueDate,
                User: task.User,
                Description: task.Description
            };

            $scope.parentTask = parentTask;
            $scope.subtasks = task.subtasks;
        };
    };
});

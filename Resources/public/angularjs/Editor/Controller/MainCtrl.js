/**
 * Main Controller
 */
(function () {
    'use strict';

    angular.module('EditorModule').controller('MainCtrl', [
        '$scope',
        '$modal',
        'HistoryFactory',
        'ClipboardFactory',
        'PathFactory',
        'AlertFactory',
        'ResourceFactory',
        function ($scope, $modal, HistoryFactory, ClipboardFactory, PathFactory, AlertFactory, ResourceFactory) {
            // Init some vars
            $scope.path            = EditorApp.currentPath;
            $scope.webDir          = EditorApp.webDir;
            $scope.saveAndClose    = false;
            $scope.previewStep     = null;
            $scope.historyDisabled = HistoryFactory.getDisabled();

            PathFactory.setPath($scope.path);
            
            if (undefined != $scope.path.steps[0] && (null === $scope.path.steps[0].name || $scope.path.steps[0].name.length !== 0)) {
                // Root step has no name
                if (null !== $scope.path.name && $scope.path.name.length !== 0) {
                    // Give the same name than the path
                    $scope.path.steps[0].name = $scope.path.name;
                } else {
                    // Give a default name
                    $scope.path.steps[0].name = Translator.get('path_editor:root_default_name');
                }
            }

            HistoryFactory.init($scope.path);

            /**
             * Update History when general data change
             */
            $scope.updateHistory = function () {
                HistoryFactory.update($scope.path);
            };

            /**
             * Display step in the preview zone
             * @returns void
             */
            $scope.setPreviewStep = function (step) {
                if (step) {
                    $scope.previewStep = step;
                }
                else {
                    if (undefined !== $scope.path && null !== $scope.path && undefined !== $scope.path.steps[0]) {
                        $scope.previewStep = $scope.path.steps[0];
                    }
                }

                $scope.inheritedResources = ResourceFactory.getInheritedResources($scope.previewStep);
            };

            /**
             * Reload preview step to apply last changes
             * @returns void
             */
            $scope.updatePreviewStep = function() {
                // Update preview step
                var step = null;
                if (null !== $scope.previewStep) {
                    step = PathFactory.getStepById($scope.previewStep.id);
                }
                $scope.setPreviewStep(step);
            };

            if (null === $scope.previewStep) {
                $scope.setPreviewStep();
            }

            /**
             * Copy data into clipboard
             * @returns void
             */
            $scope.copy = function(data) {
                ClipboardFactory.copy(data);
            };

            /**
             * Paste current clipboard content
             * @returns void
             */
            $scope.paste = function(step) {
                ClipboardFactory.paste(step);
                HistoryFactory.update($scope.path);
            };

            /**
             * Undo last user modifications
             * @returns void
             */
            $scope.undo = function() {
                if (HistoryFactory.canUndo()) {
                    HistoryFactory.undo(PathFactory.getPath());

                    $scope.updatePreviewStep();
                }
            };

            /**
             * Redo last history modifications
             * @returns void
             */
            $scope.redo = function() {
                if (HistoryFactory.canRedo()) {
                    HistoryFactory.redo(PathFactory.getPath());

                    $scope.updatePreviewStep();
                }
            };

            $scope.save = function () {
                document[EditorApp.formName].submit();
            };

            $scope.closeEditor = function (returnUrl) {
                if (HistoryFactory.isEmpty()) {
                    // Path is not modified => exit without confirm
                    window.location = returnUrl;
                }
                else {
                    // There are pending modifications => ask for confirmation to know what to do
                    // Display confirm modal
                    var modalInstance = $modal.open({
                        templateUrl: EditorApp.webDir + 'bundles/innovapath/angularjs/Confirm/Partial/confirm-exit.html',
                        controller: 'ConfirmExitModalCtrl',
                        scope: $scope
                    });

                    modalInstance.result.then(function(method) {
                        if ('save' === method) {
                            $scope.$emit('saveAndClose');
                        }
                        else if ('discard') {
                            window.location = returnUrl;
                        }

                        return true;
                    });
                }
            };

            $scope.$on('saveAndClose', function (event) {
                $scope.saveAndClose = true;
                $scope.$apply();

                // Force submit the form
                document[EditorApp.formName].submit();
            });
        }
    ]);
})();
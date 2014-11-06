/**
 * History Factory
 */
(function () {
    'use strict';

    angular.module('HistoryModule').factory('HistoryFactory', [
        function () {
            var disabled = {
                redo: true,
                undo: true
            };

            var history = [];
            var historyState = -1;

            return {
                init: function (data) {
                    if (-1 === historyState) {
                        this.update(data);
                    }

                    return this;
                },

                getDisabled: function () {
                    return disabled;
                },

                canUndo: function () {
                    return !disabled.undo;
                },

                canRedo: function () {
                    return !disabled.redo;
                },

                /**
                 * Restore default history state (= empty history)
                 * @returns HistoryFactory
                 */
                clear: function () {
                    disabled.redo = true;
                    disabled.undo = true;

                    history = [];
                    historyState = -1;

                    return this;
                },

                /**
                 * Store current path in history
                 * @param path
                 * @returns HistoryFactory
                 */
                update: function (data) {
                    // Increment history state
                    historyState++;

                    // Store path in history stack
                    var dataCopy = jQuery.extend(true, {}, data);
                    history.push(dataCopy);

                    if (0 !== historyState) {
                        // History is not empty => enable the undo function
                        disabled.undo = false;
                    }
                    disabled.redo = true;

                    return this;
                },

                /**
                 * Get the last path state from history stack and set it as current path
                 * @returns HistoryFactory
                 */
                undo: function (currentData) {
                    // Decrement history state
                    historyState--;

                    // Restore data from history
                    /*console.log(currentData);*/
                    this.restoreData(currentData, this.getFromHistory(historyState));
                    console.log(currentData);

                    disabled.redo = false;
                    if (0 === historyState) {
                        // History stack is empty => disable the undo function
                        disabled.undo = true;
                    }

                    return this;
                },

                /**
                 * Get the next history state from history stack and set it as current path
                 * @returns HistoryFactory
                 */
                redo: function (currentData) {
                    // Increment history state
                    historyState++;

                    // Restore data from history
                    this.restoreData(currentData, this.getFromHistory(historyState));

                    disabled.undo = false;
                    if ( (history.length - 1) === historyState ) {
                        disabled.redo = true;
                    }

                    return this;
                },

                /**
                 * Get data stored at position index in history stack
                 * @param   {number} index
                 * @returns {object}
                 */
                getFromHistory : function (index) {
                    return history[index];
                },

                /**
                 * Restore data from history
                 * @param {object} currentData
                 * @param {object} historyData
                 * @returns {*}
                 */
                restoreData: function (currentData, historyData) {
                    // Delete data which not exist in History
                    for (var currentProp in currentData) {
                        if (currentData.hasOwnProperty(currentProp) && !historyData.hasOwnProperty(currentProp)) {
                            // Property doesn't exist in history => remove it
                            if (currentData instanceof Array) {
                                currentData.splice(currentProp, 1);
                            } else {
                                delete currentData[currentProp];
                            }
                        }
                    }

                    // Inject history data into current data
                    for (var historyProp in historyData) {
                        if (historyData.hasOwnProperty(historyProp)) {
                            if (typeof historyData[historyProp] !== 'object' || null === historyData[historyProp]) {
                                currentData[historyProp] = historyData[historyProp];
                            } else {
                                // Current property is an object => recursive call ! Oh yeah!
                                if (typeof currentData[historyProp] !== 'object') {
                                    // Initialize a new object into current data
                                    currentData[historyProp] = {};
                                }

                                /*console.log('jump into ' + historyProp);*/
                                this.restoreData(currentData[historyProp], historyData[historyProp]);
                            }
                        }
                    }

                    return this;
                }
            };
        }
    ]);
})();
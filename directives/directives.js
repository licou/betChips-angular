"use strict";
angular.module('betchipsApp').directive('currentBitcoin',[ function(){
	return {
		restrict: 'E',
		controller: 'currentBitcoinCtrl',
		templateUrl: 'tpl/currentBitcoinTpl.html'
	};

}]);

angular.module('betchipsApp').directive('virtualWallet',[ function(){
	return {
		restrict: 'E',
		controller: 'walletCtrl',
		templateUrl: 'tpl/walletTpl.html'
	};

}]);

angular.module('betchipsApp').directive('currentBets',[ function(){
	return {
		restrict: 'E',
		controller: 'betslipCtrl',
		templateUrl: 'tpl/betsTpl.html'
	};

}]);

angular.module('betchipsApp').directive('betHistory',[ function(){
	return {
		restrict: 'E',
		controller: 'betHistoryCtrl',
		templateUrl: 'tpl/betHistoryTpl.html'
	};

}]);

angular.module('betchipsApp').directive('placeBet',[ function(){
	return {
		restrict: 'E',
		controller: 'betCtrl',
		templateUrl: 'tpl/placeBetTpl.html'
	};

}]);

angular.module('betchipsApp').directive('bitcoinHistory',[ function(){
	return {
		restrict: 'E',
		controller: 'bitcoinHistoryCtrl',
		templateUrl: 'tpl/bitcoinHistoryTpl.html'
	};

}]);

"use strict";
angular.module('betchipsApp').controller('currentBitcoinCtrl',['$scope','bitcoinService', function($scope,bitcoinService){
	$scope.currentBitcoin = bitcoinService.getCurrentValue();
	$scope.increase = false;
	$scope.decrease = false;

	bitcoinService.connect();

	$scope.$on('newBitcoinValue', function(ev, newBitcoin) {
		$scope.currentBitcoin = newBitcoin.value;
		$scope.decrease = newBitcoin.status === 'decrease'? true:false;
		$scope.increase = newBitcoin.status === 'increase'? true:false;
	});

}]);

angular.module('betchipsApp').controller('walletCtrl',['$scope','walletService', function($scope,walletService){
	$scope.currentWallet = walletService.getWallet();

	$scope.$on('walletUpdated', function(ev, newValue) {
		$scope.currentWallet = newValue;
	});

}]);

angular.module('betchipsApp').controller('betCtrl',['$scope','$interval','$rootScope','bitcoinService','walletService','betsService', function($scope,$interval,$rootScope,bitcoinService,walletService,betsService){
	function TimeInterval(newInterval) {
		this.value = newInterval;
		this.toString = function(){
			if(this.value<1){
				return this.value*60 + " seconds";
			}
			else {
				return this.value+ " minutes";
			}
		};
	}
	
	var defaultBettingIntervals = [new TimeInterval(0.4),new TimeInterval(0.5),new TimeInterval(1)];

	$scope.currentWallet = parseFloat(walletService.getWallet());
	$scope.stake = null;
	$scope.time = null;
	$scope.bets = [];
	$scope.bitcoin = bitcoinService.getCurrentValue();

	

	$scope.add = function(status){
		if($scope.stake!==null && $scope.stake<=$scope.currentWallet && $scope.stake!=="" && typeof $scope.time === "number"){
			var bet = {
				id : betsService.getFreeId(),
				stake : $scope.stake,
				status : status,
				time : ($scope.time*60),
				settled : false,
				win : false,
				lost: false,
				bitcoin : $scope.bitcoin,
				stopCountdown : null,
				statusToString : function(){
					if(this.status === "decrease"){
				      return "lower";
				    }
				    else if(this.status === "increase"){
				      return "higher";
				    }
				    return false;
				},
				settleToString : function(){
					if(!this.win && !this.lost){
						return "DRAW";
					}
					else if(this.win){
				      return "WIN";
				    }
				    else if(this.lost){
				      return "LOST";
				    }
				    return "";
				},
				updateCountdown : function(){
                	this.time--;
	                if(this.time === 0){
						this.clearCountdown();
						this.settled = true;
						$rootScope.$broadcast('settleBet', this);
	                }
  				},
				countdown : function (){
                	var _self = this;
					this.stopCountdown = $interval(function() {
						_self.updateCountdown();
					},1000);
				},
				clearCountdown : function(){
                	$interval.cancel(this.stopCountdown);
                }
			};
			betsService.add(Object.create(bet));
			bet = {};
			resetBetScope();
			return true;
		}

		return false;
	};

	$scope.getDefaultsBettingInterval = function(){
		return defaultBettingIntervals;
	};

	function resetBetScope(){
		$scope.stake = "";
		$scope.time = defaultBettingIntervals[0].value;
	}

	$scope.$on('newBitcoinValue', function(ev, newBitcoin) {
		$scope.bitcoin = newBitcoin;
	});

	$scope.$on('walletUpdated', function(ev, newValue) {
		$scope.currentWallet = newValue;
	});

	resetBetScope();
}]);


angular.module('betchipsApp').controller('betslipCtrl',['$scope','bitcoinService','walletService','betsService', function($scope,bitcoinService,walletService,betsService){
	$scope.currentWallet = walletService.getWallet();
	$scope.currentBets = betsService.getCurrentList();

	$scope.removeBet = function(index){
		betsService.remove(index);
	};

	$scope.isCurrentBet = function(){
		return $scope.currentBets.length>0;
	};

	$scope.currentStateBet = function(bet){
		var currentBitcoin = bitcoinService.getCurrentValue();

		if((bet.status==="decrease" && bet.bitcoin.value>currentBitcoin) || (bet.status==="increase" && bet.bitcoin.value<currentBitcoin)) {
				return "winning";
		}
		else if(bet.bitcoin.value === currentBitcoin) {
			return "";
		}
		else {
			return "loosing";
		}
	};

	function settleBet(bet){
		var newBalance = $scope.currentWallet;
		var currentBitcoin = bitcoinService.getCurrentValue();

		if((bet.status==="decrease" && bet.bitcoin.value>currentBitcoin) || (bet.status==="increase" && bet.bitcoin.value<currentBitcoin)) {
				bet.win = true;
				newBalance = walletService.getWallet() + bet.stake*2;
		}
		else if(bet.bitcoin.value === currentBitcoin){
				newBalance = walletService.getWallet() + bet.stake;
		}
		else {
			bet.lost = true;
		}
		
		walletService.setWallet(newBalance);

		betsService.storeHistory(bet);
	}

	$scope.$on('settleBet', function(ev, bet) {
		settleBet(bet);
	});

	$scope.$on('walletUpdated', function(ev, newValue) {
		$scope.currentWallet = newValue;
	});

}]);

angular.module('betchipsApp').controller('bitcoinHistoryCtrl',['$scope', function($scope){
	$scope.bitcoins = [];
	var maxBitcoins = 10;
	$scope.$on('newBitcoinValue', function(ev, newBitcoin) {
		$scope.bitcoins.unshift(newBitcoin);
		var noOfBitcoins = $scope.bitcoins.length;
		if(noOfBitcoins>maxBitcoins){
			$scope.bitcoins.splice(maxBitcoins,noOfBitcoins);
		}
	});
}]);

angular.module('betchipsApp').controller('betHistoryCtrl',['$scope','betsService', function($scope,betsService){
	$scope.betHistory = betsService.getHistory();
}]);

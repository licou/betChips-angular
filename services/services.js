"use strict";

/**************************
*  CURRENT BITCOIN SERVICE
***************************/
angular.module('betchipsApp').factory('bitcoinService', ['$http','$interval','$rootScope', function($http,$interval,$rootScope) {
  
  var defaultInterval = 20000; //20 sec
  var bitcoinInterval = null; //to avoid having multiple intervals
  var connected = false; //needed for broadcasting

  var bitcoin = {};
  var currentBitcoin = {};
  currentBitcoin.value = null;
  currentBitcoin.date = null;
  currentBitcoin.status = null;
  
  bitcoin.connect = function(customInterval){
  	customInterval = typeof customInterval !== 'undefined' ? customInterval : defaultInterval;
  	
  	if(bitcoinInterval !== null){
  		resetBitcoinInterval();
  	}

  	bitcoinInterval = $interval(function(){
  	  	bitcoin.getCurrentBitcoin();
  	},customInterval);

    connected = true;
  };

  bitcoin.getCurrentBitcoin = function(){
  	$http.get('https://api.bitcoinaverage.com/ticker/USD/')
    .then(function(response){
      var data = response.data;
      updateCurrentBitcoin(data.bid, data.ask, data.timestamp);
    }, function(response){
      console.log('/!\ error on receiving data from api...');
      console.log(response);
    });
  };

  bitcoin.getCurrentValue = function(){
    return currentBitcoin.value;
  };

  function updateCurrentBitcoin(bid,ask,date){
  	var currentBitcoinValue = currentBitcoin.value;
    var newBitcoinValue = ((bid+ask)/2).toFixed(2);

    currentBitcoin = {}; //remove the reference 
    currentBitcoin.date = date;

    if(currentBitcoinValue>newBitcoinValue){
      currentBitcoin.status = "decrease";
    }
    else if (currentBitcoinValue<newBitcoinValue){
        currentBitcoin.status = "increase";
    }
    else {
      currentBitcoin.status = "equals";
    }

    currentBitcoin.value = newBitcoinValue;

    if(connected){
        $rootScope.$broadcast('newBitcoinValue', currentBitcoin);
    }

  }

  //RESET THE INTERVAL
  function resetBitcoinInterval(){
  	$interval.cancel(bitcoinInterval);
    bitcoinInterval = undefined;
  }

  bitcoin.getCurrentBitcoin();
  return bitcoin;
}]);

/**************************
*  BETS SERVICE
***************************/
angular.module('betchipsApp').factory('betsService', ['$rootScope','walletService', function($rootScope,walletService) {
  var bets = {};
  var betList = [];
  var betHistory = [];
  
  bets.getCurrentList = function(){
    return betList;
  };

  bets.getFreeId = function(){
    return "B"+betList.length;
  };

  bets.getHistory = function(){
    return betHistory;
  };

  bets.add = function(newBet){
    newBet.countdown();
    betList.unshift(newBet);
    //update wallet
    var currentWallet = walletService.getWallet();
    walletService.setWallet(currentWallet-newBet.stake);
  };

  bets.remove = function(index){
    //update wallet
    var currentWallet = walletService.getWallet();
    walletService.setWallet(currentWallet+betList[index].stake);
    betList[index].clearCountdown();
    betList.splice(index,1);
    $rootScope.$broadcast('removeBet', betList);
  };

  bets.storeHistory = function(oldBet){
    betHistory.unshift(oldBet);
    var index = betList.indexOf(oldBet);
    betList.splice(index,1);
  };

  return bets;
}]);

/**************************
*  WALLET SERVICE
***************************/
angular.module('betchipsApp').factory('walletService', ['$rootScope', function($rootScope) {
  var wallet = {};
  var current = 100;

  wallet.getWallet = function(){
    return current;
  };

  wallet.setWallet = function(newValue){
    current = newValue;
    $rootScope.$broadcast('walletUpdated', current);
  };

  return wallet;
}]);
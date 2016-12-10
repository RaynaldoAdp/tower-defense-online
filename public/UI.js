var socket = io();

$(document).ready(function(){

    socket.on('player1Found', function(){
        $('.firstPlayer').addClass('hidden');
        $('.roleChoice').html(templateForPlayer1);
        getRole();
    })
    
    socket.on('player2Found', function(){
        $('.firstPlayer').addClass('hidden');
        $('.roleChoice').html(templateForPlayer2);
    })
});

var templateForPlayer1 =  "<form class='roleForm'>" +
                                "<label for='chooseRole'> Choose a role! </label>" +
    	 		                "<select class='chooseRole' name='chooseRole'>" +
    			        	        "<option value='Attacker'> Attacker </option>" +
    						        "<option value='Defender'> Defender </option>" +
    				            "</select>" +
    				            "<button type='submit'> Choose this role </button>"+
				          "</form>";

				
var templateForPlayer2 = "<h1>Please wait as the other player is choosing roles</h1>";

function getRole(){
    $('.roleForm').submit(function(event){
        event.preventDefault();
        alert(1234);
        var role = $('.chooseRole').val();
        socket.emit('roleChosen', role);
    })
}




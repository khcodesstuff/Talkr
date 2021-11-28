// const socket = io();

$(function(){
    const socket = io();

    //
    // Room
    //
    socket.emit('joinRoom', () => {
        displayEventMsg('connected', 'You');
    });

    socket.on('roomJoined', (who_connected) => {
        displayEventMsg('connected', who_connected);
    });
    //

    socket.on('logoff', (who_loggedoff) => {
        displayEventMsg('logged-off', who_loggedoff);
    });

    //
    // Receiving messages
    //
    socket.on('message', (data) => {
        displayChatMsg('received', data);
    });

    //
    // Sending messages
    //
    
    $('#msg-input').on('keyup', function(e){
        if (e.key == 'Enter'){
            $('#send-btn').trigger('click');
        }
    });

    $('#send-btn').on('click', function(){
        const message = $('#msg-input').val();

        if (message !== ''){
            // user_name and user_color defined in template
            data = {
                message,
                user_name,
                user_color
            }
            socket.emit('message', data);
            
            displayChatMsg('sent', data);
            
            $('#msg-input').val('');
        }
    });
    //
});

function displayEventMsg(type, who){
    $('.chat-msgs-log').append($('#event-msg-template').html());
    $('.event-msg:last-child .msg-bubble').addClass(type + '-msg-bubble');
    $('.event-msg:last-child .msg').text(who + ' ' + type);
}

function displayChatMsg(type, data){
    if (type == 'sent'){
        // Change bubbles of previous messages
        $('.msg-bubble-right').css({'border-radius': '40px'})
        $('.user-circle-right').remove();
        
        // Add message
        $('.chat-msgs-log').append($('#sent-msg-template').html());
        $('.chat-msg-sent:last-child .msg').text(data.message);
        $('.chat-msg-sent:last-child .msg-bubble-right, .chat-msg-sent:last-child .user-circle')
            .css('background-color', data.user_color);
        
        $('.chat-msgs-log').scrollTop($('.chat-msgs-log')[0].scrollHeight);
    }
    else if (type == 'received'){
        // Change bubbles of previous messages
        $('.msg-bubble-left').css({'border-radius': '40px'})
        $('.user-circle-left').remove();
        
        // Add message
        $('.chat-msgs-log').append($('#received-msg-template').html());
        $('.chat-msg-received:last-child .msg').text(data.message);
        $('.chat-msg-received:last-child .msg-bubble-left, .chat-msg-received:last-child .user-circle')
            .css('background-color', data.user_color);
        
        $('.chat-msgs-log').scrollTop($('.chat-msgs-log')[0].scrollHeight);
    }
}
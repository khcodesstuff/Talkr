$(function(){
    // Popup window (show different buttons)
    $('#join-btn').on('click', function(){
        $('#popup-fade').fadeIn(200);
        $('#join-popup-btn').show();
        $('#popup-create-join').css('display', 'flex');
        $('#popup-create-join').animate({top: '50%', opacity: '1'}, 300);
    });
    $('#create-btn').on('click', function(){
        $('#popup-fade').fadeIn(200);
        $('#create-popup-btn').show();
        $('#popup-create-join').css('display', 'flex');
        $('#popup-create-join').animate({top: '50%', opacity: '1'}, 300);
    });

    // Fade
    $('#popup-fade').on('click', function(){
        $('#popup-fade').fadeOut(200);

        // reset buttons
        $('#join-popup-btn').hide();
        $('#create-popup-btn').hide();

        // reset errors
        $('#chat-name-err').hide();
        $('#user-name-err').hide();

        // reset inputs and color selection
        $('#chat-name').val('')
        $('#user-name').val('')
        $('#colors > div').removeClass('clr-selected');
        $('#clr-1').addClass('clr-selected');

        $('#popup-create-join').css({
            'display': 'none',
            'top': '70%',
            'opacity': '0'
        });
    });

    // Color selection
    $('#colors > div').on('click', function(event){
        $('#colors > div').removeClass('clr-selected');
        $(event.target).addClass('clr-selected');
    });

    // Reset errors on input
    $('#chat-name').on('input', function(){
        $('#chat-name-err').fadeOut(50);
    });
    $('#user-name').on('input', function(){
        $('#user-name-err').fadeOut(50);
    });

    // Create room
    $('#create-popup-btn, #join-popup-btn').on('click', function(event){
        //
        // Form (inputs) validation
        //
        var is_valid = true;
        // Are special characters present
        const is_chat_name_clean = /^[a-zA-Z0-9]*$/.test($('#chat-name').val());
        const is_user_name_clean = /^[a-zA-Z0-9]*$/.test($('#user-name').val());
        if (! is_chat_name_clean && ! is_user_name_clean){
            show_inp_error('#chat-name-err, #user-name-err', 'Special characters and spaces are not allowed');
            is_valid = false;
        }
        else if (! is_chat_name_clean){
            show_inp_error('#chat-name-err', 'Special characters and spaces are not allowed');
            is_valid = false;
        }
        else if (! is_user_name_clean){
            show_inp_error('#user-name-err', 'Special characters and spaces are not allowed');
            is_valid = false;
        }
        // Are inputs filled in
        const chat_name_inp = document.getElementById('chat-name');
        const user_name_inp = document.getElementById('user-name');
        if (! chat_name_inp.validity.valid && ! user_name_inp.validity.valid){
            show_inp_error('#chat-name-err, #user-name-err', 'This field is required');
            is_valid = false;
        }
        if (! chat_name_inp.validity.valid){
            show_inp_error('#chat-name-err', 'This field is required');
            is_valid = false;
        }
        if (! user_name_inp.validity.valid){
            show_inp_error('#user-name-err', 'This field is required');
            is_valid = false;
        }
        if (! is_valid){ return; }
        //

        fdata = {
            'chat_name': $('#chat-name').val(),
            'user_name': $('#user-name').val()
        }

        $.ajax({
            // headers:{
            //     'X-CSRFToken': getCookie('csrftoken')
            // },
            url: '/check_room_avail',
            type: 'POST',
            data: JSON.stringify(fdata),
            contentType: 'application/json',
            success: function(response){
                console.log(response['avail'])
                
                // Determine what button was pressed
                const is_create_chat_event = event.target.id == 'create-popup-btn'; 
                const is_join_chat_event = event.target.id == 'join-popup-btn';

                if (response['avail'] === 'nonexistent'){
                    if (is_create_chat_event){
                        // Setting up form
                        add_color_val_to_form();
                        // Submitting form
                        $('#create-join-info-form').attr('action', 'chat_create');
                        $('#create-join-info-form').trigger('submit');
                    }
                    else if (is_join_chat_event){
                        show_inp_error('#chat-name-err', 'Chat with this name does not exist');
                    }
                }
                else if (response['avail'] === 'exists'){
                    if (is_create_chat_event){
                        show_inp_error('#chat-name-err', 'Chat with this name already exists');
                    }
                    else if (is_join_chat_event){
                        // Setting up form
                        add_color_val_to_form();
                        // Submitting form
                        $('#create-join-info-form').attr('action', 'chat_join');
                        $('#create-join-info-form').trigger('submit');
                        
                    }
                }
                else if (response['avail'] === 'name_busy'){
                    console.log('name alr exists');

                    show_inp_error('#user-name-err', 'User name already exists');
                }
            },
            error: function(response){
                console.log(response);
                console.log('Error');
            }
        });
    });
});

function show_inp_error(elements, message){
    $(elements).text(message);
    $(elements).fadeIn(50);
}

function add_color_val_to_form(){
    // Remove additional elements if already exist
    $('#create-join-info-form').find('input[name=color]').remove();
        
    // Add color value to form
    var clr = $('.clr-selected').css('background-color');
    $('<input />').attr('type', 'hidden')
    .attr('name', 'color')
    .attr('value', clr)
    .appendTo('#create-join-info-form')
}

function getCookie(name){
    let cookieValue = null;
    if (document.cookie && document.cookie !== ''){
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++){
            const cookie = cookies[i].trim();
            // Is cookie with the name we want
            if (cookie.substring(0, name.length + 1 ) === (name + '=')){
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
jQuery(function($) {
    $('#existing_account').on('change', function() {
        // Hide or display
        if ($(this).val() == 'Yes') {
            $('#existing_client').showAnd();
        } else {
            $('#existing_client').hideAnd();
        }
    });
    $('#existing_account').trigger('change');

    $('#for_yourself_or_someone').on('change', function() {
        // Hide or display
        if ($(this).val() == 'On behalf of someone') {
            $('#on_behalf').showAnd();
            $('#existing_account_label').text('Is the person(s) you\'re applying on behalf of an existing client?');
        } else {
            $('#on_behalf').hideAnd();
            $('#existing_account_label').text('Are you an existing client?');
        }
    });
    $('#for_yourself_or_someone').trigger('change');
});
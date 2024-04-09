jQuery(function($) {
    /*$(document).on('click', '#save-cbl', function(e) {
    	e.preventDefault();

    	// They must enter a valid email address to attach to the form
    	// submission.
    	

    	alert('would save');
    });*/

    $(document).on('click', '#cbl-submit', function(e) {
        e.preventDefault();

        // They must enter a valid email address to attach to the form
        // submission.
        $('#cbl-email').val($('#cbl-email-enter').val());
        $('#cbl-pass').val($('#cbl-pass-enter').val());

        $('#app-form').submit();
    });
    $(document).on('click', '#reset-submit', function(e) {
        e.preventDefault();

        // They must enter a valid email address to attach to the form
        // submission.
        window.location = 'reset.php';
    });
    $(document).on('click', '.add-trigger', function(e) {
        addInstance(this);

        e.preventDefault();
    });

    $(document).on('click', '.add-trigger-inner', function(e) {
        addInstance(this, null, null, true);

        e.preventDefault();
    });

    $(document).on('click', '.instance a.remove-instance', function(e) {
        if ($(this).closest('.instance').attr('data-chainlink') > 0) {
            alert('You can not remove this beneficial owner because it is tied to an entity above.');
        } else {
            var myKey = $(this).closest('.instance').attr('data-key');
            var myChildrenLength = $(this).closest('.group').find('.instance[data-chainlink="' + myKey + '"]').length;

            if (myChildrenLength >= 1) {
                alert('You can not remove this beneficial owner because it is an entity and therefore has additional individual owners below it. Switch it to an Individual first.');
            } else {
                $(this).closest('.instance').remove();
            }
        }

        e.preventDefault();
    });

    $('.select2js-multiple').each(function() {
        var thisId = $(this).attr('id');

        if (thisId.indexOf('TEMPLATE_INSTANCE_ID') == -1 && thisId.indexOf('INNER_INSTANCE_ID') == -1) {
            $('select#' + thisId).select2();
        }
    });

    $('input.datepicker').each(function() {
        var thisId = $(this).attr('id');

        if (thisId.indexOf('TEMPLATE_INSTANCE_ID') == -1 && thisId.indexOf('INNER_INSTANCE_ID') == -1) {
            $(this).Zebra_DatePicker({
                start_date: new Date(1980, 0, 1)
            });
        }
    });
});

String.prototype.replaceAll = function(search, replace) {
    if (replace === undefined) {
        return this.toString();
    }
    return this.split(search).join(replace);
}


jQuery.fn.extend({
    showAnd: function() {
        // For each of the selected elements children, show the element and
        // enable all child input fields
        this.find('input').removeAttr('disabled');
        this.find('select').removeAttr('disabled');
        this.find('textarea').removeAttr('disabled');

        this.removeClass('omhidden').show();

        this.find('.omhidden input').attr('disabled', 'disabled');
        this.find('.omhidden select').attr('disabled', 'disabled');
        this.find('.omhidden textarea').attr('disabled', 'disabled');
    },
    hideAnd: function() {
        // For each of the selected elements children, hide the element and
        // disable all child input fields
        //this.find('input[type="text"]').val('');
        this.find('input').attr('disabled', 'disabled');
        //this.find('select').val('').attr('disabled','disabled');
        //this.find('textarea').val('').attr('disabled','disabled');

        this.find('select').attr('disabled', 'disabled');
        this.find('textarea').attr('disabled', 'disabled');

        this.removeClass('omhidden').addClass('omhidden').hide();
    }
});

function addInstance(elem, chainLink, chainParent, isInner) {
    var groupedField = $(elem).closest('div.group');
    var groupedFieldId = groupedField.attr('id').replace('group-', '');

    var templateString = 'TEMPLATE_INSTANCE_ID';

    if (isInner === true) {
        templateString = 'INNER_INSTANCE_ID';
    }

    var maxInstanceId = 1;

    if (typeof chainLink !== 'undefined' && chainLink !== null) {
        chainLink = parseInt(chainLink);
        chainParent = parseInt(chainParent);
    } else {
        chainLink = 0;
        chainParent = 0;
    }

    groupedField.children('.instance').each(function() {
        loopingInstanceId = parseInt(this.id.replace("group-" + groupedFieldId + "-instance-", ""));

        if (loopingInstanceId > parseInt(maxInstanceId)) {
            maxInstanceId = loopingInstanceId;
        }
    });

    // Duplicate 'template' as 'instance'
    var groupedFieldTemplate = groupedField.children('.template');

    var newInstanceKey = (maxInstanceId + 1);
    var templateHtml = groupedFieldTemplate.html().replaceAll(templateString, newInstanceKey);

    var newInstanceHtml = '<div class="instance" id="group-' + groupedFieldId + '-instance-' + newInstanceKey + '" data-chainlink="' + chainLink + '" data-chainparent="' + chainParent + '">' + templateHtml + '</div>';

    var keyTitle = $('div.instance[data-chainlink="0"]').length;

    if (chainLink > 0) {
        groupedField.children('.instance#group-' + groupedFieldId + '-instance-' + chainLink).after(newInstanceHtml);

        // Update hidden input fields
        $('div#group-' + groupedFieldId + '-instance-' + newInstanceKey).find('input#chainlink_' + newInstanceKey).val(chainLink);
        $('div#group-' + groupedFieldId + '-instance-' + newInstanceKey).find('input#chainparent_' + newInstanceKey).val(chainParent);

        $('div#group-' + groupedFieldId + '-instance-' + newInstanceKey).find('.the-undersigned-' + newInstanceKey).remove();

        // Find number of "parent" instances (i.e. not part of a chain)
        keyTitle = parseInt(groupedField.children('.instance#group-' + groupedFieldId + '-instance-' + chainLink).find('.bo-keytitle > span').text());
    } else {
        keyTitle = parseInt(keyTitle) + 1;
        groupedField.children('.instance').last().after(newInstanceHtml);

    }

    $('div#group-' + groupedFieldId + '-instance-' + newInstanceKey).find('.bo-keytitle > span').text(keyTitle);



    $('select#beneficial_owner_nationalities_' + newInstanceKey).select2();
    $('select#beneficial_owner_source_of_wealth_' + newInstanceKey).select2();
    $('select#controlling_person_nationalities_' + newInstanceKey).select2();

    $('input.datepicker').each(function() {
        var thisId = $(this).attr('id');

        if (thisId.indexOf('TEMPLATE_INSTANCE_ID') == -1 && thisId.indexOf('INNER_INSTANCE_ID') == -1) {
            $(this).Zebra_DatePicker({
                start_date: new Date(1980, 0, 1)
            });
        }
    });

    return $('div.instance#group-' + groupedFieldId + '-instance-' + newInstanceKey);
}
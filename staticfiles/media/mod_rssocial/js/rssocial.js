RSSocial = {
    captionEqualWidth: function() {
        jQuery(document).ready(function($) {
            var maxWidth = Math.max.apply(null, $('.rssocial-caption').map(function() {
                return $(this).outerWidth(true);
            }).get());
            $('.rssocial-caption').each(function() {
                $(this).css('min-width', '155px');
                $(this).css('width', maxWidth + 'px');
            });
        });
    },
    showOnClick: function(positioning, floating, id, mode, fixed, caption, icons_number) {
        jQuery(document).ready(function($) {

            // Add css properties for Safari browser
            if ($.browser.safari) {
                $('.rssocial-left-background').css('padding-right', '15px !important');
                $('.rssocial-right-background').css('padding-right', '15px !important');
                $('.rssocial-sharing-button-right').css('-webkit-padding-start', '2px');
                $('.rssocial-sharing-button-left').css('-webkit-padding-start', '2px');
            }

            if ($(window).width() < 480 && positioning == 'floating') {
                var list = $('#rssocial-ul-' + id);
                var container = $('#rssocial-' + id);
                var button = $('#rssocial-slide-button');
                var dimension = 0;
                var diff = 0;
                var button_dim = 0;

                //Floating class for container
                container.removeClass('rssocial-floating' + floating);
                container.addClass('rssocial-' + mode + '-floating-' + floating);

                // Floating - bottom has always fixed position
                if (floating == 'bottom') {
                    container.removeClass('rssocial-absolute');
                    container.addClass('rssocial-fixed');
                }

                // Replace floating class
                if (list.hasClass('rssocial-floating-' + floating)) {
                    list.removeClass('rssocial-floating-' + floating);
                    list.addClass('rssocial-' + mode + '-floating-' + floating);
                }

                // Get dimension of socials list
                if (mode == 'icons') {
                    $('#rssocial-slide-button').css('width', '42px');
                    button_dim = $('#rssocial-slide-button').width();
                    if (floating == 'left' || floating == 'right') {
                        container.css('width', list.width() + button_dim + 12 + 'px');
                        if (caption == 0) {
                            container.css('min-width', '92px');
                        } else {
                            container.css('min-width', '273px');
                        }
                        dimension = container.width() - button_dim;
                    } else {
                        if (caption == 0) {
                            container.css('width', '262px');
                            var rows = Math.ceil(icons_number / 6);

                            container.css('height', (rows + 1) * 44 + 'px');
                        } else {
                            container.css('width', '240px');
                            container.css('height', (parseInt(icons_number) + 1) * 44 + 'px');
                        }
                        container.css('margin-left', '-' + (container.width() / 2) + 'px');
                        if (floating == 'top') {
                            diff = 2;
                        } else {
                            diff = -2;
                        }
                        dimension = container.height() - button_dim - diff;
                    }
                } else {
                    if (floating == 'left' || floating == 'right') {
                        var maxWidth = 0;
                        $('#rssocial-sharing-button').each(function(i) {
                            if ($(this).width() > maxWidth)
                                maxWidth = $(this).width();
                        });

                        if ($.browser.safari) {
                            container.css('width', maxWidth + 98 + 'px');
                        } else {
                            container.css('width', maxWidth + 83 + 'px');
                        }
                        dimension = container.width() - 50;
                    } else {
                        container.css('width', '240px');
                        container.css('height', list.height() + 65 + 'px');
                        if (floating == 'top') {
                            dimension = container.height();
                        } else {
                            dimension = container.height() - 30;
                        }
                        container.removeClass('rssocial-floating-' + floating);
                        container.addClass('rssocial-' + mode + '-floating-' + floating);
                    }
                }

                // Hide socials list
                if (positioning == 'floating') {
                    list.addClass('rssocial-nonvisible');
                }
                container.css(floating, '-' + dimension + 'px');

                button.click(function() {

                    // Hide/show socials floating-fixed position
                    if (list.hasClass('rssocial-nonvisible')) {
                        var params = {};
                        if (floating == 'bottom') {
                            if (mode == 'sharing') {
                                params[floating] = '20px';
                            } else {
                                params[floating] = '-4px';
                            }
                        } else {
                            params[floating] = '0px';
                        }
                        list.removeClass('rssocial-nonvisible');
                        list.addClass('rssocial-visible');
                        container.animate(params, 'slow');
                    } else {
                        var params = {};
                        params[floating] = dimension + 'px';
                        params[floating] = '-' + dimension + 'px';
                        container.animate(params, {
                            duration: 'slow',
                            complete: function() {
                                list.removeClass('rssocial-visible');
                                list.addClass('rssocial-nonvisible');
                            }
                        });
                    }
                });
            }
        });
    },
    moveToBody: function(id) {
        jQuery(document).ready(function($) {
            $('#rssocial-' + id).appendTo(document.body);
        });
    },
    setListWidth: function(id, position) {
        jQuery(document).ready(function($) {
            if (position == 'inline') {
                $('#rssocial-ul-' + id).width($('#rssocial-' + id).width());
            }
        });
    },
    floatingResize: function(id, position, floating) {
        jQuery(window).resize(resize_function);
        jQuery(document).ready(resize_function);

        function resize_function() {
            var width = jQuery(window).width();
            if (position == 'floating' && (floating == 'top' || floating == 'bottom') && width > 480 && width <= 1000) {
                var new_width = width - width / 10;
                var margin_left = new_width / 2;
                jQuery('.rssocial-floating-' + floating).css('width', new_width + 'px');
                jQuery('.rssocial-floating-' + floating).css('margin-left', '-' + margin_left + 'px');
            }
        }
    }
};
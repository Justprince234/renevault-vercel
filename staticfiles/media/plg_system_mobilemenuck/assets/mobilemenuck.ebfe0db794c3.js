/**
 * @copyright	Copyright (C) 2018 Cedric KEIFLIN alias ced1870
 * https://www.joomlack.fr
 * Mobile Menu CK
 * @license		GNU/GPL
 * Version 1.1.4
 * */

/*
- Version 1.2.0 : 24/09/21 add flyout effect
- Version 1.1.7 : 21/09/21 add option for a lock button
- Version 1.1.6 : 18/05/21 add compatibility with scrollTo and lightbox to close the menu when using a merged menu
- Version 1.1.5 : fix issue with merged menu and fade effect
- Version 1.1.4 : fix issue with merged menu, add compatibility with Mediabox CK
- Version 1.1.3 : fix issue with maximenu pushdown layout
- Version 1.1.2 : fix issue with image only in the menu item
- Version 1.1.1 : fix issue with description shown in the menu bar
*/

(function($) {
    // "use strict";
    var MobileMenuCK = function(el, opts) {
        if (!(this instanceof MobileMenuCK)) return new MobileMenuCK(el, opts);

        if (!el.length) {
            console.log('MOBILE MENU CK ERROR : Selector not found : ' + el.selector);
            return;
        }

        var defaults = {
            useimages: '0',
            container: 'body', // body, menucontainer, topfixed
            showdesc: '0',
            showlogo: '1',
            usemodules: '0',
            menuid: '',
            mobilemenutext: 'Menu',
            showmobilemenutext: '',
            titletag: 'h3',
            displaytype: 'accordion', // flat, accordion, fade, push, flyout
            displayeffect: 'normal', // normal, slideleft, slideright, slideleftover, sliderightover, topfixed, open
            menubarbuttoncontent: '',
            topbarbuttoncontent: '',
            uriroot: '',
            mobilebackbuttontext: 'Back',
            menuwidth: '300',
            openedonactiveitem: '1',
            loadanchorclass: '1',
            langdirection: 'ltr',
            menuselector: 'ul',
            childselector: 'li',
            merge: '',
            beforetext: '',
            aftertext: '',
            tooglebaron: 'all', // all, button
            tooglebarevent: 'click', // click, mouseover
            mergeorder: ''
                // Logo options
                ,
            logo_where: '1' // 1, 2, 3
                ,
            logo_source: 'maximenuck' // maximenuck, custom
                ,
            logo_image: '' // the image src
                ,
            logo_link: '' // the link url
                ,
            logo_alt: '' // the alt tag
                ,
            logo_position: 'left' // left, center, right
                ,
            logo_width: '' // image width
                ,
            logo_height: '' // image height
                ,
            logo_margintop: '' // margin top
                ,
            logo_marginright: '' // margin right
                ,
            logo_marginbottom: '' // margin bototm
                ,
            logo_marginleft: '' // margin left
                ,
            logo_class: ''
                // lock button
                ,
            lock_button: '0'
        };

        var opts = $.extend(defaults, opts);
        var t = this;
        // store the menu
        t.menu = (el[0].tagName.toLowerCase() == opts.menuselector) ? el : el.find(opts.menuselector).first();

        // exit if no menu
        if (!t.menu.length)
            return false;

        if (t.menu.length > 1) {
            var MobileMenuCKs = window.MobileMenuCKs || [];
            t.menu.each(function() {
                MobileMenuCKs.push(new MobileMenuCK($(this), opts));
            });
            window.MobileMenuCKs = MobileMenuCKs;
            return MobileMenuCKs;
        }

        // store all mobile menus in the page
        window.MobileMenuCKs = window.MobileMenuCKs || [];
        window.MobileMenuCKs.push(this);

        if (!t.menu.attr('data-mobilemenuck-id')) {
            // var now = new Date().getTime();
            // var id = 'mobilemenuck-' + parseInt(now, 10);
            t.menu.attr('data-mobilemenuck-id', opts.menuid);
        } else {
            return this;
        }
        t.mobilemenuid = opts.menuid + '-mobile';
        t.mobilemenu = $('#' + t.mobilemenuid);
        t.mobilemenu.attr('data-id', opts.menuid);

        // exit if mobile menu already exists
        if (t.mobilemenu.length)
            return this;

        // store all mobile menus in the page by ID
        window.MobileMenuCKByIds = window.MobileMenuCKByIds || [];
        window.MobileMenuCKByIds[opts.menuid] = this;

        if (t.menu.prev(opts.titletag))
            t.menu.prev(opts.titletag).addClass('mobilemenuck-hide');

        t.init = function() {
            var activeitem, logoitem;
            if (t.menu.find('li.maximenuck').length) {
                t.menutype = 'maximenuck';
                t.updatelevel();
            } else if (t.menu.find('li.accordeonck').length) {
                t.menutype = 'accordeonck';
            } else {
                t.menutype = 'normal';
            }

            // for menuck
            if ($('.maxipushdownck', t.menu.parent()).length) {
                var menuitems = $(t.sortmenu(t.menu.parent()));
            } else {
                if (t.menutype == 'maximenuck') {
                    var menuitems = $('li.maximenuck', t.menu);
                } else if (t.menutype == 'accordeonck') {
                    var menuitems = $('li.accordeonck', t.menu);
                } else {
                    var menuitems = $(opts.childselector, t.menu);
                }
            }

            // loop through the tree
            t.setDataLevelRecursive(t.menu, 1);

            // only add the menu bar if not merged with another
            if (!opts.merge) {
                if (opts.container == 'body' ||
                    opts.container == 'topfixed' ||
                    opts.displayeffect == 'slideleft' ||
                    opts.displayeffect == 'slideright' ||
                    opts.displayeffect == 'topfixed'
                ) {
                    $(document.body).append('<div id="' + t.mobilemenuid + '" class="mobilemenuck ' + opts.langdirection + '"></div>');
                } else {
                    el.after($('<div id="' + t.mobilemenuid + '" class="mobilemenuck"></div>'));
                }
            }
            t.mobilemenu = $('#' + t.mobilemenuid);
            t.mobilemenu.attr('data-id', opts.menuid);
            // don't create the top bar if merged with another
            if (opts.merge) {
                t.mobilemenu.html = '';
            } else {
                // lock button
                var lockbuttonhtml = '';
                if (opts.lock_button == '1') {
                    let icon = sessionStorage.getItem('mobilemenuck-lock') == '1' ? t.getSvg('lock') : t.getSvg('unlock');
                    lockbuttonhtml = '<div class="mobilemenuck-lock-button mobilemenuck-button">' + icon + '</div>';
                }
                t.mobilemenu.html = '<div class="mobilemenuck-topbar"><div class="mobilemenuck-title">' + opts.mobilemenutext + '</div>' + lockbuttonhtml + '<div class="mobilemenuck-button">' + opts.topbarbuttoncontent + '</div></div>';
            }
            t.mobilemenu.html += opts.beforetext ? '<div class="mobilemenuck-beforetext">' + opts.beforetext + '</div>' : '';
            menuitems.each(function(i, itemtmp) {
                itemtmp = $(itemtmp);
                var itemanchor = t.validateitem(itemtmp);
                if (itemanchor) {
                    t.mobilemenu.html += '<div class="mobilemenuck-item">';
                    // itemanchor = $('> a.menuck', itemtmp).length ? $('> a.menuck', itemtmp).clone() : $('> span.separator', itemtmp).clone();
                    if (opts.showdesc == '0') {
                        if ($('span.descck', itemanchor).length)
                            $('span.descck', itemanchor).remove();
                    }
                    var itemhref = itemanchor.attr('data-href') ? ' href="' + itemanchor.attr('data-href') + '"' : (itemanchor.attr('href') ? ' href="' + itemanchor.attr('href') + '"' : '');
                    if (itemanchor.attr('target')) itemhref += ' target="' + itemanchor.attr('target') + '"';

                    if (itemtmp.attr('data-mobiletext')) {
                        $('span.titreck', itemanchor).html(itemtmp.attr('data-mobiletext'));
                    }
                    var itemmobileicon = '';
                    if (itemtmp.attr('data-mobileicon')) {
                        itemmobileicon = '<img class="mobilemenuck-icon" src="' + opts.uriroot + '/' + itemtmp.attr('data-mobileicon') + '" />';
                    }
                    // var itemanchorClass = '';
                    var itemanchorClass = (opts.loadanchorclass == '1' && itemanchor.attr('class')) ? itemanchor.attr('class') : '';
                    // check for specific class on the anchor to apply to the mobile menu
                    if (itemanchor.hasClass('scrollTo') && opts.loadanchorclass != '1') {
                        itemanchorClass += 'scrollTo';
                    }
                    itemanchorClass = (itemanchorClass) ? ' class="' + itemanchorClass + '"' : '';
                    itemanchorRel = (itemanchor.attr('rel')) ? ' rel="' + itemanchor.attr('rel') + '"' : '';
                    if (opts.useimages == '1' && ($('> * > img', itemtmp).length || $('> * > * > img', itemtmp).length)) {
                        datatocopy = itemanchor.html();
                        t.mobilemenu.html += '<div class="menuck ' + itemtmp.attr('class') + '"><a ' + itemhref + itemanchorClass + itemanchorRel + '>' + itemmobileicon + '<span class="mobilemenuck-item-text">' + datatocopy + '</span></a></div>';
                    } else if (opts.usemodules == '1' && (
                            $('> div.menuck_mod', itemtmp).length ||
                            $('> div.maximenuck_mod', itemtmp).length ||
                            $('> div.accordeonckmod', itemtmp).length
                        )) {
                        datatocopy = itemanchor.html();
                        t.mobilemenu.html += '<div class="' + itemtmp.attr('class') + '">' + itemmobileicon + datatocopy + '</div>';
                    } else {
                        if (itemtmp.attr('data-mobiletext')) {
                            var datatocopy = itemtmp.attr('data-mobiletext');
                        } else {
                            if (opts.useimages == '0') {
                                itemanchor.find('> img').remove();
                            }
                            var datatocopy = itemanchor.html();
                        }
                        t.mobilemenu.html += '<div class="menuck ' + itemtmp.attr('class') + '"><a ' + itemhref + itemanchorClass + itemanchorRel + '>' + itemmobileicon + '<span class="mobilemenuck-item-text">' + datatocopy + '</span></a></div>';
                    }

                    var itemlevel = $(itemtmp).attr('data-level');
                    var j = i;
                    while (menuitems[j + 1] && !t.validateitem(menuitems[j + 1]) && j < 1000) {
                        j++;
                    }
                    if (menuitems[j + 1] && t.validateitem(menuitems[j + 1])) {
                        var itemleveldiff = $(menuitems[i]).attr('data-level') - $(menuitems[j + 1]).attr('data-level');
                        if (itemleveldiff < 0) {
                            t.mobilemenu.html += '<div class="mobilemenuck-submenu">';
                        } else if (itemleveldiff > 0) {
                            t.mobilemenu.html += '</div>';
                            t.mobilemenu.html += t.strRepeat('</div></div>', itemleveldiff);
                        } else {
                            t.mobilemenu.html += '</div>';
                        }
                    } else {
                        t.mobilemenu.html += t.strRepeat('</div></div>', itemlevel);
                    }

                    if (itemtmp.hasClass('current'))
                        activeitem = itemtmp.clone();
                    if (!opts.showdesc) {
                        if ($('span.descck', $(activeitem)).length)
                            $('span.descck', $(activeitem)).remove();
                    }

                } //else if ($(itemtmp).hasClass('menucklogo')) {
                //logoitem = $(itemtmp).clone();
                //}
            });

            t.mobilemenu.html += opts.aftertext ? '<div class="mobilemenuck-aftertext">' + opts.aftertext + '</div>' : '';
            if (opts.merge) {
                var mergedmobilemenuid = opts.merge + '-mobile';
                var mergedmobilemenu = $('#' + mergedmobilemenuid);
                if (mergedmobilemenu.length) {
                    if (mergedmobilemenu.find('.mobilemenuck-itemwrap').length) {
                        mergedmobilemenu.find('.mobilemenuck-itemwrap').append(t.mobilemenu.html);
                    } else {
                        mergedmobilemenu.append(t.mobilemenu.html);
                    }
                } else {
                    $(document.body).append($('<div style="display:none;" data-mobilemenuck-merged="' + mergedmobilemenuid + '" data-mobilemenuck-mergedorder="' + opts.mergeorder + '">' + t.mobilemenu.html + '</div>'));
                }
                // close the menu when scroll is needed
                $('.scrollTo,[rel*="lightbox"]', mergedmobilemenu).click(function() {
                    t.closeMenu();
                });
            } else {
                t.mobilemenu.append(t.mobilemenu.html);
                if (opts.lock_button == '1') {
                    t.mobilemenu.find('.mobilemenuck-lock-button').click(function() {
                        if (sessionStorage.getItem('mobilemenuck-lock') == '1') {
                            sessionStorage.removeItem('mobilemenuck-lock');
                            sessionStorage.removeItem('mobilemenuck-state');
                            this.innerHTML = t.getSvg('unlock');
                        } else {
                            sessionStorage.setItem('mobilemenuck-lock', '1');
                            t.storeLockedState();
                            this.innerHTML = t.getSvg('lock');
                        }
                    });
                }

                // if another menu has been created to be merged
                if ($('[data-mobilemenuck-merged="' + t.mobilemenuid + '"]').length) {
                    $('[data-mobilemenuck-merged="' + t.mobilemenuid + '"]').each(function() {
                        var mergingmenu = $(this);
                        var mergedorder = $(this).attr('data-mobilemenuck-mergedorder');
                        $(this).find('.mobilemenuck-item').attr('data-mergedorder', mergedorder);
                        var merged = false;
                        t.mobilemenu.find('.mobilemenuck-item').each(function() {
                            if ($(this).attr('data-mergedorder') > mergedorder && merged == false) {
                                $(this).before(mergingmenu.html());
                                merged = true;
                            }
                        });
                        if (merged == false) t.mobilemenu.append(mergingmenu.html());
                        $('[data-mobilemenuck-merged="' + t.mobilemenuid + '"]').remove();
                    });
                }
            }
            // add custom modules in the menu
            if ($('#mobilemenuck-top-module').length) {
                t.mobilemenu.find('.mobilemenuck-topbar').after($('#mobilemenuck-top-module').show());
            }
            if ($('#mobilemenuck-bottom-module').length) {
                t.mobilemenu.append($('#mobilemenuck-bottom-module').show());
            }

            t.initCss();
            var activeitemtext;
            if (activeitem && opts.showmobilemenutext != 'none' && opts.showmobilemenutext != 'custom') {
                if (opts.showdesc == '0') {
                    activeitem.find('.descck').remove();
                }
                if (opts.useimages == '1') {
                    activeitemtext = activeitem.find('a.maximenuck').html();
                } else {
                    activeitemtext = activeitem.find('span.titreck').html();
                }
                if (!activeitemtext || activeitemtext == 'undefined')
                    activeitemtext = opts.mobilemenutext;
            } else {
                activeitemtext = opts.mobilemenutext;
            }

            if (!opts.merge) {
                var position = (opts.container == 'body') ? 'absolute' : ((opts.container == 'topfixed') ? 'fixed' : 'relative');
                if (opts.container == 'topfixed') opts.container = 'body';
                var mobilemenubar = '<div id="' + t.mobilemenuid + '-bar" class="mobilemenuck-bar ' + opts.langdirection + '" style="position:' + position + '"><div class="mobilemenuck-bar-title">' + activeitemtext + '</div>' +
                    '<div class="mobilemenuck-bar-button">' + opts.menubarbuttoncontent + '</div>' +
                    '</div>';
                t.mobilemenubar = $(mobilemenubar);
                // load custom module if loaded
                //				if ($('#' + t.mobilemenuid + '-bar-module').length) {
                if ($('#mobilemenuck-bar-module').length) {
                    t.mobilemenubar.find('.mobilemenuck-bar-title').text('');
                    t.mobilemenubar.find('.mobilemenuck-bar-title').append($('#mobilemenuck-bar-module').show());
                }
                t.mobilemenubar.attr('data-id', opts.menuid);

                if (opts.container == 'body') {
                    $(document.body).append(t.mobilemenubar);
                } else {
                    el.after(t.mobilemenubar);
                    if (opts.displayeffect == 'normal' || opts.displayeffect == 'open')
                        t.mobilemenu.css('position', 'relative');
                }

                t.menu.parents('.nav-collapse').css('height', 'auto').css('overflow', 'visible');
                t.menu.parents('.navigation').find('.navbar').css('display', 'none');
                t.mobilemenubar.parents('.nav-collapse').css('height', 'auto');
                t.mobilemenubar.parents('.navigation').find('.navbar').css('display', 'none');

                if (opts.showlogo == '0') {

                } else if (($('.maximenucklogo', t.menu).length && opts.showlogo) ||
                    opts.logo_source === 'custom') {
                    if (opts.logo_source === 'custom' && opts.logo_image !== '') {
                        var logo_style = (opts.logo_margintop ? ' margin-top:' + opts.logo_margintop + ';' : '') +
                            (opts.logo_marginright ? ' margin-right:' + opts.logo_marginright + ';' : '') +
                            (opts.logo_marginbottom ? ' margin-bottom:' + opts.logo_marginbottom + ';' : '') +
                            (opts.logo_marginleft ? ' margin-left:' + opts.logo_marginleft + ';' : '')
                        logo_style = logo_style ? ' style="' + logo_style + '"' : '';
                        var logo_html = '<img src="' + opts.uriroot + '/' + opts.logo_image + '"' +
                            (opts.logo_width ? ' width="' + opts.logo_width + '"' : '') +
                            (opts.logo_height ? ' height="' + opts.logo_height + '"' : '') +
                            (opts.logo_alt ? ' alt="' + opts.logo_alt + '"' : '') +
                            logo_style +
                            ' data-position="' + opts.logo_position + '"' +
                            ' class="' + opts.logo_class + '"' +
                            '/>'
                        logo_html = opts.logo_link ? '<a href="' + opts.logo_link + '">' + logo_html + '</a>' : logo_html;
                        logoitem = '<div class="mobilemenuck-logo mobilemenuck-logo-' + opts.logo_position + '">' + logo_html + '</div>';
                        var floatlogo = '';
                    } else {
                        logoitem = $('.maximenucklogo', t.menu).clone();
                        var floatlogo = 'float:left;';
                    }
                    // convert to array
                    opts.logo_where = opts.logo_where.split(',');

                    if (opts.logo_where.includes('2')) {
                        t.mobilemenubar.prepend('<div style="float:left;" class="' + $(logoitem).attr('class') + '">' + $(logoitem).html() + '</div>');
                    }
                    if (opts.logo_where.includes('3')) {
                        $('.mobilemenuck-topbar', t.mobilemenu).prepend('<div style="' + floatlogo + '" class="' + $(logoitem).attr('class') + '">' + $(logoitem).html() + '</div>');
                    }
                    if (opts.logo_where.includes('1')) {
                        $('.mobilemenuck-topbar', t.mobilemenu).after('<div class="' + $(logoitem).attr('class') + '">' + $(logoitem).html() + '<div style="clear:both;"></div></div>');
                    }
                }
                if (opts.tooglebaron == 'button') {
                    $(t.mobilemenubar).find('.mobilemenuck-bar-button').on(opts.tooglebarevent, function() {
                        t.toggleMenu();
                    });
                } else {
                    $(t.mobilemenubar).on(opts.tooglebarevent, function() {
                        t.toggleMenu();
                    });
                }
                $('.mobilemenuck-button:not(.mobilemenuck-lock-button)', t.mobilemenu).click(function() {
                    t.closeMenu();
                });
                // close the menu when scroll is needed
                $('.scrollTo,[rel="lightbox"]', t.mobilemenu).click(function() {
                    t.closeMenu();
                });
                if (typeof Scrolltock == 'function' && $('.scrollTo', t.mobilemenu).length) {
                    Scrolltock(t.mobilemenu);
                }

                $(window).on("click touchstart", function(event) {
                    if (sessionStorage.getItem('mobilemenuck-lock') !== '1') {
                        var shallclose = true;
                        $('.mobilemenuck').each(function() {
                            var $this = $(this);
                            if (
                                $this.has(event.target).length == 0 //checks if descendants of submenu was clicked
                                &&
                                !$this.is(event.target) //checks if the submenu itself was clicked
                                &&
                                $('#' + t.mobilemenuid + '-bar').has(event.target).length == 0 &&
                                !$('#' + t.mobilemenuid + '-bar').is(event.target)
                                //							&&
                                //							$this.find('.mobilemenuck-lock-button').has(event.target).length == 0
                                //							&&
                                //							!$this.find('.mobilemenuck-lock-button').is(event.target)
                            ) {
                                // is outside
                                // closeMenu(opts.menuid);
                                // shallclose = true;
                            } else {
                                // is inside one of the mobile menus, do nothing
                                shallclose = false;
                            }
                        });
                        if (shallclose) t.closeMenu();
                    }
                });
            } // end merge condition

            // add compatibility with Mediabox CK
            if (typeof(Mediabox) != "undefined") {
                Mediabox.scanPage();
            }
        }

        t.storeLockedState = function() {
            if (opts.lock_button !== '1') return;
            let opened = $.map(t.mobilemenu.find('.mobilemenuck-submenu'), function(n, i) {
                return $(n).hasClass('ckopen') || $(n).prev().hasClass('open');
            });
            sessionStorage.setItem('mobilemenuck-state', opened);
        }

        t.setDataLevelRecursive = function(menu, level) {
            $('> ' + opts.childselector, menu).each(function() {
                var $li = $(this);
                if (!$li.attr('data-level')) $li.attr('data-level', level).addClass('level' + level);
                if ($li.find(opts.menuselector).length) t.setDataLevelRecursive($li.find(opts.menuselector), level + 1);
            });
        }

        t.setAccordion = function() {
            if (opts.merge) {
                t.mobilemenu = $('#' + opts.merge + '-mobile');
            }
            // mobilemenu = $('#' + opts.menuid + '-mobile');
            $('.mobilemenuck-submenu', t.mobilemenu).hide();
            $('.mobilemenuck-submenu', t.mobilemenu).each(function(i, submenu) {
                submenu = $(submenu);
                var itemparent = submenu.prev('.menuck');
                if ($('+ .mobilemenuck-submenu > div.mobilemenuck-item', itemparent).length)
                    $(itemparent).append('<div class="mobilemenuck-togglericon" />');
            });
            $('.mobilemenuck-togglericon', t.mobilemenu).click(function() {
                var itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
                if (itemparentsubmenu.css('display') == 'none') {
                    itemparentsubmenu.css('display', 'block');
                    $(this).parent().addClass('open');
                } else {
                    itemparentsubmenu.css('display', 'none');
                    $(this).parent().removeClass('open');
                }
                t.storeLockedState();
            });
            // open the submenu on the active item
            if (opts.openedonactiveitem == '1') {
                $('.maximenuck.active:not(.current) > .mobilemenuck-togglericon', t.mobilemenu).trigger('click');
            }
        }

        t.setFlyout = function() {
            if (opts.merge) {
                t.mobilemenu = $('#' + opts.merge + '-mobile');
            }
            // mobilemenu = $('#' + opts.menuid + '-mobile');
            $('.mobilemenuck-submenu', t.mobilemenu).hide();
            $('.level1 + .mobilemenuck-submenu', t.mobilemenu)
                .css('width', opts.menuwidth);
            //				.css('left', opts.menuwidth + 'px')
            $('.level2 + .mobilemenuck-submenu', t.mobilemenu)
                .css('width', opts.menuwidth);
            $('.mobilemenuck-submenu', t.mobilemenu).each(function(i, submenu) {
                submenu = $(submenu);
                var itemparent = submenu.prev('.menuck');
                if ($('+ .mobilemenuck-submenu > div.mobilemenuck-item', itemparent).length)
                    $(itemparent).append('<div class="mobilemenuck-togglericon" />');
            });
            $('.level1 > .mobilemenuck-togglericon', t.mobilemenu).click(function() {
                console.log('test');
                $('.level1 + .mobilemenuck-submenu', t.mobilemenu).prev().removeClass('open');
                var itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
                $('.mobilemenuck-submenu', t.mobilemenu).not(itemparentsubmenu).hide();
                if (itemparentsubmenu.css('display') == 'none') {
                    itemparentsubmenu.css('display', 'block');
                    $(this).parent().addClass('open');
                } else {
                    itemparentsubmenu.css('display', 'none');
                    $(this).parent().removeClass('open');
                }
                t.storeLockedState();
            });
            $('.level2 > .mobilemenuck-togglericon', t.mobilemenu).click(function() {
                $('.level2 + .mobilemenuck-submenu', t.mobilemenu).prev().removeClass('open');
                var itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
                $('.level2 + .mobilemenuck-submenu', t.mobilemenu).not(itemparentsubmenu).hide();
                if (itemparentsubmenu.css('display') == 'none') {
                    itemparentsubmenu.css('display', 'block');
                    $(this).parent().addClass('open');
                } else {
                    itemparentsubmenu.css('display', 'none');
                    $(this).parent().removeClass('open');
                }
                t.storeLockedState();
            });
            $('.level3 .mobilemenuck-togglericon', t.mobilemenu).click(function() {
                var itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
                // $('.level 2 .mobilemenuck-submenu', t.mobilemenu).not(itemparentsubmenu).hide();
                if (itemparentsubmenu.css('display') == 'none') {
                    itemparentsubmenu.css('display', 'block');
                    $(this).parent().addClass('open');
                } else {
                    itemparentsubmenu.css('display', 'none');
                    $(this).parent().removeClass('open');
                }
                t.storeLockedState();
            });
            // open the submenu on the active item
            if (opts.openedonactiveitem == '1') {
                $('.maximenuck.active:not(.current) > .mobilemenuck-togglericon', t.mobilemenu).trigger('click');
            }
        }

        t.setFade = function() {
            if (opts.merge) {
                t.mobilemenu = $('#' + opts.merge + '-mobile');
            }
            if (!$('.mobilemenuck-backbutton', t.mobilemenu).length)
                $('.mobilemenuck-topbar', t.mobilemenu).prepend('<div class="mobilemenuck-title mobilemenuck-backbutton">' + opts.mobilebackbuttontext + '</div>');
            $('.mobilemenuck-backbutton', t.mobilemenu).hide();
            $('.mobilemenuck-submenu', t.mobilemenu).hide();
            $('.mobilemenuck-submenu', t.mobilemenu).each(function(i, submenu) {
                submenu = $(submenu);
                itemparent = submenu.prev('.menuck');
                if ($('+ .mobilemenuck-submenu > div.mobilemenuck-item', itemparent).length)
                    $(itemparent).append('<div class="mobilemenuck-togglericon" />');
            });
            $('.mobilemenuck-togglericon', t.mobilemenu).click(function() {
                itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
                parentitem = $(this).parents('.mobilemenuck-item')[0];
                $('.ckopen', t.mobilemenu).removeClass('ckopen');
                $(itemparentsubmenu).addClass('ckopen');
                $('.mobilemenuck-backbutton', t.mobilemenu).fadeIn();
                $('.mobilemenuck-title:not(.mobilemenuck-backbutton)', t.mobilemenu).hide();
                // hides the current level items and displays the submenus
                $(parentitem).parent().find('> .mobilemenuck-item > div.menuck').fadeOut(function() {
                    $('.ckopen', t.mobilemenu).fadeIn();
                });
                t.storeLockedState();
            });
            if (!opts.merge) {
                $('.mobilemenuck-topbar .mobilemenuck-backbutton', t.mobilemenu).click(function() {
                    backbutton = this;
                    $('.ckopen', t.mobilemenu).fadeOut(500, function() {
                        $('.ckopen', t.mobilemenu).parent().parent().find('> .mobilemenuck-item > div.menuck').fadeIn();
                        oldopensubmenu = $('.ckopen', t.mobilemenu);
                        if (!$('.ckopen', t.mobilemenu).parents('.mobilemenuck-submenu').length) {
                            $('.ckopen', t.mobilemenu).removeClass('ckopen');
                            $('.mobilemenuck-title', t.mobilemenu).fadeIn();
                            $(backbutton).hide();
                        } else {
                            $('.ckopen', t.mobilemenu).removeClass('ckopen');
                            $(oldopensubmenu.parents('.mobilemenuck-submenu')[0]).addClass('ckopen');
                        }
                        t.storeLockedState();
                    });
                });
            }
        }

        t.setPush = function() {
            if (opts.merge) {
                mobilemenu = $('#' + opts.merge + '-mobile');
            } else {
                mobilemenu = $('#' + opts.menuid + '-mobile');
            }
            mobilemenu.css('height', '100%');
            if (!$('.mobilemenuck-backbutton', mobilemenu).length)
                $('.mobilemenuck-topbar', mobilemenu).prepend('<div class="mobilemenuck-title mobilemenuck-backbutton">' + opts.mobilebackbuttontext + '</div>');
            $('.mobilemenuck-backbutton', mobilemenu).hide();
            $('.mobilemenuck-submenu', mobilemenu).hide();
            // $('div.mobilemenuck-item', mobilemenu).css('position', 'relative');
            mobilemenu.append('<div class="mobilemenuck-itemwrap" />');
            $('.mobilemenuck-itemwrap', mobilemenu).css('position', 'absolute').width('100%');
            $('> div.mobilemenuck-item', mobilemenu).each(function(i, item) {
                $('.mobilemenuck-itemwrap', mobilemenu).append(item);
            });
            zindex = 10;
            $('.mobilemenuck-submenu', mobilemenu).each(function(i, submenu) {
                submenu = $(submenu);
                itemparent = submenu.prev('.menuck');
                submenu.css('left', '100%').css('width', '100%').css('top', '0').css('position', 'absolute').css('z-index', zindex);
                if ($('+ .mobilemenuck-submenu > div.mobilemenuck-item', itemparent).length)
                    $(itemparent).append('<div class="mobilemenuck-togglericon" />');
                zindex++;
            });
            $('.mobilemenuck-togglericon', mobilemenu).click(function() {
                itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
                parentitem = $(this).parents('.mobilemenuck-item')[0];
                $(parentitem).parent().find('.mobilemenuck-submenu').hide();
                $('.ckopen', mobilemenu).removeClass('ckopen');
                $(itemparentsubmenu).addClass('ckopen');
                $('.mobilemenuck-backbutton', mobilemenu).fadeIn();
                $('.mobilemenuck-title:not(.mobilemenuck-backbutton)', mobilemenu).hide();
                $('.ckopen', mobilemenu).fadeIn();
                $('.mobilemenuck-itemwrap', mobilemenu).animate({
                    'left': '-=100%'
                });
                t.storeLockedState();
            });
            if (!opts.merge) {
                $('.mobilemenuck-topbar .mobilemenuck-backbutton', mobilemenu).click(function() {
                    backbutton = this;
                    $('.mobilemenuck-itemwrap', mobilemenu).animate({
                        'left': '+=100%'
                    });
                    // $('.ckopen', mobilemenu).fadeOut(500, function() {
                    // $('.ckopen', mobilemenu).parent().parent().find('> .mobilemenuck-item > div.menuck').fadeIn();
                    oldopensubmenu = $('.ckopen', mobilemenu);
                    if (!$('.ckopen', mobilemenu).parents('.mobilemenuck-submenu').length) {
                        $('.ckopen', mobilemenu).removeClass('ckopen').hide();
                        $('.mobilemenuck-title', mobilemenu).fadeIn();
                        $(backbutton).hide();
                    } else {
                        $('.ckopen', mobilemenu).removeClass('ckopen').hide();
                        $(oldopensubmenu.parents('.mobilemenuck-submenu')[0]).addClass('ckopen');
                    }
                    t.storeLockedState();
                    // });

                });
            }
        }

        t.resetFademenu = function() {
            $('.mobilemenuck-submenu', t.mobilemenu).hide();
            $('.mobilemenuck-item > div.menuck').show().removeClass('open');
            $('.mobilemenuck-topbar .mobilemenuck-title').show();
            $('.mobilemenuck-topbar .mobilemenuck-title.mobilemenuck-backbutton').hide();
        }

        t.resetPushmenu = function() {
            $('.mobilemenuck-submenu', t.mobilemenu).hide();
            $('.mobilemenuck-itemwrap', t.mobilemenu).css('left', '0');
            $('.mobilemenuck-topbar .mobilemenuck-title:not(.mobilemenuck-backbutton)').show();
            $('.mobilemenuck-topbar .mobilemenuck-title.mobilemenuck-backbutton').hide();
        }

        t.resetFlyout = function() {
            $('.mobilemenuck-submenu', t.mobilemenu).hide();
            $('.mobilemenuck-item > div.menuck').show().removeClass('open');
            $('.mobilemenuck-topbar .mobilemenuck-title').show();
            $('.mobilemenuck-topbar .mobilemenuck-title.mobilemenuck-backbutton').hide();
        }

        t.updatelevel = function() {
            $('div.maximenuck_mod', t.menu).each(function(i, module) {
                module = $(module);
                liparentlevel = module.parent('li.maximenuckmodule').attr('data-level');
                $('li.maximenuck', module).each(function(j, li) {
                    li = $(li);
                    lilevel = parseInt(li.attr('data-level')) + parseInt(liparentlevel) - 1;
                    li.attr('data-level', lilevel).addClass('level' + lilevel);
                });
            });
        }

        t.validateitem = function(itemtmp) {
            if (t.menutype == 'maximenuck') {
                return t.validateitemMaximenuck(itemtmp);
            } else if (t.menutype == 'accordeonck') {
                return t.validateitemAccordeonck(itemtmp);
            } else {
                return t.validateitemNormal(itemtmp);
            }
        }

        t.validateitemNormal = function(itemtmp) {
            if (!itemtmp || $(itemtmp).hasClass('nomobileck') || $(itemtmp).hasClass('mobilemenuck-hide'))
                return false;

            if ($('> a', itemtmp).length)
                return $('> a', itemtmp).clone();
            if ($('> span.separator,> span.nav-header', itemtmp).length)
                return $('> span.separator,> span.nav-header', itemtmp).clone();

            return false;
        }

        t.validateitemMaximenuck = function(itemtmp) {
            if (!itemtmp || $(itemtmp).hasClass('nomobileck') || $(itemtmp).hasClass('mobilemenuck-hide'))
                return false;
            if ($('> * > img', itemtmp).length && opts.useimages == '0' && !$('> * > span.titreck', itemtmp).length) {
                return false
            }
            if ($('> a.maximenuck', itemtmp).length)
                return $('> a.maximenuck', itemtmp).clone();
            if ($('> span.separator,> span.nav-header', itemtmp).length)
                return $('> span.separator,> span.nav-header', itemtmp).clone();
            if ($('> * > a.maximenuck', itemtmp).length)
                return $('> * > a.maximenuck', itemtmp).clone();
            if ($('> * > span.separator,> * > span.nav-header', itemtmp).length)
                return $('> * > span.separator,> * >  span.nav-header', itemtmp).clone();
            if ($('> div.maximenuck_mod', itemtmp).length && opts.usemodules == '1')
                return $('> div.maximenuck_mod', itemtmp).clone();

            return false;
        }

        t.validateitemAccordeonck = function(itemtmp) {
            if (!itemtmp || $(itemtmp).hasClass('nomobileck') || $(itemtmp).hasClass('mobilemenuck-hide'))
                return false;
            var outer = $('> .accordeonck_outer', itemtmp).length ? $('> .accordeonck_outer', itemtmp) : itemtmp;
            if (($('> a', outer).length || $('> span.separator', outer).length) &&
                ($('> a', outer).length || $('> span.separator', outer).length || opts.useimages == '1') ||
                ($('> div.accordeonckmod', outer).length && opts.usemodules == '1') ||
                ($('> .accordeonck_outer', outer).length)
            )
                return $('> a', outer).length ? $('> a', outer).clone() : $('> span.separator', outer).clone();

            return false;
        }

        t.strRepeat = function(string, count) {
            var s = '';
            if (count < 1)
                return '';
            while (count > 0) {
                s += string;
                count--;
            }
            return s;
        }

        t.sortmenu = function(menu) {
            var items = new Array();
            mainitems = $('ul.maximenuck > li.maximenuck.level1', menu);
            j = 0;
            mainitems.each(function(ii, mainitem) {
                items.push(mainitem);
                if ($(mainitem).hasClass('parent')) {
                    subitemcontainer = $('.maxipushdownck > .floatck', menu).eq(j);
                    subitems = $('li.maximenuck', subitemcontainer);
                    subitems.each(function(k, subitem) {
                        items.push(subitem);
                    });
                    j++;
                }
            });
            return items;
        }

        t.initCss = function() {
            switch (opts.displayeffect) {
                case 'normal':
                default:
                    t.mobilemenu.css({
                        'position': 'absolute',
                        'z-index': '100000',
                        'top': '0',
                        'left': '0',
                        'display': 'none'
                    });
                    break;
                case 'slideleft':
                case 'slideleftover':
                    t.mobilemenu.css({
                        'position': 'fixed',
                        'overflow-y': 'auto',
                        'overflow-x': 'hidden',
                        'z-index': '100000',
                        'top': '0',
                        'left': '0',
                        'width': opts.menuwidth,
                        'height': '100%',
                        'display': 'none'
                    });
                    break;
                case 'slideright':
                case 'sliderightover':
                    t.mobilemenu.css({
                        'position': 'fixed',
                        'overflow-y': 'auto',
                        'overflow-x': 'hidden',
                        'z-index': '100000',
                        'top': '0',
                        'right': '0',
                        'left': 'auto',
                        'width': opts.menuwidth,
                        'height': '100%',
                        'display': 'none'
                    });
                    break;
                case 'topfixed':
                    t.mobilemenu.css({
                        'position': 'fixed',
                        'overflow-y': 'scroll',
                        'z-index': '100000',
                        'top': '0',
                        'right': '0',
                        'left': '0',
                        'max-height': '100%',
                        'display': 'none'
                    });
                    break;
            }
        }

        t.toggleMenu = function() {
            if (t.mobilemenu.css('display') == 'block') {
                t.closeMenu();
            } else {
                t.openMenu();
            }
        }

        t.openMenu = function() {
            // mobilemenu = $('#' + menuid + '-mobile');
            //				mobilemenu.show();
            switch (opts.displayeffect) {
                case 'normal':
                default:
                    t.mobilemenu.fadeOut();
                    $('#' + opts.menuid + '-mobile').fadeIn();
                    if (opts.container != 'body')
                        t.mobilemenubar.css('display', 'none');
                    break;
                case 'slideleft':
                case 'slideleftover':
                    t.mobilemenu.css('display', 'block').css('opacity', '0').css('width', '0').animate({
                        'opacity': '1',
                        'width': opts.menuwidth
                    });
                    if (opts.displayeffect == 'slideleft') $('body').css('position', 'relative').animate({
                        'left': opts.menuwidth
                    });
                    break;
                case 'slideright':
                case 'sliderightover':
                    t.mobilemenu.css('display', 'block').css('opacity', '0').css('width', '0').animate({
                        'opacity': '1',
                        'width': opts.menuwidth
                    });
                    if (opts.displayeffect == 'slideright') $('body').css('position', 'relative').animate({
                        'right': opts.menuwidth
                    });
                    break;
                case 'open':
                    // mobilemenu..slideDown();
                    $('#' + opts.menuid + '-mobile').slideDown('slow');
                    if (opts.container != 'body')
                        t.mobilemenubar.css('display', 'none');
                    break;
            }
            $(document).trigger('mobilemenuck_open');
        }

        t.closeMenu = function(menuid) {
            if (opts.displaytype == 'fade') {
                t.resetFademenu();
            }
            if (opts.displaytype == 'push') {
                t.resetPushmenu();
            }
            if (opts.displaytype == 'flyout') {
                t.resetFlyout();
            }
            // mobilemenu = $('#' + menuid + '-mobile');
            switch (opts.displayeffect) {
                case 'normal':
                default:
                    t.mobilemenu.fadeOut();
                    if (opts.container != 'body')
                        t.mobilemenubar.css('display', '');
                    break;
                case 'slideleft':
                    t.mobilemenu.animate({
                        'opacity': '0',
                        'width': '0'
                    }, function() {
                        t.mobilemenu.css('display', 'none');
                    });
                    $('body').animate({
                        'left': '0'
                    }, function() {
                        $('body').css('position', '')
                    });
                    break;
                case 'slideright':
                    t.mobilemenu.animate({
                        'opacity': '0',
                        'width': '0'
                    }, function() {
                        t.mobilemenu.css('display', 'none');
                    });
                    $('body').animate({
                        'right': '0'
                    }, function() {
                        $('body').css('position', '')
                    });
                    break;
                case 'slideleftover':
                    t.mobilemenu.animate({
                        'opacity': '0',
                        'width': '0'
                    }, function() {
                        t.mobilemenu.css('display', 'none');
                    });
                    break;
                case 'sliderightover':
                    t.mobilemenu.animate({
                        'opacity': '0',
                        'width': '0'
                    }, function() {
                        t.mobilemenu.css('display', 'none');
                    });
                    break;
                case 'open':
                    t.mobilemenu.slideUp('slow', function() {
                        if (opts.container != 'body')
                            t.mobilemenubar.css('display', '');
                    });

                    break;
            }
            $(document).trigger('mobilemenuck_close');
        }

        t.getSvg = function(icon) {
            switch (icon) {
                case 'lock':
                    return '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"></path></svg>';
                    break;
                case 'unlock':
                    return '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M400 256H152V152.9c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v16c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-16C376 68 307.5-.3 223.5 0 139.5.3 72 69.5 72 153.5V256H48c-26.5 0-48 21.5-48 48v160c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z"></path></svg>';
                    break;
            }
            return '';
        }

        t.init();
        t.mobilemenu.attr('data-display', opts.displaytype);
        t.mobilemenu.attr('data-effect', opts.displayeffect);

        if (opts.displaytype == 'accordion')
            t.setAccordion();
        if (opts.displaytype == 'fade')
            t.setFade();
        if (opts.displaytype == 'push')
            t.setPush();
        if (opts.displaytype == 'flyout')
            t.setFlyout();

        // set locked state
        if (sessionStorage.getItem('mobilemenuck-lock') == '1') {
            t.openMenu();
            let opened = sessionStorage.getItem('mobilemenuck-state').split(',');
            for (var i = 0; i < opened.length; i++) {
                if (opened[i] == "true") {
                    console.log(t.mobilemenu.find('.mobilemenuck-submenu').eq(i));
                    t.mobilemenu.find('.mobilemenuck-submenu').eq(i).parent('.mobilemenuck-item').find('> div > .mobilemenuck-togglericon').trigger('click');
                }
            }
        }
    }
    window.MobileMenuCK = MobileMenuCK;
})(jQuery);
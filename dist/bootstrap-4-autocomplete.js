(function ($) {
    var defaults = {
        treshold: 4,
        maximumItems: 5,
        highlightTyped: true,
        highlightClass: 'text-primary',
        startsWith: false,
        "class": ''
    };
    function createItem(lookup, item, opts) {
        var label;
        if (opts.highlightTyped) {
            if (opts.startsWith) {
                label = '<span class="' + opts.highlightClass + '">' + item.label.substring(0, lookup.length) + '</span>'
                    + item.label.substring(lookup.length, item.label.length);
            }
            else {
                var idx = item.label.toLowerCase().indexOf(lookup.toLowerCase());
                label = item.label.substring(0, idx)
                    + '<span class="' + opts.highlightClass + '">' + item.label.substring(idx, idx + lookup.length) + '</span>'
                    + item.label.substring(idx + lookup.length, item.label.length);
            }
        }
        else {
            label = item.label;
        }
        return '<button type="button" class="dropdown-item" data-value="' + item.value + '">' + label + '</button>';
    }
    function createItems(field, opts) {
        if (!opts.source)
            return 0;
        var lookup = field.val();
        if (lookup.length < opts.treshold) {
            field.dropdown('hide');
            return 0;
        }
        var items = field.next();
        items.html('');
        var count = 0;
        var keys = Object.keys(opts.source);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var object = opts.source[key];
            var item = {
                label: opts.label ? object[opts.label] : key,
                value: opts.value ? object[opts.value] : object
            };
            var compare;
            if (opts.startsWith) {
                compare = item.label.toLowerCase().startsWith(lookup.toLowerCase());
            }
            else {
                compare = item.label.toLowerCase().indexOf(lookup.toLowerCase()) >= 0;
            }
            if (compare) {
                items.append(createItem(lookup, item, opts));
                if (opts.maximumItems && ++count >= opts.maximumItems) {
                    break;
                }
            }
        }
        // option action
        field.next().find('.dropdown-item').click(function () {
            field.val($(this).text());
            if (opts.onSelectItem) {
                opts.onSelectItem({
                    value: $(this).data('value'),
                    label: $(this).text()
                }, field[0]);
            }
        });
        return items.children().length;
    }
    $.fn.autocomplete = function (options) {
        // merge options with default
        var opts = {};
        $.extend(opts, defaults, options);
        var _field = $(this);
        // clear previously set autocomplete
        _field.parent().removeClass('dropdown');
        _field.removeAttr('data-toggle');
        _field.removeClass('dropdown-toggle');
        _field.parent().find('.dropdown-menu').remove();
        _field.dropdown('dispose');
        // attach dropdown
        _field.parent().addClass('dropdown');
        _field.attr('data-toggle', 'dropdown');
        _field.addClass('dropdown-toggle');
        var dropdown = $('<div class= "dropdown-menu" ></div>');
        dropdown.addClass(opts["class"]);
        _field.after(dropdown);
        _field.dropdown(opts.dropdownOptions);
        this.off('click.autocomplete').click('click.autocomplete', function (e) {
            if (createItems(_field, opts) == 0) {
                // prevent show empty
                e.stopPropagation();
                _field.dropdown('hide');
            }
            ;
        });
        // show options
        this.off('keyup.autocomplete').keyup('keyup.autocomplete', function () {
            if (opts.fetchSource) {
                // feching data...
                var lookup = _field.val().toString();
                opts.fetchSource(lookup).then(function (res) {
                    opts.source = res;
                    if (createItems(_field, opts) > 0) {
                        _field.dropdown('show');
                    }
                    else {
                        // sets up positioning
                        _field.click();
                    }
                });
            }
            else {
                if (createItems(_field, opts) > 0) {
                    _field.dropdown('show');
                }
                else {
                    // sets up positioning
                    _field.click();
                }
            }
        });
        return this;
    };
}(jQuery));

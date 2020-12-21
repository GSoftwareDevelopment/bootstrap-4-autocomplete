interface AutocompleteItem {
    value: string,
    label: string,
}

interface AutocompleteOptions {
    dropdownOptions?: Bootstrap.DropdownOption,
    highlightClass?: string,
    highlightTyped?: boolean,
    labelClass?: string,
    dropdownClass?: string,
    maximumItems?: number,
    onRenderItem?: (item: AutocompleteItem, element: JQuery<HTMLElement>) => void,
    onSelectItem?: (item: AutocompleteItem, element: JQuery<HTMLElement>) => void,
    source?: Array<AutocompleteItem>,
    treshold?: number,
    compareFn?: (lookup: string, item: AutocompleteItem) => boolean,
    fetchTime?: number,
    fetchSource?: (lookup: string) => Promise<any>
}

interface JQuery {
    autocomplete(options: AutocompleteOptions): JQuery<HTMLElement>;
}

(function ($) {

    let defaults: AutocompleteOptions = {
        treshold: 4,
        maximumItems: 5,
        highlightTyped: true,
        highlightClass: 'text-primary',
        // descriptionClass: 'text-muted',
        fetchTime: 500
    };

    let _fetchTimer: NodeJS.Timeout;

    function createItem(lookup: string, item: AutocompleteItem, opts: AutocompleteOptions): string {
        let label: string;

        if (!opts.compareFn && opts.highlightTyped) {
            let idx: number = item.label.toLowerCase().indexOf(lookup.toLowerCase());
            label = item.label.substring(0, idx)
                + '<span class="' + opts.highlightClass + '">' + item.label.substring(idx, idx + lookup.length) + '</span>'
                + item.label.substring(idx + lookup.length, item.label.length);
        } else {
            label = item.label;
        }
        label = `<span class="autocomplete-item">${label}</span>`;

        return label;
    }

    function createItems(field: JQuery<HTMLElement>, opts: AutocompleteOptions) {
        const lookup = field.val() as string;
        if (!opts.source || lookup.length < opts.treshold) {
            field.dropdown('hide');
            return 0;
        }

        const items = field.next();
        items.html('');

        let count = 0;
        for (let entry of opts.source) {
            let compare: boolean;

            if (opts.compareFn) {
                compare = opts.compareFn(lookup, entry);
            } else {
                compare = entry.label.toLowerCase().indexOf(lookup.toLowerCase()) >= 0;
            }
            if (compare) {
                let itemHTML = $(`<button type="button" class="dropdown-item ${opts.labelClass ? ${opts.labelClass}` : ``}" data-value="${entry.value}" />`);

                let valueHTML = createItem(lookup, entry, opts);
                itemHTML.append(valueHTML);

                if (opts.onRenderItem)
                    opts.onRenderItem(entry, itemHTML);

                items.append(itemHTML);

                if (opts.maximumItems && ++count >= opts.maximumItems) {
                    break;
                }
            }
        }

        // option action
        field.next().find('.dropdown-item').click(function () {
            let label = $(this).find('span.autocomplete-item').first().text();
            field.val(label);
            if (opts.onSelectItem) {
                opts.onSelectItem({
                    value: $(this).data('value'),
                    label: label,
                }, field);
            }
        });

        return items.children().length;
    }

    $.fn.autocomplete = function (options) {
        // merge options with default
        let opts: AutocompleteOptions = {};
        $.extend(opts, defaults, options);

        let _field = $(this);

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

        const dropdown = $('<div class="dropdown-menu" ></div>');
        if (opts.dropdownClass) dropdown.addClass(opts.dropdownClass);
        _field.after(dropdown);

        _field.dropdown(opts.dropdownOptions);

        this.off('click.autocomplete').click('click.autocomplete', function (e) {
            if (createItems(_field, opts) == 0) {
                // prevent show empty
                e.stopPropagation();
                _field.dropdown('hide');
            };
        });

        // show options
        this.off('keyup.autocomplete').keyup('keyup.autocomplete', function () {
            if (opts.fetchSource) {
                if (_fetchTimer)
                    clearTimeout(_fetchTimer);

                _fetchTimer = setTimeout(() => {
                    // feching data...
                    const lookup = _field.val() as string;
                    if (lookup.length < opts.treshold) {
                        _field.dropdown('hide');
                        return;
                    }

                    opts.fetchSource(lookup).then((res) => {
                        opts.source = res;
                        if (createItems(_field, opts) > 0) {
                            _field.dropdown('show');
                        }
                        else {
                            // sets up positioning
                            _field.click();
                        }
                    });
                }, opts.fetchTime);
            } else {
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

interface AutocompleteItem {
    value: string;
    label: string;
}
interface AutocompleteOptions {
    dropdownOptions?: Bootstrap.DropdownOption;
    highlightClass?: string;
    highlightTyped?: boolean;
    labelClass?: string;
    dropdownClass?: string;
    maximumItems?: number;
    onRenderItem?: (item: AutocompleteItem, element: JQuery<HTMLElement>) => void;
    onSelectItem?: (item: AutocompleteItem, element: JQuery<HTMLElement>) => void;
    source?: Array<AutocompleteItem>;
    treshold?: number;
    compareFn?: (lookup: string, item: AutocompleteItem) => boolean;
    fetchTime?: number;
    fetchSource?: (lookup: string) => Promise<any>;
}
interface JQuery {
    autocomplete(options: AutocompleteOptions): JQuery<HTMLElement>;
}

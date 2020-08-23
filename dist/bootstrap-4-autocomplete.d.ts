interface AutocompleteItem {
    value: string;
    label: string;
}
interface AutocompleteOptions {
    dropdownOptions?: Bootstrap.DropdownOption;
    highlightClass?: string;
    highlightTyped?: boolean;
    label?: string;
    maximumItems?: number;
    onSelectItem?: (item: AutocompleteItem, element: HTMLElement) => void;
    source?: object;
    treshold?: number;
    value?: string;
    startsWith?: boolean;
    class?: string;
    fetchSource?: (lookup: string) => Promise<any>;
}
interface JQuery {
    autocomplete(options: AutocompleteOptions): JQuery<HTMLElement>;
}

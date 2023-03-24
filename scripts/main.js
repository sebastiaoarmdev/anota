'use strict';

const DEBUGGING = true;
const ITENS = 'anota/itens';
const OPTIONS = 'anota/options';
const COLORS = new Map([
    ['default', {class: 'default', next: 'red'}],
    ['red', {class: 'text-bg-danger', next: 'green'}],
    ['green', {class: 'text-bg-success', next: 'blue'}],
    ['blue', {class: 'text-bg-primary', next: 'default'}],
    ['gray', {class: 'text-bg-secondary', next: 'default'}],
    ['yellow', {class: 'text-bg-warning', next: 'default'}],
    ['white', {class: 'text-bg-light', next: 'default'}],
    ['black', {class: 'text-bg-dark', next: 'default'}]
]);

let tagLabel = document.getElementById('tag-label');
let tagLabelText = '<i class="bx bx-purchase-tag-alt bx-sm"></i>';
let tagInput = document.getElementById('tag-input');
let valueLabel = document.getElementById('value-label');
let valueLabelText = '<i class="bx bx-money-withdraw bx-sm"></i>';
let valueInput = document.getElementById('value-input');
let addButton = document.getElementById('add-button');
let copyButtonLabel = '<i class="bx bx-copy-alt bx-sm"></i>';
let removeButtonLabel = '<i class="bx bx-trash"></i>';
let list = document.getElementById('list');
let datalistTags = document.getElementById('datalist-tags');
let total = document.getElementById('total');
let lastId = 0;

class Item {
    #tag;
    #value;
    #color;
    #countable;

    set tag(newValue) {
        this.#tag = String(newValue);
    }

    get tag() {
        return this.#tag;
    }

    set value(newValue) {
        this.#value = Number(newValue);
    }

    get value() {
        return this.#value;
    }

    set color(newValue) {
        this.#color = COLORS.has(newValue) ? String(newValue) : 'default';
    }

    get color() {
        return this.#color;
    }

    set countable(newValue) {
        this.#countable = Boolean(newValue);
    }

    get countable() {
        return this.#countable;
    }

    get formattedValue() {
        return this.value.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'});;
    }

    get JSON() {
        let json = {
            ['tag']: this.tag, 
            ['value']: this.value, 
            ['color']: this.color, 
            ['countable']: this.countable
        };
        return json;
    }

    constructor(tag, value, color, countable) {
        this.tag = tag;
        this.value = value;
        this.color = color;
        this.countable = countable;
    }
}

function getItens() {    
    let listItens = document.getElementsByClassName('list-item');
    let itens = [];
    for (const listItem of listItens) {
        let id = listItem.id;
        let tag = document.getElementById(`tag-input-${id}`).value;
        let value = document.getElementById(`value-input-${id}`).value;
        let color = document.getElementById(`tag-label-${id}`).dataset.color;
        let countable = document.getElementById(`value-label-${id}`).dataset.countable == 'true';
        let newItem = new Item(tag, value, color, countable);
        itens.push(newItem.JSON);
    }
    return itens;
}

function getOptions() {    
    let optionItens = document.getElementsByTagName('option');
    let options = [];
    for (const optionIten of optionItens) {
        options.push(optionIten.value);
    }
    return options;
}

function getNewId() {
    return lastId++;
}

function toBRL(value = .0) {
    return Number(value).toLocaleString('pt-br', {style: 'currency', currency: 'BRL'});
}

function saveOptions(options) {
    localStorage.setItem(OPTIONS, JSON.stringify(options));
}

function saveItens(itens) {
    localStorage.setItem(ITENS, JSON.stringify(itens));
}

function saveData() {
    let itens = getItens();
    saveItens(itens);
    let options = getOptions();
    saveOptions(options);
}

function loadItens() {
    let itens =  JSON.parse(localStorage.getItem(ITENS));
    if (!itens) return;
    for (const item of itens) {
        let tag = item.tag;
        let value = item.value;
        let color = item.color ? 'default' : item.color;
        let countable = item.countable ? true : item.countable;
        let newItem = new Item(tag, value, color, countable);
        addItem(newItem);
    }
}

function loadOptions() {
    let options =  JSON.parse(localStorage.getItem(OPTIONS));
    if (!options) return;
    for (const option of options) {
        addOption(option);
    }
}

function loadData() {
    loadItens();
    loadOptions();
}

function updateTotalValue() {
    let itens = getItens();
    total.hidden = (itens.length < 1);
    let totalValue = 0;
    for (const item of itens) {
        if (!item.countable) continue;
        totalValue = totalValue + item.value;      
    }
    total.innerHTML = `<p>Total: ${toBRL(totalValue)}</p>`;
}

function toggleLabelColor(label) {   
    let oldColor = label.dataset.color;
    let oldColorClass = COLORS.get(oldColor).class;
    label.classList.remove(oldColorClass);

    let newColor = COLORS.get(oldColor).next;
    label.dataset.color = newColor;
    let newColorClass = COLORS.get(newColor).class;
    label.classList.add(newColorClass);
    saveData();
}

function toggleAccounting(label) {
    label.classList.toggle(COLORS.get('gray').class);
    label.dataset.countable = !(label.dataset.countable == 'true');
    updateTotalValue();
    saveData();
}

function getNewLabel(id, text) {
    let label = document.createElement('span');
    if (id) label.id = id;
    label.classList.add('input-group-text');
    label.innerHTML = String(text);
    return label;
}

function getNewTagLabel(id, color = 'default') {
    let newId = `tag-label-${id}`;
    let tagLabel = getNewLabel(newId, tagLabelText);
    tagLabel.dataset.color = color;
    let colorClass = COLORS.get(color).class;
    tagLabel.classList.add(colorClass);
    tagLabel.addEventListener('click', () => toggleLabelColor(tagLabel));
    return tagLabel;
}

function getNewValueLabel(id, countable = true) {
    let newId = `value-label-${id}`;
    let valueLabel = getNewLabel(newId, valueLabelText);
    valueLabel.dataset.countable = countable;
    if (!countable) valueLabel.classList.add('text-bg-dark');
    valueLabel.addEventListener('click', () => toggleAccounting(valueLabel));
    return valueLabel;
}

function getNewInput(attributes = {}) {
    let input = document.createElement('input');
    for (const attribute in attributes) {
        if (Object.hasOwnProperty.call(attributes, attribute)) {
            const value = attributes[attribute];
            input.setAttribute(attribute, value);
        }
    }
    input.classList.add('form-control');
    input.addEventListener('input', updateTotalValue);
    input.addEventListener('input', saveData);
    input.addEventListener('click', () => input.select());
    return input;
}

function getNewTagInput(id, value = '') {
    let newId = `tag-input-${id}`;
    let attributes = {
        ['id']: newId,
        ['type']: 'text',
        ['list']: 'tags',
        ['value']: value
    };
    let tagInput = getNewInput(attributes);
    return tagInput;
}

function getNewValueInput(id, value = .0) {
    let newId = `value-input-${id}`;
    let attributes = {
        ['id']: newId,
        ['type']: 'number', 
        ['step']: 0.01, 
        ['min']: 0, 
        ['value']: value
    };
    let valueInput = getNewInput(attributes);
    return valueInput;
}

function getNewButton(styleClass, label, actionOnClick) {    
    let button = document.createElement('button');
    button.classList.add(String(styleClass));
    button.classList.add('btn');
    button.classList.add('btn-outline-dark');
    button.classList.add('btn-lg');
    button.innerHTML = String(label);
    button.addEventListener('click', actionOnClick);
    return button;
}

function getNewRemoveButton(id) {
    let removeButton = getNewButton(
        'remove-button',
        removeButtonLabel, 
        () => removeItemById(id)
    );
    return removeButton;
}

function getNewCopyButton(id) {
    let copyButton = getNewButton(
        'copy-button', 
        copyButtonLabel, 
        () => copyItemById(id)
    );
    return copyButton;
}

function getNewListItem(item) {
    let listItem = document.createElement('div');
    listItem.id = getNewId();
    listItem.classList.add('list-item');
    listItem.classList.add('input-group');
    listItem.classList.add('mb-3');
    
    let tagLabel = getNewTagLabel(listItem.id, item.color);
    listItem.appendChild(tagLabel);
    
    let tagInput = getNewTagInput(listItem.id, item.tag);
    listItem.appendChild(tagInput);
    
    let valueLabel = getNewValueLabel(listItem.id, item.countable);
    listItem.appendChild(valueLabel);
    
    let valueInput = getNewValueInput(listItem.id, item.value);
    listItem.appendChild(valueInput);
    
    let removeButton = getNewRemoveButton(listItem.id);
    listItem.appendChild(removeButton);
    
    let copyButton = getNewCopyButton(listItem.id);
    listItem.appendChild(copyButton);

    return listItem;
}

function getNewOption(tag) {
    let option = document.createElement('option');
    option.value = tag;
    return option;
}

function addItem(item) {
    let listItem = getNewListItem(item);    
    list.appendChild(listItem);
    addOption(item.tag);
    updateTotalValue();
    saveData();
}

function addOption(tag) {
    let options = getOptions();
    options.push(tag);
    options = new Set(options);
    options = Array.from(options).sort();
    datalistTags.replaceChildren();
    for (const option of options) {
        let newOption = getNewOption(option);    
        datalistTags.appendChild(newOption);        
    }
}

function copyItemById(id) {
    let listItem = document.getElementById(id);
    let clone = listItem.cloneNode(true);
    clone.id = getNewId();

    let tagLabel = clone.querySelector(`#tag-label-${id}`);
    tagLabel.id = `tag-label-${clone.id}`;
    tagLabel.addEventListener('click', () => toggleLabelColor(tagLabel));
    
    let tagInput = clone.querySelector(`#tag-input-${id}`);
    tagInput.id = `tag-input-${clone.id}`;
    tagInput.addEventListener('input', updateTotalValue);
    tagInput.addEventListener('input', saveData);
    tagInput.addEventListener('click', () => tagInput.select());

    let valueLabel = clone.querySelector(`#value-label-${id}`);
    valueLabel.id = `value-label-${clone.id}`;
    valueLabel.addEventListener('click', () => toggleAccounting(valueLabel));
    
    let valueInput = clone.querySelector(`#value-input-${id}`);
    valueInput.id = `value-input-${clone.id}`;
    valueInput.addEventListener('input', updateTotalValue);
    valueInput.addEventListener('input', saveData);
    valueInput.addEventListener('click', () => valueInput.select());
    
    let removeButton = clone.querySelector('.remove-button');
    removeButton.addEventListener('click', () => removeItemById(clone.id));
    
    let copyButton = clone.querySelector('.copy-button');
    copyButton.addEventListener('click', () => copyItemById(clone.id));
    
    listItem.after(clone);
    
    updateTotalValue();
    saveData();
}

function removeItemById(id) {
    let listItem = document.getElementById(id);
    list.removeChild(listItem);
    updateTotalValue();
    saveData();
}

tagLabel.addEventListener('click', () => toggleLabelColor(tagLabel));

valueLabel.addEventListener('click', () => toggleAccounting(valueLabel));

addButton.addEventListener('click', () => {
    let tag = tagInput.value.trim();
    tagInput.value = '';    
    let value = valueInput.value;
    valueInput.value = '';
    let color = tagLabel.dataset.color;
    let countable = valueLabel.dataset.countable == 'true';
    tagInput.focus();    
    let newItem = new Item(tag, value, color, countable);    
    addItem(newItem);
});

tagInput.addEventListener('click', () => tagInput.select());

tagInput.addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addButton.click();
    }
});

valueInput.addEventListener('click', () => valueInput.select());

valueInput.addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addButton.click();
    }
});

window.onload = loadData;
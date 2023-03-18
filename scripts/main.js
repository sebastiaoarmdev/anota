'use strict';

const DEBUGGING = true;
const DATA = 'anota/itens'
const FIRST = 0;

let tagLabelText = '<i class="bx bx-purchase-tag-alt bx-sm"></i>';
let valueLabelText = '<i class="bx bx-money-withdraw bx-sm"></i>';
let copyButtonLabel = '<i class="bx bx-copy-alt bx-sm"></i>';
let removeButtonLabel = '<i class="bx bx-trash"></i>';
let addButton = document.getElementById('add-button');
let tagInput = document.getElementById('tag-input');
let valueInput = document.getElementById('value-input');
let list = document.getElementById('list');
let total = document.getElementById('total');
let lastId = 0;

class Item {
    #tag;
    #value;

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

    get formattedValue() {
        return this.value.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'});;
    }

    constructor(tag, value) {
        this.tag = tag;
        this.value = value;
    }
}

function getNewId() {
    return lastId++;
}

function toBRL(value) {
    return Number(value).toLocaleString('pt-br', {style: 'currency', currency: 'BRL'});
}

function saveData() {
    let listItens = document.getElementsByClassName('list-item');
    let itens = [];
    for (const listItem of listItens) {
        let tag = listItem.getElementsByClassName('tag-input')[FIRST].value;
        let value = Number(listItem.getElementsByClassName('value-input')[FIRST].value);
        itens.push({['tag']: tag, ['value']: value});
    }
    localStorage.setItem(DATA, JSON.stringify(itens));
}

function loadData() {
    let itens =  JSON.parse(localStorage.getItem(DATA));
    if (!itens) return;
    for (const item of itens) {
        let tag = item.tag;
        let value = item.value;
        let newItem = new Item(tag, value);
        addItem(newItem);
    }
}

function updateTotalValue() {
    let listItens = document.getElementsByClassName('list-item');
    total.hidden = (listItens.length < 1);
    let totalValue = 0;
    for (const listItem of listItens) {
        let newValue = listItem.getElementsByClassName('value-input')[FIRST].value;
        totalValue = totalValue + Number(newValue);      
    }
    total.innerHTML = `<p>Total: ${toBRL(totalValue)}</p>`;
    saveData();
}

function getNewLabel(styleClass, text) {
    let label = document.createElement('span');
    label.classList.add(String(styleClass));
    label.classList.add('input-group-text');
    label.innerHTML = String(text);
    return label;
}

function toggleLabel(label) {
    label.classList.toggle('text-bg-dark');

    let listItem = label.parentElement;

    let tagInput = listItem.getElementsByClassName('tag-input')[FIRST];
    tagInput.disabled  = !tagInput.disabled;
    
    let valueInput = listItem.getElementsByClassName('value-input')[FIRST];
    valueInput.disabled  = !valueInput.disabled;    
}

function getNewTagLabel() {
    let tagLabel = getNewLabel('tag-label', tagLabelText);
    tagLabel.addEventListener('click', () => toggleLabel(tagLabel));
    return tagLabel;
}

function getNewValueLabel() {
    let valueLabel = getNewLabel('value-label', valueLabelText);
    return valueLabel;
}

function getNewInput(attributes) {
    let input = document.createElement('input');
    for (const attribute in attributes) {
        if (Object.hasOwnProperty.call(attributes, attribute)) {
            const value = attributes[attribute];
            input.setAttribute(attribute, value);
        }
    }
    input.classList.add('form-control');
    input.addEventListener('input', updateTotalValue);
    input.addEventListener('click', () => input.select());
    return input;
}

function getNewTagInput(value) {
    let attributes = {['class']: 'tag-input', ['type']: 'text', ['value']: value};
    let tagInput = getNewInput(attributes);
    return tagInput;
}

function getNewValueInput(value) {
    let attributes = {['class']: 'value-input', ['type']: 'number', ['step']: 0.01, ['min']: 0, ['value']: value};
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
    let removeButton = getNewButton('remove-button', removeButtonLabel, () => removeItemById(id));
    return removeButton;
}

function getNewCopyButton(id) {
    let copyButton = getNewButton('copy-button', copyButtonLabel, () => copyItemById(id));
    return copyButton;
}

function getNewListItem(item) {
    let listItem = document.createElement('div');
    listItem.id = getNewId();
    listItem.classList.add('list-item');
    listItem.classList.add('input-group');
    listItem.classList.add('mb-3');
    
    let tagLabel = getNewTagLabel();
    listItem.appendChild(tagLabel);
    
    let tagInput = getNewTagInput(item.tag);
    listItem.appendChild(tagInput);
    
    let valueLabel = getNewValueLabel();
    listItem.appendChild(valueLabel);
    
    let valueInput = getNewValueInput(item.value);
    listItem.appendChild(valueInput);
    
    let removeButton = getNewRemoveButton(listItem.id);
    listItem.appendChild(removeButton);
    
    let copyButton = getNewCopyButton(listItem.id);
    listItem.appendChild(copyButton);

    return listItem;
}

function addItem(item) {
    let listItem = getNewListItem(item);    
    list.appendChild(listItem);    
    updateTotalValue();
}

function copyItemById(id) {
    let listItem = document.getElementById(id);
    let clone = listItem.cloneNode(true);
    clone.id = getNewId();

    let tagLabel = clone.getElementsByClassName('tag-label')[FIRST];
    tagLabel.addEventListener('click', () => toggleLabel(tagLabel));
    
    let tagInput = clone.getElementsByClassName('tag-input')[FIRST];
    tagInput.addEventListener('input', updateTotalValue);
    tagInput.addEventListener('click', () => tagInput.select());
    
    let valueInput = clone.getElementsByClassName('value-input')[FIRST];
    valueInput.addEventListener('input', updateTotalValue);
    valueInput.addEventListener('click', () => valueInput.select());
    
    let removeButton = clone.getElementsByClassName('remove-button')[FIRST];
    removeButton.addEventListener('click', () => removeItemById(clone.id));
    
    let copyButton = clone.getElementsByClassName('copy-button')[FIRST];
    copyButton.addEventListener('click', () => copyItemById(clone.id));
    
    listItem.after(clone);
    
    updateTotalValue();
}

function removeItemById(id) {
    let listItem = document.getElementById(id);
    list.removeChild(listItem);
    updateTotalValue();
}

addButton.addEventListener('click', () => {
    let tag = tagInput.value;
    tagInput.value = '';
    
    let value = valueInput.value;
    valueInput.value = '';

    tagInput.focus();
    
    let newItem = new Item(tag, value);
    
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
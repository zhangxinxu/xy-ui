import './xy-button.js';
import './xy-popover.js';

class XyOption extends HTMLElement {
    static get observedAttributes() { return ["value", "selected"]; }
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
            :host{
                display: block;
            }
            .option {
                display: flex;
                height: inherit;
                justify-content: flex-start;
                border-radius:0;
                font-size: inherit;
            }
            :host([selected]) .option{
                color:var(--themeColor,#42b983)
            }
        </style>
        <xy-button id="option" class="option" type="flat"><slot></slot></xy-button>
        `
    }


    connectedCallback() {
        this.option = this.shadowRoot.getElementById('option');
        this.option.addEventListener('click',()=>{
            this.parentNode.value = this.value;
        })
    }

    focus() {
        this.option.focus();
    }

    get value() {
        return this.getAttribute('value');
    }

    /**
     * @param {boolean} value
     */
    set selected(value) {
        if (value) {
            this.setAttribute('selected','');
        } else {
            this.removeAttribute('selected');
        }
    }

}

customElements.define('xy-option', XyOption);

export default class XySelect extends HTMLElement {

    static get observedAttributes() { return ['value', 'show', 'disabled', 'placeholder','type'] }

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        shadowRoot.innerHTML = `
        <style>
        :host{
            position:relative;
            display:inline-block;
            line-height:2.4;
            font-size: 14px;
            z-index: 1;
        }
        :host([block]){
            display:block;
        }
        :host([disabled]){ 
            cursor: not-allowed; 
        }
        :host xy-button{
            height: inherit;
            font-size: inherit;
        }
        /*
        :host(:active:not([disabled])) xy-button{
            border-color:var(--themeColor,#42b983);
            color:var(--themeColor,#42b983);
        }
        */
        :host(:focus-within),:host(:hover){ 
            z-index: 2;
        }
        #select{
            display:flex;
            width:100%;
        }
        #select span{
            flex:1;
            text-align:left;
        }
        .options{
            position:absolute;
            min-width:100%;
            border-radius:3px;
            overflow:hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color:#fff;
            margin-top:5px;
            visibility:hidden;
            transform:scale(0);
            transform-origin: top;
            transition:.3s cubic-bezier(.12, .4, .29, 1.46);
        }
        #select[data-show=true]+.options{
            visibility:visible;
            transform:scale(1);
        }
        #select[data-show=true] .arrow{
            transform:scaleY(-.8);
        }
        .arrow{
            position:relative;
            font-size:.9em;
            transform:scaleY(.8);
            transition: all 0s, transform .3s;
            margin-left:.5em;
            pointer-events:none;
        }
        .placeholder{
            font-style:normal;
            opacity:.6
        }
        xy-popcon{
            min-width:100%;
        }
        
        </style>
        <xy-popover>
            <xy-button id="select" ${this.disabled? "disabled" : ""} ${this.type?("type="+this.type):""}><span id="value"></span><xy-icon class="arrow" name="down"></xy-icon></xy-button>
            <xy-popcon id="options">
                <slot id="slot"></slot>
            </xy-popcon>
        </xy-popover>
        `
    }

    move(dir) {
        const focusIndex = dir + this.focusIndex;
        const current = this.nodes[focusIndex];
        if (current) {
            current.focus();
            this.focusIndex = focusIndex;
        }
    }

    focus() {
        this.select.focus();
    }

    connectedCallback() {
        this.select = this.shadowRoot.getElementById('select');
        this.options = this.shadowRoot.getElementById('options');
        this.slots = this.shadowRoot.getElementById('slot');
        this.txt = this.shadowRoot.getElementById('value');
        this.focusIndex = 0;
        this.addEventListener('keydown', (ev) => {
            if (this.options.open) {
                switch (ev.keyCode) {
                    case 9://Tab
                        ev.preventDefault();
                        break;
                    case 38://ArrowUp
                        this.move(-1);
                        break;
                    case 40://ArrowDown
                        this.move(1);
                        break;
                    case 8://Backspace
                    case 27://Esc
                        this.options.open = false;
                        break;
                    default:
                        break;
                }
            }
        })
        this.slots.addEventListener('slotchange', () => {
            this.nodes = this.querySelectorAll(`xy-option`);
            if (!this.defaultvalue) {
                this.value = this.nodes[0].value;
            } else {
                this.value = this.defaultvalue;
            }
            this.init = true;
        });
    }

    

    get defaultvalue() {
        return this.getAttribute('defaultvalue');
    }

    get value() {
        return this.select.value;
    }

    get text() {
        return this.select.textContent;
    }

    get name() {
        return this.getAttribute('name');
    }

    get type() {
        return this.getAttribute('type');
    }

    get disabled() {
        return this.getAttribute('disabled')!==null;
    }

    set disabled(value) {
        if (value === null || value === false) {
            this.removeAttribute('disabled');
        } else {
            this.setAttribute('disabled', '');
        }
    }

    set defaultvalue(value){
        this.setAttribute('defaultvalue', value);
    }

    set value(value) {
        let textContent = '';
        if (value !== this.value) {
            this.select.value = value;
            const pre = this.querySelector(`xy-option[selected]`);
            if(pre){
                pre.selected = false;
            }
            const cur = this.querySelector(`xy-option[value="${value}"]`);
            cur.selected = true;
            textContent = cur.textContent;
            this.txt.innerText = textContent;
            if(this.init){
                this.dispatchEvent(new CustomEvent('change', {
                    detail: {
                        value: value,
                        text: textContent
                    }
                }));
            }
        }
        this.options.open = false;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'disabled' && this.select) {
            if (newValue != null) {
                this.select.setAttribute('disabled', 'disabled');
            } else {
                this.select.removeAttribute('disabled');
            }
        }
    }
}

if (!customElements.get('xy-select')) {
    customElements.define('xy-select', XySelect);
}
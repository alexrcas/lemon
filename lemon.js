class Lemon {

    constructor(elQuerySelector, data) {
        this._data = data;
        this.customEventListeners = [];

        this.proxyData = new Proxy(this._data, {
            set: (target, key, value) => {
                target[key] = value;
                this.updateView();
                return true;
            }
        });

        this.appDiv = document.querySelector(elQuerySelector);
        this.appDiv.setAttribute("data-template", this.appDiv.innerHTML);

        this.updateView();
    }


    //se hace get y set mediante el proxy en lugar del objeto, así nos enteramos de los cambios y aplicamos un updateView() siempre.
    //una mejora sería introducir en este punto el concepto de DOM virtual.
    get data() {
        return this.proxyData;
    }

    set data(newData) {
        Object.keys(newData).forEach(key => {
            this.proxyData[key] = newData[key];
        });
    }


    render(template, data) {
        // Renderizado de bucles
        template = template.replace(/<(\w+)([^>]*?)data-for="(\w+) of (\w+)"([^>]*?)>([\s\S]*?)<\/\1>/g, (match, tag, beforeAttrs, item, list, afterAttrs, innerTemplate) => {
            if (!data[list]) return '';

            return data[list].map(element => {
                const rendered = this.render(innerTemplate, { ...data, [item]: element });
                return `<${tag}${beforeAttrs}${afterAttrs}>${rendered}</${tag}>`;
            }).join("");

        });

        // Renderizado de plantillas con soporte para propiedades anidadas
        template = template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
            const keys = key.split('.');
            let value = data;
            for (const k of keys) {
                value = value ? value[k] : "";
            }
            return value !== undefined ? value : "";
        });

        return template;
    }

    updateView() {
        const template = this.appDiv.getAttribute("data-template");

        // Guardar el foco actual
        const activeElement = document.activeElement;
        const activeElementId = activeElement && activeElement.getAttribute("data-bind");

        this.appDiv.innerHTML = this.render(template, this.proxyData);

        // Volver a agregar los event listeners para los inputs
        this.bindInputs();

        // Restaurar el foco
        if (activeElementId) {
            const newActiveElement = document.querySelector(`input[data-bind="${activeElementId}"]`);
            if (newActiveElement) {
                newActiveElement.focus();
                // Restaurar la posición del cursor
                const value = newActiveElement.value;
                newActiveElement.value = "";
                newActiveElement.value = value;
            }
        }

        this.applyConditionalRendering();
        this.applyConditionalEnabling();
        this.bindEvents()
    }

    bindInputs() {
        const inputs = document.querySelectorAll("input[data-bind]"); // Seleccionar inputs con el atributo data-bind
        inputs.forEach((input) => {
            const bindKey = input.getAttribute("data-bind");

            // Inicializar el valor del input
            if (input.type === 'checkbox') {
                input.checked = this.proxyData[bindKey];
            } else {
                input.value = this.proxyData[bindKey];
            }

            // Actualizar el objeto de datos
            input.addEventListener('input', () => {
                if (input.type === 'checkbox') {
                    this.proxyData[bindKey] = input.checked;
                } else {
                    this.proxyData[bindKey] = input.value;
                }
            });
        });
    }

    bindEvents() {
        const elements = document.querySelectorAll('[data-click]');
        elements.forEach((element) => {
            const clickExpression = element.getAttribute('data-click');
            const match = clickExpression.match(/^(\w+)\((.*)\)$/);

            if (match) {
                // Caso con parámetros
                const [_, methodName, args] = match;
                const eventHandler = this.proxyData[methodName];

                if (typeof eventHandler === 'function') {
                    element.addEventListener('click', (event) => {
                        const evaluatedArgs = args.split(',').map(arg => {
                            arg = arg.trim();

                            if (arg.startsWith("'") && arg.endsWith("'")) {
                                return arg.slice(1, -1);
                            }

                            if (arg.startsWith('"') && arg.endsWith('"')) {
                                return arg.slice(1, -1);
                            }
                            
                            if (!isNaN(arg)) {
                                return Number(arg);
                            } 
                            
                            const keys = arg.split('.');
                            let value = this.proxyData;
                            for (const k of keys) {
                                value = value ? value[k] : undefined;
                            }
                            
                            return value;
                        });
                        eventHandler.apply(this.proxyData, evaluatedArgs);
                    });
                }
            } else {
                // Caso sin parámetros
                const eventHandler = this.proxyData[clickExpression];

                if (typeof eventHandler === 'function') {
                    element.addEventListener('click', eventHandler.bind(this.proxyData));
                }
            }
        });
    }

    applyConditionalRendering() {
        const elements = document.querySelectorAll('[data-show]'); // Seleccionar elementos con el atributo data-show
        elements.forEach((element) => {
            const bindKey = element.getAttribute("data-show");
            const value = typeof this.proxyData[bindKey] === 'function' ? this.proxyData[bindKey]() : this.proxyData[bindKey];
            if (value) {
                element.style.display = ""; // Mostrar el elemento
            } else {
                element.style.display = "none"; // Esconder el elemento
            }
        });
    }

    applyConditionalEnabling() {
        const elements = document.querySelectorAll('[data-enabled]'); // Seleccionar elementos con el atributo data-enabled
        elements.forEach((element) => {
            const bindKey = element.getAttribute('data-enabled');
            const value = typeof this.proxyData[bindKey] === 'function' ? this.proxyData[bindKey]() : this.proxyData[bindKey];
            element.disabled = !value; // Habilitar o deshabilitar el elemento
        });
    }

}
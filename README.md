# Lemon

Lemon es una pequeña librería para desarrollar aplicando el patrón MVVM o de manera reactiva hecha íntegramente en Vanilla Javascript. Lemon no es apta para producción y está lejos de ser una solución completa o terminada. Se trata únicamente de un pequeño y breve experimento con el mero objetivo del autoaprendizaje y de crear una versión hipersimplificada de las herramientas de moda en la actualidad como React o Vue para comprender mejor su funcionamiento y el propio lenguaje.

## Ejemplo

Se crea una pequeña aplicación para mostrar la librería. El comportamiento de la aplicación es el siguiente:
1. Dispone de un checkbox para ocultar o mostrar los inputs.
2. Dispone de un campo nombre y otro apellido. Solo cuando ambos campos están rellenos el botón para añadir se habilita.
3. Un botón para añadir la persona a la lista.
4. Cada persona dispone de un botón que permite eliminarla de la lista.

![](/doc/example.gif)

Si se conocen herramientas como React, Angular o Vue el código no necesita mayor explicación. Se utilizan atributos personalizados como `data-show`, `data-bind`, `data-for`, `data-click` o `data-enabled`. Las variables se muestran utilizando la sintaxis de doble llave `{{variable}}`.

```html
<div id="app" class="container mt-2">

    <h2 class="alert alert-info">{{saludo}}</h2>
    <div>
        <label for="">Mostrar inputs</label>
        <input type="checkbox" data-bind="mostrarInputs">
    </div>

    (Debe rellenarse nombre y apellido para insertar)
    <div data-show="mostrarInputs" class="mt-2">
        <input type="text" data-bind="nombre" placeholder="Nombre">
        <input type="text" data-bind="apellido" placeholder="Apellido">
        <button data-click="addPersona" class="btn btn-primary" data-enabled=habilitado
            id="addpersona">Añadir</button>

        <div class="row mb-3 mt-2">
            <span><b>Nombre:</b> {{nombre}}</span>
            <span><b>Apellido:</b> {{apellido}}</span>
        </div>
    </div>


    <h6 data-for="el of personas">{{el.nombre}} - {{el.apellido}} <button class="btn btn-danger"
            data-click="eliminar('{{el.id}}')">x</button></h6>

</div>
```


```javascript
const lemon = new Lemon('#app', {
    saludo: "Bienvenido a Lemon!",
    mostrarInputs: true,
    habilitado: function () { return this.nombre != '' && this.apellido != '' },
    nombre: '',
    apellido: '',
    personas: [],

    addPersona: function () {
        lemon.data.personas = [
            ...lemon.data.personas,
            { nombre: lemon.data.nombre, apellido: lemon.data.apellido, id: crypto.randomUUID() }
        ];
        lemon.data.nombre = '';
        lemon.data.apellido = '';
    },

    eliminar: function (id) {
        lemon.data.personas = lemon.data.personas
            .filter(p => p.id != id)
    }
});
```
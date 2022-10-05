//  Variables y selectores
const formulario = document.querySelector('#agregar-gasto')
const gastoListado = document.querySelector('#gastos ul')

// Eventos
eventListeners();
function eventListeners() {
	document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

	formulario.addEventListener('submit', agregarGasto);
}

// Clases
class Presupuesto {
	constructor(presupuesto) {
		this.presupuesto = Number(presupuesto);
		this.restante = Number(presupuesto);
		this.gastos = [];
	}

	nuevoGasto(gasto) {
		this.gastos = [...this.gastos, gasto]
		this.calcularRestante();
	}

	calcularRestante() {
		const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
		this.restante = this.presupuesto - gastado;
	}
	eliminarGasto(id) {
		this.gastos = this.gastos.filter(gasto => gasto.id !== id);
		this.calcularRestante();
	}
}

class UI {
	insertarPresupuesto(cantidad) {
		// Extrayendo valor
		const { presupuesto, restante } = cantidad;

		// Agregar HTML
		document.querySelector('#total').textContent = presupuesto;
		document.querySelector('#restante').textContent = restante;
	}

	imprimirAlerta(mensaje, tipo) {
		//crear div
		const divMensaje = document.createElement('div');
		divMensaje.classList.add('text-center', 'alert');

		if (tipo === 'error') {
			divMensaje.classList.add('alert-danger');
		} if (tipo === 'warning') {
			divMensaje.classList.add('alert-warning');
		} if (tipo === 'info') {
			divMensaje.classList.add('alert-info');
		}
		else {
			divMensaje.classList.add('alert-success');
		}
		//Mensaje de error
		divMensaje.textContent = mensaje;
		//Insertar en HTML
		document.querySelector('.primario').insertBefore(divMensaje, formulario)
		//Quitar el html

		if (mensaje === 'El presupuesto se ha agotado') {

			setTimeout(() => {
				divMensaje.remove();
			}, 5000);
		} else {
			setTimeout(() => {
				divMensaje.remove();
			}, 3000);

		}


	}

	mostrarGastos(gastos) {

		this.limpiarHTML(); //Elimina el HTML previo

		//Iterar sobre los gastos
		gastos.forEach(gasto => {
			const { cantidad, nombre, id } = gasto;
			//Crear li
			const nuevoGasto = document.createElement('li');
			nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
			nuevoGasto.dataset.id = id;

			//Agregar html del gasto
			nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$${cantidad} </span>`;

			///Boton para borrar el gastos
			const btnBorrar = document.createElement('button')
			btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
			btnBorrar.innerHTML = 'Borrar &times';
			btnBorrar.onclick = () => {
				eliminarGasto(id);
			}

			nuevoGasto.appendChild(btnBorrar);

			// Agregar html
			gastoListado.appendChild(nuevoGasto);
		});
	}

	limpiarHTML() {
		while (gastoListado.firstChild) {
			gastoListado.removeChild(gastoListado.firstChild)
		}
	}

	actualizarRestante(restante) {
		document.querySelector('#restante').textContent = restante;
	}

	comprobarPresupuesto(PresupuestoObj) {
		const { presupuesto, restante } = PresupuestoObj;
		const restanteDiv = document.querySelector('.restante')
		const btnAgregar = document.querySelector('.btnAgregar')

		//Comprobar el 25%
		if ((presupuesto / 4) > restante) {
			restanteDiv.classList.remove('alert-success', 'alert-warning');
			restanteDiv.classList.add('alert-danger')
		} else if ((presupuesto / 2) > restante) { //Comprueba mas del 50%
			restanteDiv.classList.remove('alert-success', 'alert-danger');
			restanteDiv.classList.add('alert-warning')
		} else {  //Esenario de renbolso 
			restanteDiv.classList.remove('alert-danger', 'alert-warning');
			restanteDiv.classList.add('alert-success')
		}

		//Si el total es 0 o menor a 0 

		if (restante <= 0) {
			ui.imprimirAlerta('El presupuesto se ha agotado', 'warning')
			formulario.querySelector('button[type="submit"]').disabled = true;
			btnAgregar.classList.remove('btn-primary');
			btnAgregar.classList.add('btn-secondary');
		} else {
			// ui.imprimirAlerta('Tienes presupuesto', 'info');
			formulario.querySelector('button[type="submit"]').disabled = false;
			btnAgregar.classList.add('btn-primary');
			btnAgregar.classList.remove('btn-secondary');
		}
	}
}
// Instanciar 
const ui = new UI();
let presupuesto;

// Funciones
function preguntarPresupuesto() {
	const presupuestoUsuario = prompt('¿Cuál es  tu presupuesto?')

	if (presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
		window.location.reload();
	}

	//Presupuesto valido
	presupuesto = new Presupuesto(presupuestoUsuario);
	console.log(presupuesto);

	ui.insertarPresupuesto(presupuesto);
}

// Añade gastos
function agregarGasto(e) {
	e.preventDefault();

	// Leer los datos del formulario
	const nombre = document.querySelector('#gasto').value;
	const cantidad = Number(document.querySelector('#cantidad').value);

	//Validar
	if (nombre === '' || cantidad === '') {
		ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
		return;
	} else if (cantidad <= 0 || isNaN(cantidad)) {
		ui.imprimirAlerta('Cantidad no valida', 'error');
		return;
	}
	// Generar un objeto con el gasto
	const gasto = { nombre, cantidad, id: Date.now() } // Mejoria del objeto literal   Object Literal engandment

	// Añade un nuevo gasto 
	presupuesto.nuevoGasto(gasto);
	ui.imprimirAlerta('Gasto agregado correctamente', 'success');

	// Imprimir los gastos
	const { gastos, restante } = presupuesto;
	ui.mostrarGastos(gastos);

	ui.actualizarRestante(restante);

	ui.comprobarPresupuesto(presupuesto);

	//Reinicia formulario
	formulario.reset();

}

function eliminarGasto(id) {
	//Elimina los gastos de la clase o el objeto
	presupuesto.eliminarGasto(id);

	//Elimina los gastos del HTML
	const { gastos, restante } = presupuesto;
	ui.mostrarGastos(gastos);

	ui.actualizarRestante(restante);

	ui.comprobarPresupuesto(presupuesto);
}
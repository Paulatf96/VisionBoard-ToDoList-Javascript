const validationLocalStorage = (nameData) => {
  let savedInfo = localStorage.getItem(nameData);
  if (savedInfo && JSON.parse(savedInfo).length) {
    return JSON.parse(savedInfo);
  }
};

let today = new Date();
let currentGoal = {};
let currentTask = {};
let currentAim = {};
let initId = validationLocalStorage("id") || 0;
let tasks = validationLocalStorage("saveTasks") || [];
let aimsMonth = validationLocalStorage("saveAims") || [];
let goals = validationLocalStorage("save") || [];

if (goals.length) {
  print(goals);
}

const initialize = () => {
  getMonts();
  getInputsGoals();
  createBoard();
};

const getMonts = () => {
  try {
    fetch("/src/models/info.json")
      .then((respuesta) => respuesta.json())
      .then((months) => printMonths(months));
  } catch (error) {
    console.log("Error cargando info", error);
  }
};

const getInputsGoals = () => {
  let textGoal = document
    .getElementById("valueVision")
    .addEventListener("change", function () {
      currentGoal["valueVision"] = this.value;
    });
  let imgGoal = document
    .getElementById("imgVision")
    .addEventListener("change", function () {
      imgGoal = this.value;
      validateURL(imgGoal);
    });

  let dateGoal = document
    .getElementById("dateVision")
    .addEventListener("input", function () {
      currentGoal["dateGoal"] = this.value;
    });

  let inputsCategories = document.querySelectorAll(".categoria");

  for (const input of inputsCategories) {
    input.addEventListener("click", {});
  }

  let saveButon = document
    .getElementById("saveGoal")
    .addEventListener("click", (e) => recorrer(e, inputsCategories, true));

  let addButon = document
    .getElementById("addAims-goalsForm")
    .addEventListener("click", () => drawInputsAddAims());
};

const validateURL = (imgGoal) => {
  let urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
  if (urlPattern.test(imgGoal)) {
    currentGoal["imgVision"] = imgGoal;
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "No es una URL válida para tu imagen, ingrésala nuevamente!",
    });
  }
};

//Función que recorre los input de las categorias  para tomar el valor y se va a la función save ya sea de goal o de task
function recorrer(e, inputsCategories, validation) {
  e.preventDefault();
  inputsCategories.forEach((input) => {
    if (input.checked) {
      if (validation) {
        currentGoal["tittle"] = input.defaultValue;
        currentGoal["category"] = input.id;
        saveGoal();
      }
    }
  });
}

const drawInputsAddAims = () => {
  let containerCreateAims = document.getElementById("aims-goals-form");
  let divAims = document.createElement("div");

  let selectHTML = `<select class="form-select monthSelect" id="monthSelect-${
    aimsMonth.length || 0
  }" aria-label="Floating label select example">`;
  selectHTML += `<option selected>Selecciona un mes</option>`;

  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  months.forEach((month, index) => {
    selectHTML += `<option value="${month}" id="${month}">${
      month.charAt(0).toUpperCase() + month.slice(1)
    }</option>`;
  });
  selectHTML += `</select>`;

  divAims.innerHTML =
    selectHTML +
    `<label for="aim">Objetivo para este mes</label><input type="text" id="aim-${
      aimsMonth.length || 0
    }" class="aim" value="" placeholder="4 horas semanales de inglés" disabled/>`;
  containerCreateAims.appendChild(divAims);

  document
    .getElementById(`monthSelect-${aimsMonth.length || 0}`)
    .addEventListener("change", function (option) {
      currentAim["month"] = this.value;
      document.getElementById(`aim-${aimsMonth.length || 0}`).disabled = false;
    });

  document
    .getElementById(`aim-${aimsMonth.length || 0}`)
    .addEventListener("change", function (option) {
      currentAim["aimsValue"] = this.value;
      currentAim["vision"] = currentGoal["valueVision"];
      if (currentAim["month"] && currentAim["aimsValue"]) {
        aimsMonth.push(currentAim);
        currentAim = {};
      }
    });
};

//Guarda metas
function saveGoal() {
  if (
    currentGoal["valueVision"] &&
    currentGoal["imgVision"] &&
    currentGoal["category"] &&
    currentGoal["dateGoal"] &&
    goals.length < 7
  ) {
    goals.push(currentGoal);
    currentGoal = {};
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "No es posible ingresar esta meta",
    });
  }
  saveInLocalStorage(goals, "save");
  print(goals);
  let containerCreateAims = document.getElementById("aims-goals-form");
  containerCreateAims.innerHTML += "";
  saveInLocalStorage(aimsMonth, "saveAims");
}
//Imprime tarjeta de metas

function print(array, type) {
  let board = document.getElementById("board");
  board.innerHTML = "";

  let container = document.createElement("div");
  container.id = "container"; // Agregar ID al contenedor principal

  let condition;
  if (type == "template1") {
    container.classList.add("template1"); // Agregar clase al contenedor principal
    condition = 6;
  } else {
    container.classList.add("template2"); // Agregar clase al contenedor principal
    condition = 4;
  }

  let i = 0;
  while (i < condition) {
    if (array[i]) {
      let box = document.createElement("div");
      box.className = "boxGoals";
      box.className += ` box-${i}`;
      box.innerHTML = `<div class="container-goal">
        <img class="img-goal" src=${array[i].imgVision} alt=${array[i].valueVision}/>
        <div class="container-info-goal">
          <div class="info-goal">
            <p><strong>Meta: </strong> ${array[i].valueVision}</p>
            <p><strong>Categoría:</strong> ${array[i].tittle}</p>
            <p><strong>Mes:</strong> ${array[i].dateGoal}</p>
          </div>
          <img src="src/public/assets/trashIcon.png" class="delete-goal" id=${i} width={10} height={10} />
        </div>
      </div>`;

      container.appendChild(box);
    } else {
      let box = document.createElement("div");
      box.className = "boxGoals";
      box.className += ` box-${i}`;
      box.innerHTML = `<button
        type="button"
        class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#create"
        id="createGoal"
      >   +  </button>    `;

      container.appendChild(box);
    }

    i++;

    board.appendChild(container);
  }

  let divButton = document.createElement("div");
  divButton.innerHTML = `<button id="deleteVisionBoard" class="btn btn-primary">Limpiar Vision Board</button>`;
  divButton.className = "container-button";
  board.appendChild(divButton);

  let deleteVisionBoard = document
    .getElementById("deleteVisionBoard")
    .addEventListener("click", () => deleteBoard());
  /* document.getElementById("goalsForm").reset(); */

  initDeleteButtons(array, type);
}

function initDeleteButtons(array, type) {
  let deleteButtons = document.getElementsByClassName("delete-goal");
  for (const button of deleteButtons) {
    button.addEventListener("click", (e) => {
      goals.splice(parseInt(e.target.id), 1);
      console.log(goals);
      saveInLocalStorage(goals, "save");
      print(array, type);
    });
  }
}

//Borrar todo el tablero
function deleteBoard() {
  let board = document.getElementById("board");
  board.innerHTML = "";
  goals = [];
  aimsMonth = [];
  tasks = [];
  saveInLocalStorage(goals, "save");
  saveInLocalStorage(aimsMonth, "saveAims");
  saveInLocalStorage(tasks, "saveTasks");
}
// Obtiene con fetch el JSON de meses y lo imprime en pantalla
function printMonths(months) {
  let container = document.getElementById("months");
  for (let i = 0; i < months.length; i++) {
    let card = document.createElement("div");
    card.classList = "cardMonth col-2 ";
    card.id = months[i].id;
    let abbreviatedMonth = months[i].text.substring(0, 3);
    card.innerHTML = `<div class="card-header" id=${months[i].id} > ${abbreviatedMonth}</div>`;
    
    container.appendChild(card);
  }
  let divsMonths = document.getElementsByClassName("cardMonth");

  for (let div of divsMonths) {
    div.addEventListener("click", (e) => seeMonth(e, divsMonths));
  }
}
function saveInLocalStorage(array, name) {
  let saveInfo = JSON.stringify(array);
  localStorage.setItem(name, saveInfo);
}

//Función que imprime barra lateral según el mes seleccionado
function seeMonth(e, divsMonths) {
  for (let div of divsMonths) {
    div.classList.remove("active");
  }
  let selectMonth = document.getElementById(e.target.id);
  selectMonth.classList.toggle("active");

  let container = document.getElementById("sideBar");
  container.innerHTML = "";
  let id = e.target.id;
  let div = document.createElement("div");
  div.innerHTML = ` 
  <div id=aims><div class="headerGoals"> 
    <h3>Objetivos para este mes</h3>
    <!-- modal -->
    <button type="button" class="btn btn-primary"  data-bs-toggle="modal"  data-bs-target="#exampleModal1" id="createAims">Crear Objetivo</button>
    <div
      class="modal fade" id="exampleModal1" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Crear Objetivo</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="aimsForm">
              <label for="valueAims">Ingresa tu objetivo</label>
              <input type="text" id="valueAims" value="" placeholder="Inscribirme al gym" />
            </form>
            <select class="form-select categorySelect" id="categorySelect" aria-label="Floating label select example">
                <option selected>Selecciona una categoría</option>
                <option value="laboral" id="laboral">Laboral</option>
                <option value="social" id="social">Social</option>
                <option value="economia" id="economia">Economía</option>
                <option value="crecimiento" id="crecimiento">Crecimiento</option>
            </select>
          </div>
          <div class="modal-footer">
            <button
              type="button" class="btn btn-secondary" data-bs-dismiss="modal" >Close</button>
            <div class="container-button">
              <button type="button" id="saveAim" class="btn btn-primary" data-bs-dismiss="modal">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    <div id="aimsOfMonth">
     
      <div id="goalsInProcess"></div>
    </div>
  </div>
  </div>

  <div id="tasks">
    <div class="cardWeek">
      <div class="cardTitle">
        <h5>Semana 1   </h5>
        <button id="1" class="buttonTaks">+</button>
        </div>
        <div id="semanaTask1"></div>
        <div id="semana1"></div>
    </div>
    <div class="cardWeek">
      <div class="cardTitle">
        <h5>Semana 2</h5>
        <button id="2" class="buttonTaks">+</button>
      </div>
      <div id="semanaTask2"></div>
      <div id="semana2"></div>
    </div>
    <div class="cardWeek">
      <div class="cardTitle">
        <h5>Semana 3</h5>
        <button id="3" class="buttonTaks">+</button>
      </div>
      <div id="semanaTask3"></div>
      <div id="semana3"></div>
    </div>
    <div class="cardWeek">
      <div class="cardTitle">
        <h5>Semana 4</h5>
        <button id="4" class="buttonTaks">+</button>
      </div>
      <div id="semanaTask4"></div>
      <div id="semana4"></div>
    </div>
 `;
  container.appendChild(div);

  let aimsContainer = document.getElementById("aimsOfMonth");
  let aimsFilter = aimsMonth.filter((aim) => aim["month"] == id);
  if (aimsFilter.length > 0) {
    for (let aim of aimsFilter) {
      aimsContainer.innerHTML += `<li>${aim.aimsValue} - (${
        aim.vision ? aim.vision : aim.category
      })</li>`;
    }
  } else {
    aimsContainer.innerHTML =
      "<p>Este mes no tienes objetivos propuestos pero tienes metas por cumplir </p>";
  }

  initInputsCreateAim(id, e);
  initButtonSaveTask(id);
  printTask(id);
}

const initInputsCreateAim = (id, e) => {
  document
    .getElementById("valueAims")
    .addEventListener("change", function (option) {
      currentAim["month"] = id;
      currentAim["aimsValue"] = this.value;
    });

  let categoryAim = document.getElementById("categorySelect");
  categoryAim.addEventListener("change", function (option) {
    currentAim["category"] = option.target.value;
  });
  document.getElementById("saveAim").addEventListener("click", function () {
    if (currentAim["category"] && currentAim["aimsValue"]) {
      aimsMonth.push(currentAim);
      saveInLocalStorage(aimsMonth, "saveAims");
      currentAim = [];
      seeMonth(e);
    } else {
      Swal.fire({
        icon: "info",
        title: "Oops...",
        text: "Aún te faltan datos!",
      });
    }
  });
};

const initButtonSaveTask = (id) => {
  let buttonsTask = document.getElementsByClassName("buttonTaks");

  for (let i = 0; i < buttonsTask.length; i++) {
    buttonsTask[i].addEventListener("click", function () {
      let addTaskContainer = document.getElementById(
        `${"semanaTask" + (i + 1)}`
      );
      let divTask = document.createElement("div");
      divTask.innerHTML = `<input type="text" id="task-${
        tasks.length || 0
      }" class="tasks" 
    value="" placeholder="Escribe tu tarea"/>`;
      addTaskContainer.appendChild(divTask);
      document
        .getElementById(`task-${tasks.length || 0}`)
        .addEventListener("change", function () {
          currentTask["month"] = id;
          currentTask["week"] = `${"semana" + (i + 1)}`;
          currentTask["taskValue"] = this.value;
          tasks.push(currentTask);
          currentTask = {};
          addTaskContainer.innerHTML = "";
          saveInLocalStorage(tasks, "saveTasks");
          printTask(id);
        });
    });
  }
};

function printTask(id) {
  let containerTask1 = document.getElementById("semana1");
  containerTask1.innerHTML = "";
  let containerTask2 = document.getElementById("semana2");
  containerTask2.innerHTML = "";
  let containerTask3 = document.getElementById("semana3");
  containerTask3.innerHTML = "";
  let containerTask4 = document.getElementById("semana4");
  containerTask4.innerHTML = "";
  let taskMonthFilter = tasks.filter((task) => task.month == id);
  taskMonthFilter.forEach(function (task) {
    switch (task.week) {
      case "semana1":
        containerTask1.innerHTML += `<div class="listTaks"><li>${task.taskValue}</li>
      <input id="${task.taskValue}" class="checkTask" type="checkbox"/> </div>`;
        break;
      case "semana2":
        containerTask2.innerHTML += `<div class="listTaks"><li>${task.taskValue}</li>
      <input id="${task.taskValue}" class="checkTask" type="checkbox"/> </div>`;
        break;
      case "semana3":
        containerTask3.innerHTML += `<div class="listTaks"><li>${task.taskValue}</li>
      <input id="${task.taskValue}" class="checkTask" type="checkbox"/> </div>`;
        break;
      default:
        containerTask4.innerHTML += `<div class="listTaks"><li>${task.taskValue}</li>
      <input id="${task.taskValue}" class="checkTask" type="checkbox"/> </div>`;
        break;
    }
  });
}

const createBoard = () => {
  document.getElementById("createBoard").addEventListener("click", function () {
    const templates = document.getElementById("boardTemplate");
    templates.classList.toggle("show");
  });

  const imgTemplates = document.getElementsByClassName("imgTemplate");
  console.log(imgTemplates);
  for (const img of imgTemplates) {
    img.addEventListener("click", (e) => {
      print(goals, e.target.id);
    });
  }
};

initialize();

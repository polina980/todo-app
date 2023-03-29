// создаем и возвращаем загловок приложения
function createAppTitle(title) {
  let appTitle = document.createElement('h2');
  appTitle.textContent = title;
  return appTitle;
}

// создаем и возвращаем форму для создания дела
function createTodoItemForm() {
  let form = document.createElement('form');
  let input = document.createElement('input');
  let buttonWrapper = document.createElement('div');
  let button = document.createElement('button');

  form.classList.add('input-group', 'mb-3');
  input.classList.add('form-control');
  input.placeholder = 'Введите название нового дела';
  buttonWrapper.classList.add('input-group-append');
  button.classList.add('btn', 'btn-primary');
  button.textContent = 'Добавить дело';
  button.disabled = true;

  input.addEventListener('input', function () {
    if (input.value.length > 0) {
      button.disabled = false;
    }
  })

  buttonWrapper.append(button);
  form.append(input, buttonWrapper);

  return {
    form,
    input,
    button
  };
}

// создаем и возвращаем список элементов
function createTodoList() {
  let list = document.createElement('ul');
  list.classList.add('list-group');
  return list;
}

// создаем и возвращаем элемент списка
function createTodoItemElement(todoItem, { onDone, onDelete }) {
  let item = document.createElement('li');
  // кнопки помещаем в элемент, который покажет их в одной группе
  let buttonGroup = document.createElement('div');
  let doneButton = document.createElement('button');
  let deleteButton = document.createElement('button');

  // устанавливаем стили для элемента списка, а также для размещения кнопок
  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
  item.textContent = todoItem.name;
  item.id = Math.floor((Math.random() * (1000 - 1 + 1)) + 1);

  buttonGroup.classList.add('btn-group', 'btn-group-sm');
  doneButton.classList.add('btn', 'btn-success');
  doneButton.textContent = 'Готово';
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.textContent = 'Удалить';

  if (todoItem.done) {
    item.classList.add('list-group-item-success');
  }

  // добавляем обработчики на кнопки
  function changeDoneStatus(item, button) {
    button.addEventListener('click', function () {
      onDone({ todoItem, element: item });
      item.classList.toggle('list-group-item-success');
    })
  };

  function confirmDelete(item, button) {
    button.addEventListener('click', function () {
      onDelete({ todoItem, element: item });
    })
  };

  changeDoneStatus(item, doneButton);
  confirmDelete(item, deleteButton);

  // вкладываем кнопки в отдельный элемент, чтобы они объединились в один блок
  buttonGroup.append(doneButton, deleteButton);
  item.append(buttonGroup);

  // приложению нужен доступ к самому элементу и кнопкам, чтобы обрабатывать события нажатия
  return item;
}

async function createTodoApp(container, title = 'Список дел', owner) {
  let todoAppTitle = createAppTitle(title);
  let todoItemForm = createTodoItemForm();
  let todoList = createTodoList();

  const handlers = {
    onDone({ todoItem }) {
      todoItem.done = !todoItem.done;
      fetch(`http://localhost:3000/api/todos/${todoItem.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: todoItem.done }),
        headers: {
          'Content-Type': 'application/json'
        },
      });
    },
    onDelete({ todoItem, element }) {
      if (confirm('Вы уверены?')) {
        element.remove();
        fetch(`http://localhost:3000/api/todos/${todoItem.id}`, {
          method: 'DELETE',
        });
        if (response.status === 404)
          console.log('Не удалось удалить дело, так как его не существует');
      }
    }
  }

  container.append(
    todoAppTitle,
    todoItemForm.form,
    todoList
  );

  const response = await fetch(`http://localhost:3000/api/todos?owner=${owner}`);
  const todoItemList = await response.json();

  todoItemList.forEach((todoItem) => {
    const todoItemElement = createTodoItemElement(todoItem, handlers);
    todoList.append(todoItemElement);
  })

  todoItemForm.form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!todoItemForm.input.value) {
      return;
    }

    const response = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: todoItemForm.input.value.trim(),
        owner
      })
    });

    const todoItem = await response.json();
    const todoItemElement = createTodoItemElement(todoItem, handlers);

    todoList.append(todoItemElement);
    todoItemForm.input.value = '';
    todoItemForm.button.disabled = true;
  });
}

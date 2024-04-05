import { v4 as uuidV4 } from "uuid";
import { setItem, getItem } from "./locals";
const elForm = document.getElementById("form") as HTMLFormElement
const elInputCreateTodo: HTMLInputElement | null = document.querySelector("#create-todo")
const todosLocals: string | null = getItem("todos")
const elTemplate: HTMLTemplateElement | null = document.querySelector("template")
const elTodoList = document.querySelector(".todo-list") as HTMLUListElement
const elFilterButtons: NodeList = document.querySelectorAll(".todo-settings__btn")

let todos: any[] = todosLocals ? JSON.parse(todosLocals) : []
interface todo {
  name: string,
  id: string,
  isComplete: boolean
}
interface todoArr extends Array<todo> { }
function handleRenderTodo(arr: todoArr): void {
  if (arr?.length > 0) {
    if (elTemplate) {
      let templateContent = elTemplate?.content as DocumentFragment
      elTodoList.innerHTML = ""
      for (let i = 0; i < arr.length; i++) {
        let clone = templateContent.cloneNode(true) as DocumentFragment
        let todoText = clone.querySelector(".todo-list__input") as HTMLInputElement
        let deleteBtn = clone.querySelector(".delete-btn")?.querySelector('i') as HTMLElement
        let elCheckBox = clone.querySelector("#checkbox") as HTMLInputElement
        let editBtn = clone.querySelector(".edit-btn")?.querySelector("i") as HTMLElement
        if (todoText) {
          todoText.dataset.id = arr[i].id
          todoText.value = arr[i]?.name
          if (arr[i].isComplete) {
            todoText.style.textDecoration = "line-through"
          } else {
            todoText.style.textDecoration = "none"
          }
        }
        if (deleteBtn && editBtn && elCheckBox) {
          deleteBtn.dataset.id = arr[i]?.id;
          editBtn.dataset.id = arr[i]?.id;
          editBtn.addEventListener('click', handleEdit);
          deleteBtn.addEventListener("click", handleDelete);
          elCheckBox.dataset.id = arr[i].id
          elCheckBox.checked = arr[i].isComplete
          elCheckBox.addEventListener('change', handleChecked)
        }
        elTodoList?.append(clone)
      }
    }
  } else {
    elTodoList.innerHTML = ""
    let errorText: HTMLHeadingElement = document.createElement("h1")
    errorText.textContent = "Not your todo"
    errorText.style.textAlign = "center"
    errorText.style.color = "red"
    elTodoList.append(errorText)
  }
}
function createTodo(event: Event): void {
  event.preventDefault()
  let value: string = elInputCreateTodo?.value as string
  let todoId: string = uuidV4()
  const createTodo: todo = {
    name: value,
    id: todoId,
    isComplete: false
  }
  todos = [...todos, createTodo]
  handleRenderTodo(todos)
  setItem("todos", todos)
  if (elInputCreateTodo) {
    elInputCreateTodo.value = ""
  }
}
elForm.addEventListener("submit", createTodo)
function handleChecked(e: Event) {
  let elEventCheckbox = e.target as HTMLInputElement
  let elCheckBoxId: string | undefined = elEventCheckbox.dataset.id
  let checkBoxIndex: number = todos.findIndex((item) => item.id === elCheckBoxId)
  todos[checkBoxIndex].isComplete = elEventCheckbox.checked
  setItem("todos", todos)
  handleRenderTodo(todos)
}
function handleEditKeyUp(e: Event) {
  let elEventInput = e.target as HTMLInputElement
  let eventId: string | undefined = elEventInput.dataset.id
  let editTarget: number = todos.findIndex(item => item.id === eventId)
  let eventValue: string = elEventInput.value
  todos[editTarget].name = eventValue
  todos[editTarget].isComplete = false
  setItem("todos", todos)
  handleRenderTodo(todos)
}
function handleEdit(e: Event) {
  let dataId: string | undefined = (e.target as HTMLElement).dataset.id
  let elEditInputs: NodeList = elTodoList.querySelectorAll(".todo-list__input")
  elEditInputs.forEach((item) => {
    let elNodeListInput = item as HTMLInputElement
    let eLInputId: string | undefined = elNodeListInput.dataset.id
    if (dataId === eLInputId) {
      elNodeListInput.disabled = false;
      elNodeListInput.readOnly = false;
      elNodeListInput.autofocus = true;
      elNodeListInput.addEventListener("change", handleEditKeyUp);
    } else {
      elNodeListInput.disabled = true
      elNodeListInput.readOnly = false
      elNodeListInput.autofocus = false
    }

  })
}
function handleDelete(e: Event): void {
  let id: string | undefined = (e.target as HTMLElement).dataset.id
  let idx: number = todos.findIndex(item => item.id === id)
  todos.splice(idx, 1)
  setItem("todos", todos)
  handleRenderTodo(todos)
}
function handleFilter(e: Event) {
  let buttonTarget = e.target as HTMLButtonElement
  let buttonTargetHtmlId: string = buttonTarget.id
  if (buttonTargetHtmlId === "all") {
    handleRenderTodo(todos)
  } else if (buttonTargetHtmlId === "complete") {
    let completeArray: any[] = todos.filter(item => item.isComplete === true)
    if (buttonTarget) {
      buttonTarget.classList.add(('text-light'), "btn-primary")
    }
    handleRenderTodo(completeArray)
  } else if (buttonTargetHtmlId === "notcomplete") {
    let completeArray: any[] = todos.filter(item => item.isComplete === false)
    buttonTarget.classList.add(('text-light'), "btn-primary")
    handleRenderTodo(completeArray)
  }
}
elFilterButtons.forEach(button => {
  button.addEventListener('click', handleFilter)
})
handleRenderTodo(todos)

import { LightningElement, wire } from 'lwc';
import getAllTodoTasks from '@salesforce/apex/TodoApp_CRUD.getAllTodoTasks';

export default class TodoListComponent extends LightningElement {
    title = 'Todo List';
    @wire(getAllTodoTasks) todoTasks;


}
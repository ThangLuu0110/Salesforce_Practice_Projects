import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllTodoTasks from '@salesforce/apex/TodoApp_CRUD.getAllTodoTasks';
import addNewTodoTask from '@salesforce/apex/TodoApp_CRUD.addNewTodoTask';
import deleteTodoTask from '@salesforce/apex/TodoApp_CRUD.deleteTodoTask';

export default class TodoListComponent extends LightningElement {
    dateOfToday = new Date().toISOString().split('T')[0];
    title = 'Todo List';
    todoTasksLists = [];
    @track taskNameValue = '';
    @track taskDeadline = '';

    @wire(getAllTodoTasks) todoTasks(results, error) {
        if (results) {
            this.todoTasksLists = results;
        } else if (error) {
            console.error('Error fetching todo tasks:', error);
        }
    }

    addNewTask() {
        const taskName = this.template.querySelector('.taskList_form-input.taskName').value;
        const taskDeadline = this.template.querySelector('.taskList_form-input.taskDeadline').value;

        this.handleResetValues();
        addNewTodoTask({ taskName, taskDeadline })
        .then(() => {
            return refreshApex(this.todoTasksLists);
        })
        .catch((error) => {
            console.error('Error adding new task:', error);
        })
    }
    
    deleteTask(event) {
       const taskId = event.target.dataset.id;

       deleteTodoTask({ taskId })
       .then(() => {
           return refreshApex(this.todoTasksLists);
       })
       .catch((error) => {
           console.error('Error deleting task:', error);
       });
    }


    handleTaskNameChange(event) {   
        this.taskNameValue = event.target.value;
    }

    handleDeadlineChange(event) {
        this.taskDeadline = event.target.value;
        
    }

    handleResetValues() {
        console.log('Resetting values');
        this.taskNameValue = '';
        this.taskDeadline = '';
    }
}
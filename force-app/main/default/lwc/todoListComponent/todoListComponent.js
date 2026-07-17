import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllTodoTasks from '@salesforce/apex/TodoApp_CRUD.getAllTodoTasks';
import addNewTodoTask from '@salesforce/apex/TodoApp_CRUD.addNewTodoTask';

export default class TodoListComponent extends LightningElement {
    title = 'Todo List';
    todoTasksLists = [];
    @track taskNameValue = '';
    @track startDateValue = '';

    @wire(getAllTodoTasks) todoTasks(results, error) {
        if (results) {
            this.todoTasksLists = results;
        } else if (error) {
            console.error('Error fetching todo tasks:', error);
        }
    }

    addNewTask() {
        const taskName = this.template.querySelector('.taskName').value;
        const startDate = this.template.querySelector('.startDate').value;

        this.handleResetValues();
        addNewTodoTask({ taskName, startDate })
        .then(() => {
            return refreshApex(this.todoTasksLists);
        })
        .catch((error) => {
            console.error('Error adding new task:', error);
        })
    }   


    handleTaskNameChange(event) {   
        this.taskNameValue = event.target.value;
    }

    handleStartDateChange(event) {
        this.startDateValue = event.target.value;
        
    }

    handleResetValues() {
        console.log('Resetting values');
        this.taskNameValue = '';
        this.startDateValue = '';
    }
}
import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllTodoTasks from '@salesforce/apex/TodoApp_CRUD.getAllTodoTasks';
import addNewTodoTask from '@salesforce/apex/TodoApp_CRUD.addNewTodoTask';
import deleteTodoTask from '@salesforce/apex/TodoApp_CRUD.deleteTodoTask';
import updateTodoTask from '@salesforce/apex/TodoApp_CRUD.updateTodoTask';

export default class TodoListComponent extends LightningElement {
    dateOfToday = new Date().toISOString().split('T')[0];
    title = 'Todo List';
    todoTasksLists = [];
    selectedTaskId = null;
    isUpdateMode = false;
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

    handleEditTask(event) {
        const taskId = event.currentTarget.dataset.id;
        const selectedTask = this.todoTasksLists.data?.find((task) => task.Id === taskId);

        if (selectedTask) {
            this.taskNameValue = selectedTask.Name;
            this.taskDeadline = selectedTask.Tasks_Deadline__c;
            this.isUpdateMode = true;
            this.selectedTaskId = taskId;
        }

    }

    updateTask() {
        const taskName = this.template.querySelector('.taskList_form-input.taskName').value;
        const taskDeadline = this.template.querySelector('.taskList_form-input.taskDeadline').value;

        this.handleResetValues();
        updateTodoTask({ taskId: this.selectedTaskId, taskName, taskDeadline })
        .then(() => {
            this.isUpdateMode = false;
            return refreshApex(this.todoTasksLists);
        })
        .catch((error) => {
            console.error('Error updating task:', error);
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